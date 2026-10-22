import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import LmsAdminClient from "./LmsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminLmsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN");
  const isOffice = session.roles.includes("OFFICE");
  const isAcademicAdmin = session.roles.includes("ACADEMIC_ADMIN") || session.roles.includes("DEAN");

  if (!isSuperAdmin && !isOffice && !isAcademicAdmin) {
    redirect("/dashboard");
  }

  // Fetch all assignments with syllabus topics, materials, and quizzes
  const assignments = await prisma.facultySubjectAssignment.findMany({
    where: { isActive: true },
    include: {
      faculty: {
        include: {
          user: { select: { fullName: true, email: true } },
          department: true,
        },
      },
      section: {
        include: {
          program: { include: { school: true } },
          academicYear: true,
        },
      },
      subjectOffering: {
        include: {
          subject: {
            include: {
              department: true,
              questionBankItems: true,
            },
          },
        },
      },
      lecturePlanTopics: {
        orderBy: [{ unitNumber: "asc" }, { topicSequence: "asc" }],
      },
      courseMaterials: true,
      courseQuizzes: {
        include: {
          attempts: true,
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  // Fetch recent student telemetry logs (last 150)
  const telemetryLogs = await prisma.studentActivityLog.findMany({
    take: 150,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        include: {
          user: { select: { fullName: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <LmsAdminClient
        assignments={JSON.parse(JSON.stringify(assignments))}
        telemetryLogs={JSON.parse(JSON.stringify(telemetryLogs))}
      />
    </div>
  );
}
