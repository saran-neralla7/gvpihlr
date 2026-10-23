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

  // 3. Group by (subjectOfferingId, sectionId) so that multiple co-faculty teaching
  // the same section are consolidated into ONE unified course card for the student.
  const groupedOfferings = new Map<string, typeof assignments>();
  for (const a of assignments) {
    const key = `${a.subjectOfferingId}_${a.sectionId}`;
    const list = groupedOfferings.get(key) || [];
    list.push(a);
    groupedOfferings.set(key, list);
  }

  // 4. Fetch all co-faculty assigned to these course offerings & sections
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
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        })
      : [];

  const consolidatedAssignments = Array.from(groupedOfferings.values()).map((group) => {
    // Pick the primary assignment or first in group as base
    const base = group.find((a) => a.isPrimary) || group[0];

    // Find all faculty assigned to this offering and section
    const matchedCo = coAssignments
      .filter((c) => c.subjectOfferingId === base.subjectOfferingId && c.sectionId === base.sectionId)
      .map((c) => ({
        id: c.facultyId,
        fullName: c.faculty.user.fullName,
        email: c.faculty.user.email,
        isPrimary: c.isPrimary,
      }));

    // Merge and deduplicate courseMaterials from all co-instructors
    const allMaterialsMap = new Map<string, any>();
    for (const a of group) {
      for (const m of a.courseMaterials) {
        allMaterialsMap.set(m.id, m);
      }
    }
    const mergedMaterials = Array.from(allMaterialsMap.values()).sort(
      (m1, m2) => m1.unitNumber - m2.unitNumber || new Date(m2.createdAt).getTime() - new Date(m1.createdAt).getTime()
    );

    // Merge and deduplicate lecturePlanTopics from all co-instructors
    const allTopicsMap = new Map<string, any>();
    for (const a of group) {
      for (const t of a.lecturePlanTopics) {
        allTopicsMap.set(t.id, t);
      }
    }
    const mergedTopics = Array.from(allTopicsMap.values()).sort(
      (t1, t2) => t1.unitNumber - t2.unitNumber || t1.topicSequence - t2.topicSequence
    );

    // Merge and deduplicate quizzes from all co-instructors
    const allQuizzesMap = new Map<string, any>();
    for (const a of group) {
      for (const q of a.courseQuizzes) {
        allQuizzesMap.set(q.id, q);
      }
    }
    const mergedQuizzes = Array.from(allQuizzesMap.values()).sort(
      (q1, q2) => new Date(q2.createdAt).getTime() - new Date(q1.createdAt).getTime()
    );

    return {
      ...base,
      allFaculty:
        matchedCo.length > 0
          ? matchedCo
          : [
              {
                id: base.facultyId,
                fullName: base.faculty.user.fullName,
                email: base.faculty.user.email,
                isPrimary: true,
              },
            ],
      courseMaterials: mergedMaterials,
      lecturePlanTopics: mergedTopics,
      courseQuizzes: mergedQuizzes,
    };
  });

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
        assignments={JSON.parse(JSON.stringify(consolidatedAssignments))}
      />
    </div>
  );
}
