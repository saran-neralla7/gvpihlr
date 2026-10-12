import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import StudentProfileClient from "./StudentProfileClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function StudentDetailPage({ params }: PageProps) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN");
  const isOffice = session.roles.includes("OFFICE");

  // Only Admin, Office, and authorized academic personnel can view student profile
  if (!isSuperAdmin && !isOffice) {
    redirect("/dashboard");
  }

  const student = await prisma.student.findFirst({
    where: {
      OR: [{ id: params.id }, { rollNumber: params.id }],
    },
    include: {
      user: true,
      enrollments: {
        where: { isCurrent: true },
        include: {
          program: { include: { school: true } },
          section: true,
          academicYear: true,
        },
      },
      labBatchMemberships: {
        include: { labBatch: true },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const enrollment = student.enrollments[0];
  const sectionId = enrollment?.sectionId;

  // Fetch all sessions conducted for this student's section
  let sessions: any[] = [];
  let records: any[] = [];

  if (sectionId) {
    [sessions, records] = await Promise.all([
      prisma.attendanceSession.findMany({
        where: { sectionId },
        include: {
          assignment: {
            include: {
              subjectOffering: { include: { subject: true } },
              faculty: { include: { user: true } },
            },
          },
        },
        orderBy: [{ sessionDate: "desc" }, { periodNumber: "desc" }],
      }),
      prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
        select: {
          sessionId: true,
          status: true,
          remarks: true,
        },
      }),
    ]);
  }

  const recordMap = new Map<string, string>();
  records.forEach((r) => {
    recordMap.set(r.sessionId, r.status);
  });

  const totalHeld = sessions.length;
  let totalAttended = 0;

  // Build subject-wise breakdown
  const subjectBreakdownMap = new Map<
    string,
    {
      subjectId: string;
      code: string;
      name: string;
      shortName: string;
      type: string;
      credits: number;
      facultyName: string;
      held: number;
      attended: number;
      absent: number;
      percentage: number;
    }
  >();

  const PERIOD_TIMINGS: Record<number, string> = {
    1: "09:00 - 10:00 AM",
    2: "10:00 - 11:00 AM",
    3: "11:15 - 12:15 PM",
    4: "12:15 - 01:15 PM",
    5: "02:15 - 03:15 PM",
    6: "03:15 - 04:15 PM",
    7: "04:15 - 05:15 PM",
  };

  const attendanceLog = sessions.map((s) => {
    const rawStatus = recordMap.get(s.id);
    const isPresent = rawStatus === "PRESENT" || rawStatus === "ON_DUTY";
    if (isPresent) totalAttended++;

    const sub = s.assignment?.subjectOffering?.subject;
    const fac = s.assignment?.faculty?.user?.fullName || "Faculty In-Charge";

    if (sub) {
      if (!subjectBreakdownMap.has(sub.id)) {
        subjectBreakdownMap.set(sub.id, {
          subjectId: sub.id,
          code: sub.code,
          name: sub.name,
          shortName: sub.shortName || sub.code,
          type: sub.type,
          credits: sub.credits,
          facultyName: fac,
          held: 0,
          attended: 0,
          absent: 0,
          percentage: 0,
        });
      }
      const item = subjectBreakdownMap.get(sub.id)!;
      item.held += 1;
      if (isPresent) item.attended += 1;
      else item.absent += 1;
      item.percentage = item.held > 0 ? parseFloat(((item.attended / item.held) * 100).toFixed(1)) : 0;
    }

    const d = new Date(s.sessionDate);
    const dateFormatted = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;

    return {
      id: s.id,
      sessionDate: dateFormatted,
      periodNumber: s.periodNumber,
      timing: PERIOD_TIMINGS[s.periodNumber] || "Period " + s.periodNumber,
      subjectCode: sub?.code || "—",
      subjectName: sub?.name || "Subject",
      subjectShortName: sub?.shortName || sub?.code || "SUB",
      facultyName: fac,
      status: (isPresent ? "PRESENT" : "ABSENT") as "PRESENT" | "ABSENT",
    };
  });

  const overallPercentage = totalHeld > 0 ? parseFloat(((totalAttended / totalHeld) * 100).toFixed(2)) : 0;

  const subjectBreakdown = Array.from(subjectBreakdownMap.values()).sort((a, b) => b.held - a.held);

  return (
    <StudentProfileClient
      student={{
        id: student.id,
        rollNumber: student.rollNumber,
        registerNumber: student.registerNumber,
        fullName: student.user?.fullName || "Student Name",
        email: student.user?.email,
        phone: student.user?.phone,
        avatarUrl: (student.user as any)?.avatarUrl || null,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().slice(0, 10) : null,
        gender: student.gender,
        bloodGroup: student.bloodGroup,
        status: student.status,
        admissionYear: student.admissionYear,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
        address: (student as any).address || null,
        casteCategory: student.casteCategory,
        ews: student.ews,
        specialCategory: student.specialCategory,
        state: student.state,
        region: student.region,
        interPercentage: student.interPercentage,
        jeePercentile: student.jeePercentile,
        jeeRank: student.jeeRank,
        eapcetRank: student.eapcetRank,
        tcVerified: student.tcVerified,
        programName: enrollment?.program?.name || "B.Tech",
        programCode: enrollment?.program?.code || "ENG",
        schoolName: enrollment?.program?.school?.name || "School of Engineering",
        year: enrollment?.year || 1,
        semester: enrollment?.semester || 1,
        sectionName: enrollment?.section?.name || "1",
        sectionDisplayName: enrollment?.section?.displayName || "Section 1",
        labBatch: student.labBatchMemberships[0]?.labBatch?.name || null,
      }}
      attendance={{
        totalHeld,
        totalAttended,
        totalAbsent: totalHeld - totalAttended,
        overallPercentage,
        isDefaulter: totalHeld > 0 && overallPercentage < 75.0,
        subjectBreakdown,
        attendanceLog,
      }}
      canEdit={true}
      canDelete={isSuperAdmin}
    />
  );
}
