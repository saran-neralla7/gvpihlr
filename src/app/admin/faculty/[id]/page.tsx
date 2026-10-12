import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import FacultyProfileClient from "./FacultyProfileClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function FacultyDetailPage({ params }: PageProps) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN");
  const isOffice = session.roles.includes("OFFICE");

  if (!isSuperAdmin && !isOffice) {
    redirect("/dashboard");
  }

  const faculty = await prisma.faculty.findFirst({
    where: {
      OR: [
        { id: params.id },
        { employeeId: params.id },
        { shortName: params.id },
      ],
    },
    include: {
      user: true,
      department: {
        include: {
          school: true,
        },
      },
      assignments: {
        where: { isActive: true },
        include: {
          section: {
            include: {
              program: true,
            },
          },
          subjectOffering: {
            include: {
              subject: true,
              academicYear: true,
            },
          },
        },
      },
    },
  });

  if (!faculty) {
    notFound();
  }

  // Count attendance sessions conducted by this faculty per assignment
  const assignmentIds = faculty.assignments.map((a) => a.id);
  const sessionCounts = await prisma.attendanceSession.groupBy({
    by: ["assignmentId"],
    where: {
      assignmentId: { in: assignmentIds },
    },
    _count: { id: true },
  });

  const sessionCountMap = new Map<string, number>();
  sessionCounts.forEach((sc) => {
    sessionCountMap.set(sc.assignmentId, sc._count.id);
  });

  const assignedSubjects = faculty.assignments.map((a) => {
    const sub = a.subjectOffering.subject;
    const sec = a.section;
    const conductedCount = sessionCountMap.get(a.id) || 0;

    return {
      assignmentId: a.id,
      sectionId: sec.id,
      sectionName: sec.name,
      sectionDisplayName: sec.displayName,
      programName: sec.program.name,
      programCode: sec.program.code,
      year: sec.year,
      semester: sec.semester,
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      subjectShortName: sub.shortName || sub.code,
      subjectType: sub.type,
      credits: sub.credits,
      sessionsConducted: conductedCount,
    };
  });

  // Extract distinct semesters
  const distinctSemesters = Array.from(
    new Set(assignedSubjects.map((s) => s.semester))
  ).sort((a, b) => a - b);

  return (
    <FacultyProfileClient
      faculty={{
        id: faculty.id,
        employeeId: faculty.employeeId,
        shortName: faculty.shortName,
        fullName: faculty.user?.fullName || "Faculty Member",
        designation: faculty.designation,
        qualification: faculty.qualification,
        departmentName: faculty.department?.name || "General Department",
        departmentCode: faculty.department?.code || "GEN",
        schoolName: faculty.department?.school?.name || "GVPIHLR University",
        email: faculty.user?.email,
        phone: faculty.user?.phone,
        avatarUrl: (faculty.user as any)?.avatarUrl || null,
        username: faculty.user?.username || faculty.shortName,
        isActive: faculty.isActive,
        joiningDate: faculty.joiningDate ? faculty.joiningDate.toISOString().slice(0, 10) : null,
      }}
      assignedSubjects={assignedSubjects}
      distinctSemesters={distinctSemesters}
      canEdit={true}
      canDelete={isSuperAdmin}
    />
  );
}
