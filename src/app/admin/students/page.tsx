import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import StudentsManagerClient from "./StudentsManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    redirect("/dashboard");
  }

  const [students, departments, programs, sections] = await Promise.all([
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
      orderBy: { name: "asc" },
    }),
    prisma.section.findMany({
      include: {
        program: true,
      },
      orderBy: [{ program: { code: "asc" } }, { name: "asc" }],
    }),
  ]);

  return (
    <StudentsManagerClient
      students={students}
      departments={departments}
      programs={programs}
      sections={sections}
    />
  );
}
