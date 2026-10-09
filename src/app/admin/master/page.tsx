import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import MasterDataManagerClient from "./MasterDataManagerClient";

export default async function MasterDataPage() {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    redirect("/dashboard");
  }

  const [schools, departments, programs, sections, subjects, faculty, students, regulations] =
    await Promise.all([
      prisma.school.findMany({ orderBy: { code: "asc" } }),
      prisma.department.findMany({
        include: { school: true },
        orderBy: { code: "asc" },
      }),
      prisma.program.findMany({
        include: { school: true, regulation: true },
        orderBy: { code: "asc" },
      }),
      prisma.section.findMany({
        include: { program: true, academicYear: true },
        orderBy: [{ program: { code: "asc" } }, { name: "asc" }],
      }),
      prisma.subject.findMany({
        include: { department: true },
        orderBy: { code: "asc" },
      }),
      prisma.faculty.findMany({
        include: { user: true, department: true },
        orderBy: { employeeId: "asc" },
      }),
      prisma.student.findMany({
        include: {
          user: true,
          enrollments: {
            where: { isCurrent: true },
            include: { section: true },
          },
        },
        orderBy: { rollNumber: "asc" },
      }),
      prisma.regulation.findMany({ orderBy: { code: "asc" } }),
    ]);

  return (
    <MasterDataManagerClient
      schools={schools}
      departments={departments}
      programs={programs}
      sections={sections}
      subjects={subjects}
      faculty={faculty}
      students={students}
      regulations={regulations}
    />
  );
}
