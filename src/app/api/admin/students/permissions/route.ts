import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recordAuditLog, extractClientInfo } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");

  if (!session || (!isSuperAdminUser && !isOfficeUser)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { ipAddress, userAgent } = extractClientInfo(req);

  try {
    const body = await req.json();
    const { scope, studentId, studentIds, allowEdit } = body;

    if (typeof allowEdit !== "boolean") {
      return NextResponse.json({ success: false, error: "allowEdit must be a boolean" }, { status: 400 });
    }

    let updatedCount = 0;

    if (scope === "single") {
      if (!studentId) {
        return NextResponse.json({ success: false, error: "Missing studentId" }, { status: 400 });
      }
      await prisma.student.update({
        where: { id: studentId },
        data: { isProfileEditAllowed: allowEdit },
      });
      updatedCount = 1;
    } else if (scope === "selected") {
      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return NextResponse.json({ success: false, error: "No student IDs provided" }, { status: 400 });
      }
      const res = await prisma.student.updateMany({
        where: { id: { in: studentIds } },
        data: { isProfileEditAllowed: allowEdit },
      });
      updatedCount = res.count;
    } else if (scope === "all") {
      const res = await prisma.student.updateMany({
        data: { isProfileEditAllowed: allowEdit },
      });
      updatedCount = res.count;
    } else {
      return NextResponse.json({ success: false, error: "Invalid scope (must be single, selected, or all)" }, { status: 400 });
    }

    await recordAuditLog({
      userId: session.userId,
      action: "UPDATE",
      resource: "Student",
      resourceId: studentId || "BULK",
      details: { scope, allowEdit, updatedCount },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `Profile edit access ${allowEdit ? "enabled" : "disabled"} for ${updatedCount} student(s).`,
      count: updatedCount,
    });
  } catch (error: any) {
    console.error("Error updating student edit permissions:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update permissions" }, { status: 500 });
  }
}
