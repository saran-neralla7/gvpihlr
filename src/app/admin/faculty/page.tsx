import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import FacultyManagerClient from "./FacultyManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminFacultyPage() {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    redirect("/dashboard");
  }

  const [faculty, departments] = await Promise.all([
    prisma.faculty.findMany({
      include: {
        user: true,
        department: true,
      },
      orderBy: [{ department: { name: "asc" } }, { employeeId: "asc" }],
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <FacultyManagerClient
      faculty={faculty}
      departments={departments}
    />
  );
}
