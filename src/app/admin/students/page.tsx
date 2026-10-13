import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import StudentsManagerClient from "./StudentsManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");
  const isAcademicAdminUser = session?.roles.includes("ACADEMIC_ADMIN") || session?.roles.includes("DEAN");

  if (!session || (!isSuperAdminUser && !isOfficeUser && !isAcademicAdminUser)) {
    redirect("/dashboard");
  }

  const hasSchoolScope = !!(session.allowedSchoolIds && session.allowedSchoolIds.length > 0);
  const scopedSchoolIds = session.allowedSchoolIds || [];

  const [students, departments, programs, sections, schools] = await Promise.all([
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
            section: true,
            program: {
              include: { school: true },
            },
          },
        },
      },
      orderBy: { rollNumber: "asc" },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.program.findMany({
      where: hasSchoolScope ? { schoolId: { in: scopedSchoolIds } } : undefined,
      include: { school: true },
      orderBy: { name: "asc" },
    }),
    prisma.section.findMany({
      where: hasSchoolScope ? { program: { schoolId: { in: scopedSchoolIds } } } : undefined,
      include: {
        program: {
          include: { school: true },
        },
      },
      orderBy: [{ program: { code: "asc" } }, { name: "asc" }],
    }),
    prisma.school.findMany({
      where: hasSchoolScope ? { id: { in: scopedSchoolIds } } : undefined,
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <StudentsManagerClient
      students={students}
      departments={departments}
      programs={programs}
      sections={sections}
      schools={schools}
      canDelete={isSuperAdminUser || isAcademicAdminUser}
    />
  );
}
