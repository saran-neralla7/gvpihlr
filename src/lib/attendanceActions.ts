import prisma from "./prisma";
import { getCurrentSession } from "./auth";
import { canMarkAttendanceForAssignment, canModifyAttendanceSession, isSuperAdmin } from "./rbac";
import { AttendanceSubmissionSchema, UpdateAttendanceRecordSchema } from "./validations";
import { recordAuditLog } from "./audit";
import { AttendanceStatus, SessionType } from "@prisma/client";

/**
 * Fetch assigned classes for the authenticated faculty member in the current academic year.
 * Super Admin can see all assignments.
 */
export async function getFacultyClasses(facultyId?: string) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const currentYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true, isActive: true },
  });
  if (!currentYear) return { success: false, error: "No active academic year configured" };

  const targetFacultyId = isSuperAdmin(session) ? facultyId : session.facultyId;

  const whereClause: any = {
    academicYearId: currentYear.id,
    isActive: true,
  };

  if (targetFacultyId) {
    whereClause.facultyId = targetFacultyId;
  }

  const assignments = await prisma.facultySubjectAssignment.findMany({
    where: whereClause,
    include: {
      faculty: {
        include: {
          user: { select: { fullName: true } },
          department: true,
        },
      },
      subjectOffering: {
        include: {
          subject: true,
          program: {
            include: { school: true },
          },
        },
      },
      section: {
        include: {
          labBatches: {
            where: { isActive: true },
            orderBy: { batchNumber: "asc" },
          },
        },
      },
    },
    orderBy: [
      { section: { program: { name: "asc" } } },
      { subjectOffering: { subject: { name: "asc" } } },
    ],
  });

  return { success: true, assignments, academicYear: currentYear };
}

/**
 * Fetch students enrolled in a section, optionally filtered by lab batch.
 */
export async function getClassRoster(sectionId: string, labBatchId?: string | null) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      program: true,
      academicYear: true,
      labBatches: { where: { isActive: true } },
    },
  });

  if (!section) return { success: false, error: "Section not found" };

  let studentIds: string[] | undefined;

  if (labBatchId) {
    const batchMemberships = await prisma.labBatchStudent.findMany({
      where: { labBatchId },
      select: { studentId: true },
    });
    studentIds = batchMemberships.map((b) => b.studentId);
  }

  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      sectionId,
      academicYearId: section.academicYearId,
      isCurrent: true,
      ...(studentIds ? { studentId: { in: studentIds } } : {}),
    },
    include: {
      student: {
        include: {
          user: { select: { fullName: true, phone: true } },
          labBatchMemberships: {
            include: { labBatch: true },
          },
        },
      },
    },
    orderBy: [
      { student: { rollNumber: "asc" } },
    ],
  });

  return {
    success: true,
    section,
    students: enrollments.map((e) => ({
      enrollmentId: e.id,
      studentId: e.student.id,
      rollNumber: e.student.rollNumber,
      fullName: e.student.user.fullName,
      phone: e.student.user.phone,
      labBatches: e.student.labBatchMemberships.map((m) => m.labBatch.name),
    })),
  };
}

/**
 * Submit an attendance session and its student records in an atomic transaction.
 */
export async function submitAttendanceSession(input: unknown) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Authentication required" };

  const parsed = AttendanceSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(", "),
    };
  }

  const data = parsed.data;

  // Verify resource-level authorization
  const authCheck = await canMarkAttendanceForAssignment(session, data.assignmentId);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.reason || "Unauthorized" };
  }

  const sessionDate = new Date(data.sessionDate);

  // Check for duplicate session for the exact period & date
  const existingSession = await prisma.attendanceSession.findFirst({
    where: {
      academicYearId: data.academicYearId,
      sectionId: data.sectionId,
      assignmentId: data.assignmentId,
      sessionDate,
      periodNumber: data.periodNumber,
      labBatchId: data.labBatchId || null,
    },
  });

  if (existingSession) {
    return {
      success: false,
      error: `An attendance session for Period ${data.periodNumber} on ${data.sessionDate} has already been submitted for this class.`,
    };
  }

  // Calculate snapshot metrics
  const totalStudents = data.records.length;
  const presentCount = data.records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
  const absentCount = totalStudents - presentCount;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const attendanceSession = await tx.attendanceSession.create({
        data: {
          academicYearId: data.academicYearId,
          assignmentId: data.assignmentId,
          sectionId: data.sectionId,
          facultyId: data.facultyId,
          labBatchId: data.labBatchId || null,
          sessionDate,
          periodNumber: data.periodNumber,
          sessionType: data.sessionType as SessionType,
          topicCovered: data.topicCovered || null,
          totalStudents,
          presentCount,
          absentCount,
          recordedById: session.userId,
          records: {
            createMany: {
              data: data.records.map((r) => ({
                studentId: r.studentId,
                status: r.status as AttendanceStatus,
                remarks: r.remarks || null,
              })),
            },
          },
        },
        include: {
          section: true,
          assignment: {
            include: {
              subjectOffering: {
                include: { subject: true },
              },
            },
          },
        },
      });

      return attendanceSession;
    });

    await recordAuditLog({
      userId: session.userId,
      action: "ATTENDANCE_SESSION_SUBMIT",
      resource: "AttendanceSession",
      resourceId: result.id,
      details: {
        sectionId: data.sectionId,
        period: data.periodNumber,
        date: data.sessionDate,
        total: totalStudents,
        present: presentCount,
        absent: absentCount,
      },
    });

    return {
      success: true,
      sessionId: result.id,
      message: "Attendance session recorded successfully.",
      summary: {
        total: totalStudents,
        present: presentCount,
        absent: absentCount,
        percentage: ((presentCount / totalStudents) * 100).toFixed(1),
      },
    };
  } catch (err: any) {
    console.error("Attendance submission error:", err);
    return { success: false, error: err.message || "Failed to record attendance session." };
  }
}

/**
 * Edit an attendance record with mandatory audit logging and reason.
 */
export async function updateAttendanceRecord(input: unknown) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Authentication required" };

  const parsed = UpdateAttendanceRecordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
  }

  const { recordId, newStatus, reason } = parsed.data;

  const currentRecord = await prisma.attendanceRecord.findUnique({
    where: { id: recordId },
    include: { session: true },
  });

  if (!currentRecord) return { success: false, error: "Record not found" };

  const authCheck = await canModifyAttendanceSession(session, currentRecord.sessionId);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.reason || "Unauthorized to edit this session" };
  }

  if (currentRecord.status === newStatus) {
    return { success: true, message: "Status is already set to " + newStatus };
  }

  const oldStatus = currentRecord.status;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update the record
      await tx.attendanceRecord.update({
        where: { id: recordId },
        data: { status: newStatus as AttendanceStatus },
      });

      // 2. Insert the immutable audit log entry
      await tx.attendanceAuditLog.create({
        data: {
          sessionId: currentRecord.sessionId,
          studentId: currentRecord.studentId,
          changedById: session.userId,
          oldStatus,
          newStatus: newStatus as AttendanceStatus,
          reason,
        },
      });

      // 3. Recalculate session counters
      const updatedCounts = await tx.attendanceRecord.groupBy({
        by: ["status"],
        where: { sessionId: currentRecord.sessionId },
        _count: { _all: true },
      });

      const newPresent =
        updatedCounts.find((c) => c.status === AttendanceStatus.PRESENT)?._count._all || 0;
      const newAbsent =
        updatedCounts.find((c) => c.status === AttendanceStatus.ABSENT)?._count._all || 0;

      await tx.attendanceSession.update({
        where: { id: currentRecord.sessionId },
        data: {
          presentCount: newPresent,
          absentCount: newAbsent,
        },
      });
    });

    await recordAuditLog({
      userId: session.userId,
      action: "ATTENDANCE_RECORD_UPDATE",
      resource: "AttendanceRecord",
      resourceId: recordId,
      details: {
        sessionId: currentRecord.sessionId,
        oldStatus,
        newStatus,
        reason,
      },
    });

    return {
      success: true,
      message: `Updated student status from ${oldStatus} to ${newStatus}.`,
    };
  } catch (err: any) {
    console.error("Attendance edit error:", err);
    return { success: false, error: err.message || "Failed to update attendance." };
  }
}
