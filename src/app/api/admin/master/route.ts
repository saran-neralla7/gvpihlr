import { NextResponse } from "next/server";
import { getCurrentSession, hashPassword } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { deleteMasterRecord, toggleMasterActiveStatus } from "@/lib/masterDataActions";
import prisma from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { RoleType, SubjectType, StudentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { entity, data } = body;

    if (!entity || !data) {
      return NextResponse.json({ success: false, error: "Missing entity or data" }, { status: 400 });
    }

    let created: any;

    switch (entity) {
      case "school": {
        if (!data.code || !data.name) {
          return NextResponse.json({ success: false, error: "School code and name are required." }, { status: 400 });
        }
        created = await prisma.school.create({
          data: {
            code: data.code.trim().toUpperCase(),
            name: data.name.trim(),
            description: data.description?.trim() || null,
            isActive: true,
          },
        });
        break;
      }

      case "department": {
        if (!data.code || !data.name) {
          return NextResponse.json({ success: false, error: "Department code and name are required." }, { status: 400 });
        }
        if (!data.isTeachingOnly && !data.schoolId) {
          return NextResponse.json({ success: false, error: "School is required for degree program departments." }, { status: 400 });
        }
        created = await prisma.department.create({
          data: {
            code: data.code.trim().toUpperCase(),
            name: data.name.trim(),
            schoolId: data.isTeachingOnly ? null : (data.schoolId || null),
            isTeachingOnly: Boolean(data.isTeachingOnly),
            isActive: true,
          },
        });
        break;
      }

      case "program": {
        if (!data.code || !data.name || !data.schoolId) {
          return NextResponse.json({ success: false, error: "Program code, name, and School are required." }, { status: 400 });
        }
        created = await prisma.program.create({
          data: {
            code: data.code.trim().toUpperCase(),
            name: data.name.trim(),
            schoolId: data.schoolId,
            degreeType: data.degreeType || "UG",
            durationYears: Number(data.durationYears) || 4,
            totalSemesters: Number(data.totalSemesters) || 8,
            isActive: true,
          },
        });
        break;
      }

      case "section": {
        if (!data.name || !data.programId) {
          return NextResponse.json({ success: false, error: "Section name and Program are required." }, { status: 400 });
        }
        // Get active academic year
        let ay = await prisma.academicYear.findFirst({ where: { isCurrent: true, isActive: true } });
        if (!ay) {
          ay = await prisma.academicYear.findFirst({ orderBy: { code: "desc" } });
        }
        if (!ay) {
          return NextResponse.json({ success: false, error: "No active Academic Year found." }, { status: 400 });
        }

        const prog = await prisma.program.findUnique({ where: { id: data.programId } });
        const year = Number(data.year) || 1;
        const sem = Number(data.semester) || 1;
        const secName = data.name.trim().toUpperCase();

        created = await prisma.section.create({
          data: {
            academicYearId: ay.id,
            programId: data.programId,
            year,
            semester: sem,
            name: secName,
            displayName: `${prog?.name || "Program"} - Year ${year} - Sem ${sem} - Sec ${secName}`,
            capacity: Number(data.capacity) || 65,
            isActive: true,
          },
        });
        break;
      }

      case "subject": {
        if (!data.code || !data.name || !data.departmentId) {
          return NextResponse.json({ success: false, error: "Subject code, name, and Teaching Department are required." }, { status: 400 });
        }
        created = await prisma.subject.create({
          data: {
            code: data.code.trim().toUpperCase(),
            name: data.name.trim(),
            shortName: (data.shortName || data.code).trim().toUpperCase(),
            credits: Number(data.credits) || 3.0,
            type: (data.type as SubjectType) || SubjectType.THEORY,
            departmentId: data.departmentId,
            syllabus: data.syllabus?.trim() || null,
            description: data.description?.trim() || null,
            isActive: true,
          },
        });
        break;
      }

      case "regulation": {
        if (!data.code || !data.name) {
          return NextResponse.json({ success: false, error: "Regulation code and name are required." }, { status: 400 });
        }
        created = await prisma.regulation.create({
          data: {
            code: data.code.trim().toUpperCase(),
            name: data.name.trim(),
            description: data.description?.trim() || null,
            academicYearStart: data.academicYearStart?.trim() || "2026-27",
            isActive: true,
          },
        });
        break;
      }

      case "faculty": {
        if (!data.fullName || !data.shortName || !data.departmentId) {
          return NextResponse.json({ success: false, error: "Faculty full name, short name (e.g. KR), and Department are required." }, { status: 400 });
        }

        const facultyRole = await prisma.role.findUniqueOrThrow({
          where: { name: RoleType.FACULTY },
        });

        const empId = data.employeeId?.trim() || `GVPIHLR-FAC-${data.shortName.trim().toUpperCase()}`;
        const email = data.email?.trim() || `${data.shortName.trim().toLowerCase()}@gvpihlr.edu.in`;
        const phone = data.phone?.trim() || "+91 9440112233";
        const passwordHash = await hashPassword(data.password || "Faculty@1234");

        const user = await prisma.user.create({
          data: {
            username: empId,
            email,
            passwordHash,
            fullName: data.fullName.trim(),
            phone,
            isActive: true,
            userRoles: {
              create: {
                roleId: facultyRole.id,
                departmentId: data.departmentId,
              },
            },
          },
        });

        created = await prisma.faculty.create({
          data: {
            userId: user.id,
            employeeId: empId,
            shortName: data.shortName.trim().toUpperCase(),
            designation: data.designation?.trim() || "Assistant Professor",
            qualification: data.qualification?.trim() || "Ph.D",
            departmentId: data.departmentId,
            isActive: true,
          },
        });
        break;
      }

      case "student": {
        if (!data.rollNumber || !data.fullName || !data.sectionId || !data.programId) {
          return NextResponse.json({ success: false, error: "Roll number, name, program, and section are required." }, { status: 400 });
        }

        const studentRole = await prisma.role.findUniqueOrThrow({
          where: { name: RoleType.STUDENT },
        });

        const roll = data.rollNumber.trim().toUpperCase();
        const email = data.email?.trim() || `${roll.toLowerCase()}@student.gvpihlr.edu.in`;
        const phone = data.phone?.trim() || "+91 9848011000";
        const passwordHash = await hashPassword(data.password || "Student@1234");

        let ay = await prisma.academicYear.findFirst({ where: { isCurrent: true, isActive: true } });
        if (!ay) ay = await prisma.academicYear.findFirst({ orderBy: { code: "desc" } });
        if (!ay) return NextResponse.json({ success: false, error: "No Academic Year found." }, { status: 400 });

        const user = await prisma.user.create({
          data: {
            username: roll,
            email,
            passwordHash,
            fullName: data.fullName.trim(),
            phone,
            isActive: true,
            userRoles: {
              create: {
                roleId: studentRole.id,
                programId: data.programId,
              },
            },
          },
        });

        const stu = await prisma.student.create({
          data: {
            userId: user.id,
            rollNumber: roll,
            registerNumber: `REG-${roll}`,
            parentName: data.parentName?.trim() || `Parent of ${data.fullName.trim()}`,
            parentPhone: data.parentPhone?.trim() || "+91 9849099999",
            status: StudentStatus.ACTIVE,
            admissionYear: data.admissionYear || "2026",
          },
        });

        await prisma.studentEnrollment.create({
          data: {
            studentId: stu.id,
            academicYearId: ay.id,
            programId: data.programId,
            year: Number(data.year) || 1,
            semester: Number(data.semester) || 1,
            sectionId: data.sectionId,
            isCurrent: true,
          },
        });

        created = stu;
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unsupported entity: ${entity}` }, { status: 400 });
    }

    await recordAuditLog({
      userId: session.userId,
      action: `CREATE_${entity.toUpperCase()}`,
      resource: entity,
      resourceId: created.id,
      details: data,
    });

    return NextResponse.json({
      success: true,
      created,
      message: `${entity.charAt(0).toUpperCase() + entity.slice(1)} created successfully!`,
    });
  } catch (err: any) {
    console.error("Master create error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create record." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity") as any;
  const id = searchParams.get("id");

  if (!entity || !id) {
    return NextResponse.json({ success: false, error: "Entity and ID required" }, { status: 400 });
  }

  const result = await deleteMasterRecord(entity, id);
  return NextResponse.json(result);
}

export async function PATCH(req: Request) {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { entity, id, isActive } = body;

    if (!entity || !id || typeof isActive !== "boolean") {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const result = await toggleMasterActiveStatus(entity, id, isActive);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { entity, id, data } = body;

    if (!entity || !id || !data) {
      return NextResponse.json({ success: false, error: "Missing entity, id, or data" }, { status: 400 });
    }

    let updated: any;
    switch (entity) {
      case "school":
        updated = await prisma.school.update({
          where: { id },
          data: { name: data.name, description: data.description, isActive: data.isActive },
        });
        break;

      case "department":
        updated = await prisma.department.update({
          where: { id },
          data: {
            name: data.name,
            schoolId: data.isTeachingOnly ? null : (data.schoolId !== undefined ? data.schoolId : undefined),
            isTeachingOnly: data.isTeachingOnly !== undefined ? data.isTeachingOnly : undefined,
            isActive: data.isActive,
          },
        });
        break;

      case "program":
        updated = await prisma.program.update({
          where: { id },
          data: { name: data.name, degreeType: data.degreeType, isActive: data.isActive },
        });
        break;

      case "section":
        updated = await prisma.section.update({
          where: { id },
          data: { name: data.name, capacity: Number(data.capacity), isActive: data.isActive },
        });
        break;

      case "subject":
        updated = await prisma.subject.update({
          where: { id },
          data: {
            name: data.name,
            shortName: data.shortName,
            credits: Number(data.credits),
            type: data.type,
            syllabus: data.syllabus !== undefined ? data.syllabus : undefined,
            description: data.description !== undefined ? data.description : undefined,
            isActive: data.isActive,
          },
        });
        break;

      case "regulation":
        updated = await prisma.regulation.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            academicYearStart: data.academicYearStart,
            isActive: data.isActive,
          },
        });
        break;

      case "faculty": {
        const fac = await prisma.faculty.update({
          where: { id },
          data: {
            shortName: data.shortName?.trim().toUpperCase(),
            designation: data.designation?.trim(),
            qualification: data.qualification?.trim(),
            departmentId: data.departmentId || undefined,
            isActive: data.isActive !== undefined ? data.isActive : undefined,
          },
        });
        const userUpdateData: any = {};
        if (data.fullName) userUpdateData.fullName = data.fullName.trim();
        if (data.email) userUpdateData.email = data.email.trim();
        if (data.phone) userUpdateData.phone = data.phone.trim();
        if (data.password && data.password.trim()) {
          userUpdateData.passwordHash = await hashPassword(data.password.trim());
        }
        if (Object.keys(userUpdateData).length > 0) {
          await prisma.user.update({
            where: { id: fac.userId },
            data: userUpdateData,
          });
        }
        if (data.departmentId) {
          await prisma.userRole.updateMany({
            where: { userId: fac.userId },
            data: { departmentId: data.departmentId },
          });
        }
        updated = fac;
        break;
      }

      case "student": {
        const stu = await prisma.student.update({
          where: { id },
          data: {
            rollNumber: data.rollNumber?.trim().toUpperCase(),
            parentPhone: data.parentPhone?.trim(),
            parentName: data.parentName?.trim(),
            status: data.status || undefined,
          },
        });
        const userUpdateData: any = {};
        if (data.fullName) userUpdateData.fullName = data.fullName.trim();
        if (data.email) userUpdateData.email = data.email.trim();
        if (data.phone) userUpdateData.phone = data.phone.trim();
        if (data.password && data.password.trim()) {
          userUpdateData.passwordHash = await hashPassword(data.password.trim());
        }
        if (Object.keys(userUpdateData).length > 0) {
          await prisma.user.update({
            where: { id: stu.userId },
            data: userUpdateData,
          });
        }
        if (data.sectionId) {
          await prisma.studentEnrollment.updateMany({
            where: { studentId: stu.id, isCurrent: true },
            data: {
              sectionId: data.sectionId,
              programId: data.programId || undefined,
            },
          });
        }
        updated = stu;
        break;
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown entity" }, { status: 400 });
    }

    await recordAuditLog({
      userId: session.userId,
      action: `UPDATE_${entity.toUpperCase()}`,
      resource: entity,
      resourceId: id,
      details: data,
    });

    return NextResponse.json({ success: true, updated, message: "Record updated successfully." });
  } catch (err: any) {
    console.error("Master update error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
