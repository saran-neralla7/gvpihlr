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

  // Build where clause: Faculty members see all their assigned subjects
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

  // Fetch all co-faculty mapped to the same subject offering & section
  const coAssignments =
    assignments.length > 0
      ? await prisma.facultySubjectAssignment.findMany({
          where: {
            isActive: true,
            OR: assignments.map((a) => ({
              subjectOfferingId: a.subjectOfferingId,
              sectionId: a.sectionId,
            })),
          },
          include: {
            faculty: {
              include: {
                user: { select: { fullName: true, username: true } },
              },
            },
          },
        })
      : [];

  return (
    <div className="space-y-6">
      <FacultyLmsClient
        assignments={assignments.map((a) => {
          const matchedCo = coAssignments
            .filter((c) => c.subjectOfferingId === a.subjectOfferingId && c.sectionId === a.sectionId)
            .map((c) => `${c.faculty.user.fullName}${c.isPrimary ? " (Lead)" : ""}`);

          return {
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
            coFaculty: matchedCo.length > 0 ? matchedCo : [a.faculty.user.fullName],
          };
        })}
      />
    </div>
  );
}
