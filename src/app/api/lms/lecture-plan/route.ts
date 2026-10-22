import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { DeliveryStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const unitNumber = searchParams.get("unitNumber");

    if (!assignmentId) {
      return NextResponse.json({ success: false, error: "assignmentId is required" }, { status: 400 });
    }

    const where: any = { assignmentId };
    if (unitNumber) {
      where.unitNumber = parseInt(unitNumber, 10);
    }

    const topics = await prisma.lecturePlanTopic.findMany({
      where,
      orderBy: [{ unitNumber: "asc" }, { topicSequence: "asc" }, { plannedDate: "asc" }],
    });

    return NextResponse.json({ success: true, topics });
  } catch (err: any) {
    console.error("Lecture Plan GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load lecture plan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (!session.roles.includes("FACULTY") && !session.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      assignmentId,
      unitNumber,
      topicSequence,
      topicTitle,
      subTopics,
      plannedDate,
      deliveryMode,
      remarks,
    } = body;

    if (!assignmentId || !unitNumber || !topicTitle || !plannedDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const topic = await prisma.lecturePlanTopic.create({
      data: {
        assignmentId,
        unitNumber: parseInt(unitNumber, 10),
        topicSequence: parseInt(topicSequence || "1", 10),
        topicTitle,
        subTopics: subTopics || null,
        plannedDate: new Date(plannedDate),
        deliveryMode: deliveryMode || "Chalk & Talk",
        remarks: remarks || null,
        status: DeliveryStatus.PLANNED,
      },
    });

    return NextResponse.json({ success: true, topic });
  } catch (err: any) {
    console.error("Lecture Plan POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to create lecture topic" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (!session.roles.includes("FACULTY") && !session.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, actualDate, remarks } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Topic id is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status as DeliveryStatus;
      if (status === "COMPLETED") {
        updateData.actualDate = actualDate ? new Date(actualDate) : new Date();
      } else if (status === "PLANNED") {
        updateData.actualDate = null;
      }
    }
    if (remarks !== undefined) updateData.remarks = remarks;

    const topic = await prisma.lecturePlanTopic.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, topic });
  } catch (err: any) {
    console.error("Lecture Plan PATCH error:", err);
    return NextResponse.json({ success: false, error: "Failed to update lecture topic" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (!session.roles.includes("FACULTY") && !session.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    await prisma.lecturePlanTopic.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Topic deleted successfully" });
  } catch (err: any) {
    console.error("Lecture Plan DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete topic" }, { status: 500 });
  }
}
