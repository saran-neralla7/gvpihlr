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

  // Fetch all active course assignments for this student's section (strictly subjects they attend)
  const assignments = enrollment
    ? await prisma.facultySubjectAssignment.findMany({
        where: {
          sectionId: enrollment.sectionId,
          isActive: true,
          OR: [
            { timetableEntries: { some: {} } },
            { attendanceSessions: { some: {} } },
            { lecturePlanTopics: { some: {} } },
            { courseMaterials: { some: {} } },
            { courseQuizzes: { some: {} } },
          ],
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
          sectionName: enrollment?.section.name || "A",
          year: enrollment?.year || 1,
          semester: enrollment?.semester || 1,
          academicYear: enrollment?.academicYear.code || "2026-27",
        }}
        assignments={JSON.parse(JSON.stringify(assignments))}
      />
    </div>
  );
}
