import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SubjectsManagerClient from "./SubjectsManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminSubjectsPage() {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");

  if (!session || (!isSuperAdminUser && !isOfficeUser)) {
    redirect("/dashboard");
  }

  const [subjects, departments] = await Promise.all([
    prisma.subject.findMany({
      where: { isActive: true },
      include: {
        department: true,
        _count: {
          select: { offerings: true },
        },
      },
      orderBy: [{ code: "asc" }],
    }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const subjectsFormatted = subjects.map((sub) => ({
    id: sub.id,
    code: sub.code,
    name: sub.name,
    shortName: sub.shortName || sub.code,
    type: sub.type,
    credits: sub.credits,
    departmentId: sub.departmentId,
    departmentName: sub.department?.name || "General Department",
    departmentCode: sub.department?.code || "GEN",
    offeringsCount: sub._count.offerings,
  }));

  const departmentsFormatted = departments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
  }));

  return (
    <SubjectsManagerClient
      subjects={subjectsFormatted}
      departments={departmentsFormatted}
      canEdit={true}
      canDelete={Boolean(isSuperAdminUser)}
    />
  );
}
