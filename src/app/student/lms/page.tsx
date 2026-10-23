import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import StudentLmsClient from "./StudentLmsClient";

export const dynamic = "force-dynamic";

export default async function StudentLmsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  if (!session.studentId) {
    redirect("/dashboard");
  }

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      user: true,
      enrollments: {
        where: { isCurrent: true },
        include: {
          section: true,
          program: { include: { school: true } },
          academicYear: true,
        },
      },
    },
  });

  if (!student) redirect("/login");

  const enrollment = student.enrollments[0];

  // 1. Retrieve all subject assignments scheduled in the timetable for this student's section & program
  let assignmentIds: string[] = [];

  if (enrollment) {
    const timetableEntries = await prisma.timetableEntry.findMany({
      where: {
        sectionId: enrollment.sectionId,
        isActive: true,
      },
      select: { assignmentId: true },
    });

    assignmentIds = Array.from(new Set(timetableEntries.map((t) => t.assignmentId)));

    // Fallback: If section timetable is not yet configured, load all assignments for this program, year & sem
    if (assignmentIds.length === 0) {
      const fallbackOfferings = await prisma.facultySubjectAssignment.findMany({
        where: {
          sectionId: enrollment.sectionId,
          isActive: true,
          subjectOffering: {
            programId: enrollment.programId,
            year: enrollment.year,
            semester: enrollment.semester,
          },
        },
        select: { id: true },
      });
      assignmentIds = fallbackOfferings.map((f) => f.id);
    }
  }

  // 2. Fetch the full courseware details for those exact assigned timetable courses
  const assignments = assignmentIds.length > 0
    ? await prisma.facultySubjectAssignment.findMany({
        where: {
          id: { in: assignmentIds },
          isActive: true,
        },
        include: {
          faculty: {
            include: {
              user: { select: { fullName: true, email: true } },
              department: true,
            },
          },
          subjectOffering: {
            include: {
              subject: {
                include: {
                  questionBankItems: {
                    orderBy: [{ unitNumber: "asc" }, { difficulty: "asc" }],
                  },
                },
              },
            },
          },
          lecturePlanTopics: {
            include: { materials: true },
            orderBy: [{ unitNumber: "asc" }, { topicSequence: "asc" }],
          },
          courseMaterials: {
            orderBy: [{ unitNumber: "asc" }, { createdAt: "desc" }],
          },
          courseQuizzes: {
            where: { isPublished: true },
            include: {
              attempts: {
                where: { studentId: student.id },
              },
              questions: {
                include: {
                  questionBank: true,
                },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: {
          subjectOffering: {
            subject: { code: "asc" },
          },
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <StudentLmsClient
        student={{
          id: student.id,
          rollNumber: student.rollNumber,
          fullName: student.user.fullName,
          programName: enrollment?.program.name || "Engineering",
          sectionName: enrollment?.section.name || "1",
          year: enrollment?.year || 1,
          semester: enrollment?.semester || 1,
          academicYear: enrollment?.academicYear.code || "2026-27",
        }}
        assignments={JSON.parse(JSON.stringify(assignments))}
      />
    </div>
  );
}
