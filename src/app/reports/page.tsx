import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSectionStudentAttendanceReport } from "@/lib/reportsActions";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  // 1. STRICT STUDENT ISOLATION: Students cannot view class registers of other students
  const isStudentUser =
    session.roles.includes("STUDENT") &&
    !session.roles.includes("SUPER_ADMIN") &&
    !session.roles.includes("FACULTY");

  if (isStudentUser) {
    redirect("/student");
  }

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN");

  // Load active academic year
  const currentAY = await prisma.academicYear.findFirst({
    where: { isCurrent: true, isActive: true },
  });

  // Section scoping: Faculty only sees assigned sections; Super Admin sees all
  const sectionWhere: any = {
    academicYearId: currentAY?.id,
    isActive: true,
  };

  if (!isSuperAdmin && session.facultyId) {
    sectionWhere.assignments = {
      some: { facultyId: session.facultyId, isActive: true },
    };
  }

  const sections = await prisma.section.findMany({
    where: sectionWhere,
    include: {
      program: true,
    },
    orderBy: [
      { program: { name: "asc" } },
      { name: "asc" },
    ],
  });

  // Subject scoping
  const subjectWhere: any = { isActive: true };
  if (!isSuperAdmin && session.facultyId) {
    subjectWhere.offerings = {
      some: {
        assignments: {
          some: { facultyId: session.facultyId, isActive: true },
        },
      },
    };
  }

  const subjects = await prisma.subject.findMany({
    where: subjectWhere,
    orderBy: { name: "asc" },
  });

  const defaultSection = sections[0];
  let initialReport = {
    sectionName: defaultSection?.name || "1",
    displayName: defaultSection?.displayName || "",
    programName: defaultSection?.program?.name || "",
    year: defaultSection?.year || 1,
    semester: defaultSection?.semester || 1,
    totalSessionsConducted: 0,
    sessions: [] as any[],
    availableSubjects: [] as any[],
    students: [] as any[],
    defaultersCount: 0,
    startDate: "",
    endDate: "",
  };

  if (defaultSection) {
    const rep = await getSectionStudentAttendanceReport({ sectionId: defaultSection.id });
    if (rep.success && rep.section) {
      initialReport = {
        sectionName: rep.section.name,
        displayName: rep.section.displayName,
        programName: rep.section.program.name,
        year: rep.section.year,
        semester: rep.section.semester,
        totalSessionsConducted: rep.totalSessionsConducted,
        sessions: rep.sessions || [],
        availableSubjects: rep.availableSubjects || [],
        students: rep.students,
        defaultersCount: rep.defaultersCount,
        startDate: rep.startDate || "",
        endDate: rep.endDate || "",
      };
    }
  }

  const sectionsFormatted = sections.map((s) => ({
    id: s.id,
    name: s.name,
    displayName: s.displayName,
    programName: s.program.name,
    year: s.year,
    semester: s.semester,
  }));

  const subjectsFormatted = subjects.map((sub) => ({
    id: sub.id,
    name: sub.name,
    code: sub.code,
    shortName: sub.shortName || sub.code,
  }));

  return (
    <ReportsClient
      sections={sectionsFormatted}
      subjects={subjectsFormatted}
      initialSectionId={defaultSection?.id || ""}
      initialReport={initialReport}
    />
  );
}
