import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";
import StudentDashboardView from "@/components/student/StudentDashboardView";

export default async function StudentPortalPage() {
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
          program: { include: { school: true } },
          section: true,
          academicYear: true,
        },
      },
      labBatchMemberships: {
        include: { labBatch: true },
      },
    },
  });

  if (!student) redirect("/login");

  const enrollment = student.enrollments[0];

  // Fetch all sessions for this student's section, filtering records STRICTLY to this student
  const sectionSessions = enrollment
    ? await prisma.attendanceSession.findMany({
        where: { sectionId: enrollment.sectionId },
        orderBy: { sessionDate: "desc" },
        include: {
          assignment: {
            include: {
              subjectOffering: { include: { subject: true } },
              faculty: { include: { user: { select: { fullName: true } } } },
            },
          },
          records: {
            where: { studentId: student.id },
          },
        },
      })
    : [];

  const totalClasses = sectionSessions.length;
  const attendedClasses = sectionSessions.filter(
    (s) =>
      s.records.length > 0 &&
      (s.records[0].status === AttendanceStatus.PRESENT ||
        s.records[0].status === AttendanceStatus.ON_DUTY)
  ).length;
  const absentClasses = totalClasses - attendedClasses;

  const overallPercentage =
    totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : "-";
  const isDefaulter = totalClasses > 0 && parseFloat(overallPercentage) < 75.0;

  // Group by Subject for this student only
  const subjectMap = new Map<
    string,
    { subjectName: string; subjectCode: string; conducted: number; attended: number }
  >();

  for (const sess of sectionSessions) {
    const sub = sess.assignment.subjectOffering.subject;
    const existing = subjectMap.get(sub.id) || {
      subjectName: sub.name,
      subjectCode: sub.code,
      conducted: 0,
      attended: 0,
    };
    existing.conducted += 1;
    if (
      sess.records.length > 0 &&
      (sess.records[0].status === AttendanceStatus.PRESENT ||
        sess.records[0].status === AttendanceStatus.ON_DUTY)
    ) {
      existing.attended += 1;
    }
    subjectMap.set(sub.id, existing);
  }

  const subjectsBreakdown = Array.from(subjectMap.values());

  const sessionsLog = sectionSessions.map((s) => ({
    id: s.id,
    date: new Date(s.sessionDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    period: s.periodNumber,
    subjectName: s.assignment.subjectOffering.subject.name,
    subjectCode: s.assignment.subjectOffering.subject.code,
    facultyName: s.assignment.faculty.user.fullName,
    status: s.records[0]?.status || "ABSENT",
  }));

  const activeLabBatch = student.labBatchMemberships[0]?.labBatch?.name;

  return (
    <div className="relative">
      <StudentDashboardView
        student={{
          fullName: student.user.fullName,
          rollNumber: student.rollNumber,
          programName: enrollment?.program.name || "Computer Science and Engineering",
          sectionName: enrollment?.section.name || "A",
          year: enrollment?.year || 1,
          semester: enrollment?.semester || 1,
          academicYear: enrollment?.academicYear.code || "2026-27",
          email: student.user.email || undefined,
          phone: student.user.phone || undefined,
          parentPhone: student.parentPhone || undefined,
          parentName: student.parentName || undefined,
          gender: student.gender || "Male",
          dateOfBirth: student.dateOfBirth
            ? new Date(student.dateOfBirth).toLocaleDateString("en-IN")
            : undefined,
          labBatchName: activeLabBatch,
        }}
        attendanceSummary={{
          overallPercentage,
          isDefaulter,
          totalClasses,
          attendedClasses,
          absentClasses,
          subjects: subjectsBreakdown,
          sessions: sessionsLog,
        }}
      />
    </div>
  );
}
