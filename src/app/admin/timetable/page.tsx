import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TimetableManagerClient from "./TimetableManagerClient";

export const dynamic = "force-dynamic";

const DAY_NAMES: Record<number, string> = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

function getPeriodNumber(startTime: string): number {
  if (startTime.startsWith("09")) return 1;
  if (startTime.startsWith("10")) return 2;
  if (startTime.startsWith("11")) return 3;
  if (startTime.startsWith("12")) return 4;
  if (startTime.startsWith("14") || startTime.startsWith("02")) return 5;
  if (startTime.startsWith("15") || startTime.startsWith("03")) return 6;
  if (startTime.startsWith("16") || startTime.startsWith("04")) return 7;
  return 1;
}

export default async function AdminTimetablePage() {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");
  const isAcademicAdminUser = session?.roles.includes("ACADEMIC_ADMIN") || session?.roles.includes("DEAN");

  if (!session || (!isSuperAdminUser && !isOfficeUser && !isAcademicAdminUser)) {
    redirect("/dashboard");
  }

  const hasSchoolScope = !!(session.allowedSchoolIds && session.allowedSchoolIds.length > 0);
  const scopedSchoolIds = session.allowedSchoolIds || [];

  // Load active sections and their timetable entries
  const [sections, timetableEntries] = await Promise.all([
    prisma.section.findMany({
      where: {
        isActive: true,
        ...(hasSchoolScope ? { program: { schoolId: { in: scopedSchoolIds } } } : {}),
      },
      include: {
        program: true,
      },
      orderBy: [{ program: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.timetableEntry.findMany({
      where: {
        isActive: true,
        ...(hasSchoolScope ? { section: { program: { schoolId: { in: scopedSchoolIds } } } } : {}),
      },
      include: {
        assignment: {
          include: {
            subjectOffering: {
              include: {
                subject: true,
              },
            },
          },
        },
        faculty: {
          include: {
            user: true,
          },
        },
        labBatch: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  const sectionsFormatted = sections.map((s) => ({
    id: s.id,
    name: s.name,
    displayName: s.displayName,
    programName: s.program.name,
    programCode: s.program.code,
    year: s.year,
    semester: s.semester,
  }));

  const entriesFormatted = timetableEntries.map((e) => {
    const sub = e.assignment?.subjectOffering?.subject;
    return {
      id: e.id,
      sectionId: e.sectionId,
      dayOfWeek: DAY_NAMES[e.dayOfWeek] || "MONDAY",
      periodNumber: getPeriodNumber(e.startTime),
      startTime: e.startTime,
      endTime: e.endTime,
      roomNumber: e.roomNumber,
      subjectCode: sub?.code || "SUB",
      subjectName: sub?.name || "Subject",
      subjectShortName: sub?.shortName || sub?.code || "SUB",
      subjectType: sub?.type || "THEORY",
      facultyName: e.faculty?.user?.fullName || "Faculty In-Charge",
      facultyShortName: e.faculty?.shortName || "FAC",
      labBatchName: e.labBatch?.name || null,
    };
  });

  return (
    <TimetableManagerClient
      sections={sectionsFormatted}
      entries={entriesFormatted}
    />
  );
}
