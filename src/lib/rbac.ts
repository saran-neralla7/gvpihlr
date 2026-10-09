import { RoleType } from "@prisma/client";
import { SessionPayload } from "./auth";
import prisma from "./prisma";

export function isSuperAdmin(session: SessionPayload | null): boolean {
  if (!session) return false;
  return session.roles.includes(RoleType.SUPER_ADMIN);
}

export function isFaculty(session: SessionPayload | null): boolean {
  if (!session) return false;
  return session.roles.includes(RoleType.FACULTY) || isSuperAdmin(session);
}

export function isDeanOrDirector(session: SessionPayload | null): boolean {
  if (!session) return false;
  return (
    session.roles.includes(RoleType.DEAN) ||
    session.roles.includes(RoleType.DIRECTOR) ||
    isSuperAdmin(session)
  );
}

export function isHOD(session: SessionPayload | null): boolean {
  if (!session) return false;
  return session.roles.includes(RoleType.HOD) || isSuperAdmin(session);
}

/**
 * Verify that a faculty member is authorized to access and mark attendance for an assignment.
 * Super Admin is always authorized.
 */
export async function canMarkAttendanceForAssignment(
  session: SessionPayload,
  assignmentId: string
): Promise<{ authorized: boolean; reason?: string }> {
  if (isSuperAdmin(session)) {
    return { authorized: true };
  }

  if (!session.facultyId) {
    return { authorized: false, reason: "Authenticated user is not linked to a faculty profile" };
  }

  const assignment = await prisma.facultySubjectAssignment.findUnique({
    where: { id: assignmentId },
    include: { faculty: true },
  });

  if (!assignment) {
    return { authorized: false, reason: "Assignment not found" };
  }

  if (assignment.facultyId !== session.facultyId) {
    return {
      authorized: false,
      reason: "Security Violation: Faculty is not assigned to this subject offering/section",
    };
  }

  return { authorized: true };
}

/**
 * Check if user can modify an existing attendance record.
 * Super Admin and HOD can modify; Faculty can only modify if they conducted the session.
 */
export async function canModifyAttendanceSession(
  session: SessionPayload,
  sessionId: string
): Promise<{ authorized: boolean; reason?: string }> {
  if (isSuperAdmin(session) || isHOD(session)) {
    return { authorized: true };
  }

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
  });

  if (!attendanceSession) {
    return { authorized: false, reason: "Session not found" };
  }

  if (session.facultyId && attendanceSession.facultyId === session.facultyId) {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: "Unauthorized: You do not possess the required privilege to modify this session",
  };
}
