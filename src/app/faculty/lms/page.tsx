import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import FacultyLmsClient from "./FacultyLmsClient";

export const dynamic = "force-dynamic";

export default async function FacultyLmsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN") || session.roles.includes("ACADEMIC_ADMIN");
  const isFaculty = session.roles.includes("FACULTY");

  if (!isSuperAdmin && !isFaculty) {
    redirect("/dashboard");
  }

  // Fetch assignments
  const whereClause: any = { isActive: true };
  if (!isSuperAdmin && session.facultyId) {
    whereClause.facultyId = session.facultyId;
  }

  const assignments = await prisma.facultySubjectAssignment.findMany({
    where: whereClause,
    include: {
      subjectOffering: {
        include: {
          subject: true,
          program: true,
        },
      },
      section: true,
      faculty: {
        include: {
          user: { select: { fullName: true } },
        },
      },
    },
    orderBy: [
      { section: { year: "asc" } },
      { section: { semester: "asc" } },
      { section: { name: "asc" } },
    ],
  });

  return (
    <div className="space-y-6">
      <FacultyLmsClient
        assignments={assignments.map((a) => ({
          id: a.id,
          subjectId: a.subjectOffering.subject.id,
          subjectCode: a.subjectOffering.subject.code,
          subjectName: a.subjectOffering.subject.name,
          subjectShortName: a.subjectOffering.subject.shortName,
          credits: a.subjectOffering.subject.credits,
          type: a.subjectOffering.subject.type,
          syllabus: a.subjectOffering.subject.syllabus,
          sectionId: a.section.id,
          sectionName: a.section.name,
          programName: a.subjectOffering.program.name,
          year: a.section.year,
          semester: a.section.semester,
          facultyName: a.faculty.user.fullName,
        }))}
      />
    </div>
  );
}
