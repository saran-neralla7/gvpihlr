import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { canMarkAttendanceForAssignment } from "@/lib/rbac";
import { getClassRoster } from "@/lib/attendanceActions";
import prisma from "@/lib/prisma";
import AttendanceMarkerClient from "./AttendanceMarkerClient";

export default async function MarkAttendancePage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const { assignmentId } = params;

  // Authorization check: Verify user is authorized to mark for this assignment
  const auth = await canMarkAttendanceForAssignment(session, assignmentId);
  if (!auth.authorized) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-800">
        <h3 className="text-lg font-bold">Unauthorized Attendance Access</h3>
        <p className="text-xs mt-1">{auth.reason || "You are not authorized to mark attendance for this class."}</p>
      </div>
    );
  }

  // Load assignment details
  const assignment = await prisma.facultySubjectAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      academicYear: true,
      faculty: { include: { user: { select: { fullName: true } } } },
      subjectOffering: {
        include: {
          subject: true,
          program: true,
        },
      },
      section: {
        include: {
          labBatches: { where: { isActive: true }, orderBy: { batchNumber: "asc" } },
        },
      },
    },
  });

  if (!assignment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        Class assignment not found.
      </div>
    );
  }

  // Fetch student roster for this section
  const rosterResult = await getClassRoster(assignment.sectionId);
  const students = rosterResult.students || [];

  const assignmentPayload = {
    id: assignment.id,
    academicYearId: assignment.academicYearId,
    facultyId: assignment.facultyId,
    facultyName: assignment.faculty.user.fullName,
    facultyShortName: assignment.faculty.shortName,
    subjectName: assignment.subjectOffering.subject.name,
    subjectCode: assignment.subjectOffering.subject.code,
    subjectType: assignment.subjectOffering.subject.type,
    programName: assignment.subjectOffering.program.name,
    year: assignment.subjectOffering.year,
    semester: assignment.subjectOffering.semester,
    sectionId: assignment.sectionId,
    sectionName: assignment.section.name,
    labBatches: assignment.section.labBatches.map((b) => ({
      id: b.id,
      name: b.name,
      batchNumber: b.batchNumber,
    })),
  };

  return (
    <AttendanceMarkerClient
      assignment={assignmentPayload}
      initialStudents={students}
    />
  );
}
