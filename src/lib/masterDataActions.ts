import prisma from "./prisma";
import { getCurrentSession } from "./auth";
import { isSuperAdmin } from "./rbac";
import { recordAuditLog } from "./audit";

/**
 * Universal deletion handler for Super Admin with historical integrity checks.
 * If historical attendance exists, rejects hard delete and guides user to deactivate.
 */
export async function deleteMasterRecord(
  entity: "school" | "department" | "program" | "section" | "labBatch" | "subject" | "faculty" | "student" | "assignment" | "regulation",
  id: string
) {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    return { success: false, error: "Unauthorized: Super Admin authority required." };
  }

  try {
    switch (entity) {
      case "school": {
        // Check if any sections or programs have attendance
        const attendanceCount = await prisma.attendanceSession.count({
          where: { section: { program: { schoolId: id } } },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This School is referenced by ${attendanceCount} historical attendance sessions and cannot be permanently deleted. You can deactivate it.`,
            canDeactivate: true,
          };
        }
        await prisma.school.delete({ where: { id } });
        break;
      }

      case "department": {
        const attendanceCount = await prisma.attendanceSession.count({
          where: { assignment: { subjectOffering: { subject: { departmentId: id } } } },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This Department is referenced by ${attendanceCount} attendance sessions through its subjects. You can deactivate it.`,
            canDeactivate: true,
          };
        }
        await prisma.department.delete({ where: { id } });
        break;
      }

      case "program": {
        const attendanceCount = await prisma.attendanceSession.count({
          where: { section: { programId: id } },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This Program is referenced by ${attendanceCount} attendance sessions. You can deactivate it.`,
            canDeactivate: true,
          };
        }
        await prisma.program.delete({ where: { id } });
        break;
      }

      case "section": {
        const attendanceCount = await prisma.attendanceSession.count({
          where: { sectionId: id },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This Section is referenced by ${attendanceCount} attendance sessions. You can deactivate it.`,
            canDeactivate: true,
          };
        }
        await prisma.section.delete({ where: { id } });
        break;
      }

      case "labBatch": {
        const attendanceCount = await prisma.attendanceSession.count({
          where: { labBatchId: id },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This Lab Batch is referenced by ${attendanceCount} attendance sessions. You can deactivate it.`,
            canDeactivate: true,
          };
        }
        await prisma.labBatch.delete({ where: { id } });
        break;
      }

      case "subject": {
        const attendanceCount = await prisma.attendanceSession.count({
          where: { assignment: { subjectOffering: { subjectId: id } } },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This Subject has ${attendanceCount} recorded attendance sessions. You can deactivate it.`,
            canDeactivate: true,
          };
        }
        await prisma.subject.delete({ where: { id } });
        break;
      }

      case "faculty": {
        const attendanceCount = await prisma.attendanceSession.count({
          where: { facultyId: id },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This Faculty has conducted ${attendanceCount} attendance sessions. You can deactivate their account instead of deleting.`,
            canDeactivate: true,
          };
        }
        const faculty = await prisma.faculty.findUnique({ where: { id } });
        if (faculty) {
          await prisma.user.delete({ where: { id: faculty.userId } });
        }
        break;
      }

      case "student": {
        const attendanceCount = await prisma.attendanceRecord.count({
          where: { studentId: id },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This Student has ${attendanceCount} attendance records in historical sessions. You can mark them inactive or alumni.`,
            canDeactivate: true,
          };
        }
        const student = await prisma.student.findUnique({ where: { id } });
        if (student) {
          await prisma.user.delete({ where: { id: student.userId } });
        }
        break;
      }

      case "assignment": {
        const attendanceCount = await prisma.attendanceSession.count({
          where: { assignmentId: id },
        });
        if (attendanceCount > 0) {
          return {
            success: false,
            error: `This Assignment has ${attendanceCount} attendance sessions logged. You can deactivate it.`,
            canDeactivate: true,
          };
        }
        await prisma.facultySubjectAssignment.delete({ where: { id } });
        break;
      }

      case "regulation": {
        const progCount = await prisma.program.count({
          where: { regulationId: id },
        });
        if (progCount > 0) {
          return {
            success: false,
            error: `This Regulation is referenced by ${progCount} program(s). You can deactivate it instead.`,
            canDeactivate: true,
          };
        }
        await prisma.regulation.delete({ where: { id } });
        break;
      }
    }

    await recordAuditLog({
      userId: session.userId,
      action: `DELETE_${entity.toUpperCase()}`,
      resource: entity,
      resourceId: id,
      status: "SUCCESS",
    });

    return { success: true, message: `Successfully deleted ${entity} record.` };
  } catch (error: any) {
    console.error(`Error deleting ${entity}:`, error);
    return { success: false, error: error.message || "Failed to delete record." };
  }
}

/**
 * Toggle active status / Archive record
 */
export async function toggleMasterActiveStatus(
  entity: "school" | "department" | "program" | "section" | "labBatch" | "subject" | "faculty" | "student" | "assignment" | "regulation",
  id: string,
  isActive: boolean
) {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    return { success: false, error: "Unauthorized: Super Admin authority required." };
  }

  try {
    switch (entity) {
      case "school":
        await prisma.school.update({ where: { id }, data: { isActive } });
        break;
      case "department":
        await prisma.department.update({ where: { id }, data: { isActive } });
        break;
      case "program":
        await prisma.program.update({ where: { id }, data: { isActive } });
        break;
      case "section":
        await prisma.section.update({ where: { id }, data: { isActive } });
        break;
      case "labBatch":
        await prisma.labBatch.update({ where: { id }, data: { isActive } });
        break;
      case "subject":
        await prisma.subject.update({ where: { id }, data: { isActive } });
        break;
      case "regulation":
        await prisma.regulation.update({ where: { id }, data: { isActive } });
        break;
      case "faculty": {
        const f = await prisma.faculty.update({ where: { id }, data: { isActive } });
        await prisma.user.update({ where: { id: f.userId }, data: { isActive } });
        break;
      }
      case "student": {
        const s = await prisma.student.update({
          where: { id },
          data: { status: isActive ? "ACTIVE" : "DISCONTINUED" },
        });
        await prisma.user.update({ where: { id: s.userId }, data: { isActive } });
        break;
      }
      case "assignment":
        await prisma.facultySubjectAssignment.update({ where: { id }, data: { isActive } });
        break;
    }

    await recordAuditLog({
      userId: session.userId,
      action: `TOGGLE_ACTIVE_${entity.toUpperCase()}`,
      resource: entity,
      resourceId: id,
      details: { newActiveState: isActive },
    });

    return { success: true, message: `Record status updated to ${isActive ? "Active" : "Inactive"}.` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update status." };
  }
}
