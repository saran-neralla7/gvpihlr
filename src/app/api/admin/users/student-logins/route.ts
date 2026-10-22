import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recordAuditLog, extractClientInfo } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");
  const isAcademicAdmin = session?.roles.includes("ACADEMIC_ADMIN") || session?.roles.includes("DEAN");

  if (!session || (!isSuperAdminUser && !isOfficeUser && !isAcademicAdmin)) {
    return NextResponse.json({ success: false, error: "Unauthorized: Admin access required." }, { status: 403 });
  }

  const { ipAddress, userAgent } = extractClientInfo(req);

  try {
    const body = await req.json();
    const { scope, studentId, studentIds, enable } = body;

    if (typeof enable !== "boolean") {
      return NextResponse.json({ success: false, error: "enable must be a boolean" }, { status: 400 });
    }

    let updatedCount = 0;

    if (scope === "all") {
      const res = await prisma.user.updateMany({
        where: {
          studentProfile: { isNot: null },
        },
        data: { isActive: enable },
      });
      updatedCount = res.count;
    } else if (scope === "selected") {
      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return NextResponse.json({ success: false, error: "No student IDs provided" }, { status: 400 });
      }

      const res = await prisma.user.updateMany({
        where: {
          studentProfile: { id: { in: studentIds } },
        },
        data: { isActive: enable },
      });
      updatedCount = res.count;
    } else if (scope === "single") {
      if (!studentId) {
        return NextResponse.json({ success: false, error: "Missing studentId" }, { status: 400 });
      }

      const res = await prisma.user.updateMany({
        where: {
          studentProfile: { id: studentId },
        },
        data: { isActive: enable },
      });

      if (res.count === 0) {
        return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
      }

      updatedCount = res.count;
    } else {
      return NextResponse.json({ success: false, error: "Invalid scope (all, selected, single)" }, { status: 400 });
    }

    await recordAuditLog({
      userId: session.userId,
      action: enable ? "ENABLE_STUDENT_LOGINS" : "DISABLE_STUDENT_LOGINS",
      resource: "User",
      resourceId: studentId || "BULK",
      details: { scope, enable, updatedCount },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `Student logins successfully ${enable ? "enabled" : "disabled"} for ${updatedCount} student(s).`,
      count: updatedCount,
    });
  } catch (err: any) {
    console.error("Student login update error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to update login status" }, { status: 500 });
  }
}
