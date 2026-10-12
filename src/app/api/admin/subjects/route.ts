import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    const isSuperAdmin = session?.roles.includes("SUPER_ADMIN");
    const isOffice = session?.roles.includes("OFFICE");

    if (!session || (!isSuperAdmin && !isOffice)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, name, shortName, type, credits, departmentId } = body;

    if (!code || !name || !departmentId) {
      return NextResponse.json(
        { success: false, error: "Code, Name, and Department are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.subject.findFirst({
      where: { code: { equals: code.trim(), mode: "insensitive" } },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Course with code ${code} already exists` },
        { status: 409 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        shortName: (shortName || code).trim().toUpperCase(),
        type: type === "LAB" ? "LAB" : "THEORY",
        credits: parseInt(credits) || 3,
        departmentId,
        isActive: true,
      },
      include: {
        department: true,
      },
    });

    // Record Audit Log with IP and device
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    await recordAuditLog({
      userId: session.userId,
      action: "SUBJECT_CREATE",
      resource: "Subject",
      resourceId: subject.id,
      ipAddress,
      userAgent,
      details: {
        code: subject.code,
        name: subject.name,
        type: subject.type,
        credits: subject.credits,
      },
    });

    return NextResponse.json({
      success: true,
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        shortName: subject.shortName || subject.code,
        type: subject.type,
        credits: subject.credits,
        departmentId: subject.departmentId,
        departmentName: subject.department.name,
        departmentCode: subject.department.code,
        offeringsCount: 0,
      },
    });
  } catch (error: any) {
    console.error("Create subject error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create subject" },
      { status: 500 }
    );
  }
}
