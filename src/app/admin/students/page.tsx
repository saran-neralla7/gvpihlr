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

  if (!session || (!isSuperAdminUser && !isOfficeUser)) {
    redirect("/dashboard");
  }

  const [students, departments, programs, sections, schools] = await Promise.all([
    prisma.student.findMany({
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
      include: { school: true },
      orderBy: { name: "asc" },
    }),
    prisma.section.findMany({
      include: {
        program: {
          include: { school: true },
        },
      },
      orderBy: [{ program: { code: "asc" } }, { name: "asc" }],
    }),
    prisma.school.findMany({
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
      canDelete={isSuperAdminUser}
    />
  );
}
