import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { extractClientInfo } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.studentId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { ipAddress, userAgent, deviceSummary } = extractClientInfo(req);
    const body = await req.json();

    const { category, action, targetResource, description, metadata } = body;

    if (!category || !action) {
      return NextResponse.json({ success: false, error: "Missing required telemetry fields" }, { status: 400 });
    }

    // Record the activity log
    const log = await prisma.studentActivityLog.create({
      data: {
        studentId: session.studentId,
        userId: session.userId,
        category,
        action,
        targetResource: targetResource ? String(targetResource) : null,
        description: description || `Student performed ${action}`,
        ipAddress,
        userAgent,
        deviceType: deviceSummary.includes("Mobile") ? "Mobile" : "Desktop",
        deviceModel: deviceSummary,
        metadata: metadata || undefined,
      },
    });

    // If viewing or downloading course material, increment stats
    if (action === "MATERIAL_VIEW" && targetResource) {
      await prisma.courseMaterial
        .update({
          where: { id: String(targetResource) },
          data: { viewCount: { increment: 1 } },
        })
        .catch(() => {});
    } else if (action === "MATERIAL_DOWNLOAD" && targetResource) {
      await prisma.courseMaterial
        .update({
          where: { id: String(targetResource) },
          data: { downloadCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    return NextResponse.json({ success: true, logId: log.id });
  } catch (err: any) {
    console.error("Telemetry error:", err);
    return NextResponse.json({ success: false, error: "Failed to record telemetry" }, { status: 500 });
  }
}
