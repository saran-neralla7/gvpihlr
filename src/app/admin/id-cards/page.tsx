import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import IdCardsClient, {
  StudentRecord,
  SchoolOption,
  ProgramOption,
  SectionOption,
} from "./IdCardsClient";

export const dynamic = "force-dynamic";

export default async function AdminIdCardsPage() {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");
  const isAcademicAdminUser = session?.roles.includes("ACADEMIC_ADMIN") || session?.roles.includes("DEAN");

  if (!session || (!isSuperAdminUser && !isOfficeUser && !isAcademicAdminUser)) {
    redirect("/dashboard");
  }

  const hasSchoolScope = !!(session.allowedSchoolIds && session.allowedSchoolIds.length > 0);
  const scopedSchoolIds = session.allowedSchoolIds || [];

  // Fetch schools, programs, sections, and students
  const [schools, programs, sections, rawStudents] = await Promise.all([
    prisma.school.findMany({
      where: hasSchoolScope ? { id: { in: scopedSchoolIds } } : undefined,
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.program.findMany({
      where: hasSchoolScope ? { schoolId: { in: scopedSchoolIds } } : undefined,
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, schoolId: true },
    }),
    prisma.section.findMany({
      where: hasSchoolScope ? { program: { schoolId: { in: scopedSchoolIds } } } : undefined,
      orderBy: { name: "asc" },
      select: { id: true, name: true, programId: true },
    }),
    prisma.student.findMany({
      where: hasSchoolScope
        ? {
            enrollments: {
              some: {
                isCurrent: true,
                program: { schoolId: { in: scopedSchoolIds } },
              },
            },
          }
        : undefined,
      include: {
        user: true,
        enrollments: {
          where: { isCurrent: true },
          include: {
            program: {
              include: { school: true },
            },
            section: true,
          },
        },
      },
      orderBy: { rollNumber: "asc" },
    }),
  ]);

  // Map students into clean, serialized format for the client component
  const students: StudentRecord[] = rawStudents.map((st) => {
    const currentEnrollment = st.enrollments[0];
    const program = currentEnrollment?.program;
    const school = program?.school;
    const section = currentEnrollment?.section;

    return {
      id: st.id,
      rollNumber: st.rollNumber,
      fullName: st.user?.fullName || "Student",
      phone: st.user?.phone || null,
      parentName: st.parentName || null,
      parentPhone: st.parentPhone || null,
      dateOfBirth: st.dateOfBirth ? st.dateOfBirth.toISOString() : null,
      programName: program?.name || null,
      programCode: program?.code || null,
      schoolName: school?.name || null,
      schoolId: school?.id || null,
      programId: program?.id || null,
      sectionName: section?.name || null,
      sectionId: section?.id || null,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <IdCardsClient
        students={students}
        schools={schools as SchoolOption[]}
        programs={programs as ProgramOption[]}
        sections={sections as SectionOption[]}
      />
    </div>
  );
}
