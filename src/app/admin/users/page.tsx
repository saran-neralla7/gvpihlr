import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import UsersManagerClient from "./UsersManagerClient";

export default async function UsersPage() {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    redirect("/dashboard");
  }

  const [faculty, students, departments, programs, sections] = await Promise.all([
    prisma.faculty.findMany({
      include: {
        user: true,
        department: true,
      },
      orderBy: { employeeId: "asc" },
    }),
    prisma.student.findMany({
      include: {
        user: true,
        enrollments: {
          where: { isCurrent: true },
          include: { section: true, program: true },
        },
      },
      orderBy: { rollNumber: "asc" },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.program.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.section.findMany({
      where: { isActive: true },
      include: { program: true },
      orderBy: [{ program: { code: "asc" } }, { name: "asc" }],
    }),
  ]);

  return (
    <UsersManagerClient
      initialFaculty={faculty}
      initialStudents={students}
      departments={departments}
      programs={programs}
      sections={sections}
    />
  );
}
