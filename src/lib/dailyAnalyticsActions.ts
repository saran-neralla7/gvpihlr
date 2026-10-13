"use server";

import prisma from "./prisma";
import { getCurrentSession } from "./auth";
import { RoleType } from "@prisma/client";

export interface HourlySessionStat {
  sessionId: string;
  periodNumber: number;
  subjectName: string;
  subjectCode: string;
  subjectShortName: string;
  subjectType: string;
  facultyName: string;
  facultyShortName: string;
  sessionType: string;
  labBatchName: string | null;
  totalMarked: number;
  presentCount: number;
  absentCount: number;
  percentage: number;
  absentStudents: {
    rollNumber: string;
    fullName: string;
  }[];
}

export interface SectionDayStat {
  sectionId: string;
  sectionName: string;
  displayName: string;
  programName: string;
  programCode: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  year: number;
  semester: number;
  totalEnrolled: number;
  isMarked: boolean;
  distinctPresentCount: number;
  distinctAbsentCount: number;
  dayPercentage: number;
  totalPeriodsConducted: number;
  hourlyStats: HourlySessionStat[];
}

export interface DailyAnalyticsResult {
  success: boolean;
  error?: string;
  selectedDate: string; // YYYY-MM-DD
  availableDates: {
    date: string;
    label: string;
    sessionCount: number;
  }[];
  summary: {
    totalSections: number;
    conductedSections: number;
    totalEnrolledOverall: number;
    totalPresentOverall: number;
    totalAbsentOverall: number;
    overallPercentage: number;
    totalSessionsOverall: number;
  };
  sections: SectionDayStat[];
  schools: {
    id: string;
    name: string;
    code: string;
  }[];
}

export async function getDailyAttendanceAnalytics(
  targetDateStr?: string
): Promise<DailyAnalyticsResult> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
      selectedDate: "",
      availableDates: [],
      summary: {
        totalSections: 0,
        conductedSections: 0,
        totalEnrolledOverall: 0,
        totalPresentOverall: 0,
        totalAbsentOverall: 0,
        overallPercentage: 0,
        totalSessionsOverall: 0,
      },
      sections: [],
      schools: [],
    };
  }

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN");
  const isOffice = session.roles.includes("OFFICE");
  const isAcademicAdmin =
    session.roles.includes("ACADEMIC_ADMIN") || session.roles.includes("DEAN");

  if (!isSuperAdmin && !isOffice && !isAcademicAdmin) {
    return {
      success: false,
      error: "Access denied. Only Super Admin, Incharge, and Office users can access day-wise analytics.",
      selectedDate: "",
      availableDates: [],
      summary: {
        totalSections: 0,
        conductedSections: 0,
        totalEnrolledOverall: 0,
        totalPresentOverall: 0,
        totalAbsentOverall: 0,
        overallPercentage: 0,
        totalSessionsOverall: 0,
      },
      sections: [],
      schools: [],
    };
  }

  const hasSchoolScope = !!(
    session.allowedSchoolIds && session.allowedSchoolIds.length > 0
  );
  const scopedSchoolIds = session.allowedSchoolIds || [];

  // 1. Fetch available recent dates that have attendance sessions
  const recentDateGroups = await prisma.attendanceSession.groupBy({
    by: ["sessionDate"],
    _count: { id: true },
    where: hasSchoolScope
      ? {
          section: {
            program: { schoolId: { in: scopedSchoolIds } },
          },
        }
      : undefined,
    orderBy: { sessionDate: "desc" },
    take: 25,
  });

  const availableDates = recentDateGroups.map((d) => {
    const iso = d.sessionDate.toISOString().split("T")[0];
    const dateObj = new Date(d.sessionDate);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });
    const dayNum = dateObj.getDate().toString().padStart(2, "0");
    const yearNum = dateObj.getFullYear();

    return {
      date: iso,
      label: `${dayNum} ${monthName} ${yearNum} (${dayName})`,
      sessionCount: d._count.id,
    };
  });

  // Determine target date
  let selectedDateStr = targetDateStr;
  if (!selectedDateStr && availableDates.length > 0) {
    selectedDateStr = availableDates[0].date;
  }
  if (!selectedDateStr) {
    selectedDateStr = new Date().toISOString().split("T")[0];
  }

  const selectedDateObj = new Date(`${selectedDateStr}T00:00:00.000Z`);

  // 2. Fetch sections under scope
  const sectionsDb = await prisma.section.findMany({
    where: {
      isActive: true,
      ...(hasSchoolScope
        ? { program: { schoolId: { in: scopedSchoolIds } } }
        : {}),
    },
    include: {
      program: {
        include: { school: true },
      },
      enrollments: {
        where: { isCurrent: true },
        select: { studentId: true },
      },
    },
    orderBy: [
      { program: { school: { code: "asc" } } },
      { program: { code: "asc" } },
      { name: "asc" },
    ],
  });

  const sectionIds = sectionsDb.map((s) => s.id);

  // 3. Fetch attendance sessions conducted on this date for these sections
  const sessionsOnDate = await prisma.attendanceSession.findMany({
    where: {
      sessionDate: selectedDateObj,
      sectionId: { in: sectionIds },
    },
    include: {
      assignment: {
        include: {
          subjectOffering: {
            include: { subject: true },
          },
        },
      },
      faculty: {
        include: {
          user: { select: { fullName: true } },
        },
      },
      labBatch: true,
      records: {
        select: {
          studentId: true,
          status: true,
          student: {
            select: {
              rollNumber: true,
              user: { select: { fullName: true } },
            },
          },
        },
      },
    },
    orderBy: [{ periodNumber: "asc" }, { id: "asc" }],
  });

  // Group sessions by sectionId
  const sessionsBySection = new Map<string, typeof sessionsOnDate>();
  for (const sess of sessionsOnDate) {
    const list = sessionsBySection.get(sess.sectionId) || [];
    list.push(sess);
    sessionsBySection.set(sess.sectionId, list);
  }

  // 4. Construct Section Stats
  let totalEnrolledOverall = 0;
  let totalPresentOverall = 0;
  let totalAbsentOverall = 0;
  let conductedSectionsCount = 0;

  const sectionsStats: SectionDayStat[] = sectionsDb.map((s) => {
    const enrolledStudents = s.enrollments;
    const enrolledCount = enrolledStudents.length;
    totalEnrolledOverall += enrolledCount;

    const sectionSessions = sessionsBySection.get(s.id) || [];
    const isMarked = sectionSessions.length > 0;

    if (isMarked) {
      conductedSectionsCount++;
    }

    // Set of distinct student IDs marked PRESENT (or LATE) in at least one session on this date
    const distinctPresentStudentIds = new Set<string>();
    const allMarkedStudentIds = new Set<string>();

    const hourlyStats: HourlySessionStat[] = sectionSessions.map((sess) => {
      const sub = sess.assignment?.subjectOffering?.subject;
      const totalMarked = sess.records.length;
      let presentInHour = 0;
      let absentInHour = 0;
      const absentStudents: { rollNumber: string; fullName: string }[] = [];

      for (const rec of sess.records) {
        allMarkedStudentIds.add(rec.studentId);
        if (rec.status === "PRESENT" || rec.status === "LATE") {
          presentInHour++;
          distinctPresentStudentIds.add(rec.studentId);
        } else if (rec.status === "ABSENT") {
          absentInHour++;
          absentStudents.push({
            rollNumber: rec.student?.rollNumber || "Unknown",
            fullName: rec.student?.user?.fullName || "Student",
          });
        }
      }

      const percentage =
        totalMarked > 0
          ? Number(((presentInHour / totalMarked) * 100).toFixed(1))
          : 0;

      return {
        sessionId: sess.id,
        periodNumber: sess.periodNumber,
        subjectName: sub?.name || "Subject",
        subjectCode: sub?.code || "SUB",
        subjectShortName: sub?.shortName || sub?.code || "SUB",
        subjectType: sub?.type || "THEORY",
        facultyName: sess.faculty?.user?.fullName || "Faculty In-Charge",
        facultyShortName: sess.faculty?.shortName || "FAC",
        sessionType: sess.sessionType,
        labBatchName: sess.labBatch?.name || null,
        totalMarked,
        presentCount: presentInHour,
        absentCount: absentInHour,
        percentage,
        absentStudents: absentStudents.sort((a, b) =>
          a.rollNumber.localeCompare(b.rollNumber)
        ),
      };
    });

    const distinctPresentCount = isMarked ? distinctPresentStudentIds.size : 0;
    // Absent count: enrolled students who were not present
    const distinctAbsentCount = isMarked
      ? Math.max(0, enrolledCount - distinctPresentCount)
      : 0;

    const dayPercentage =
      enrolledCount > 0 && isMarked
        ? Number(((distinctPresentCount / enrolledCount) * 100).toFixed(1))
        : 0;

    totalPresentOverall += distinctPresentCount;
    totalAbsentOverall += distinctAbsentCount;

    return {
      sectionId: s.id,
      sectionName: s.name,
      displayName: s.displayName,
      programName: s.program.name,
      programCode: s.program.code,
      schoolId: s.program.schoolId,
      schoolName: s.program.school?.name || "School",
      schoolCode: s.program.school?.code || "SCH",
      year: s.year,
      semester: s.semester,
      totalEnrolled: enrolledCount,
      isMarked,
      distinctPresentCount,
      distinctAbsentCount,
      dayPercentage,
      totalPeriodsConducted: sectionSessions.length,
      hourlyStats,
    };
  });

  const overallPercentage =
    totalEnrolledOverall > 0
      ? Number(((totalPresentOverall / totalEnrolledOverall) * 100).toFixed(1))
      : 0;

  // Distinct schools
  const uniqueSchoolsMap = new Map<string, { id: string; name: string; code: string }>();
  for (const s of sectionsDb) {
    if (s.program.school) {
      uniqueSchoolsMap.set(s.program.school.id, {
        id: s.program.school.id,
        name: s.program.school.name,
        code: s.program.school.code,
      });
    }
  }

  return {
    success: true,
    selectedDate: selectedDateStr,
    availableDates,
    summary: {
      totalSections: sectionsDb.length,
      conductedSections: conductedSectionsCount,
      totalEnrolledOverall,
      totalPresentOverall,
      totalAbsentOverall,
      overallPercentage,
      totalSessionsOverall: sessionsOnDate.length,
    },
    sections: sectionsStats,
    schools: Array.from(uniqueSchoolsMap.values()),
  };
}
