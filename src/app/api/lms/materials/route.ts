import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { saveCourseMaterialFile, deleteCourseMaterialFile } from "@/lib/lmsStorage";
import { MaterialType } from "@prisma/client";

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

    const materials = await prisma.courseMaterial.findMany({
      where,
      orderBy: [{ unitNumber: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, materials });
  } catch (err: any) {
    console.error("LMS Materials GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load materials" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (!session.roles.includes("FACULTY") && !session.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const assignmentId = formData.get("assignmentId") as string;
    const unitNumberStr = formData.get("unitNumber") as string;
    const topicId = (formData.get("topicId") as string) || null;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const typeStr = (formData.get("type") as string) || "LECTURE_NOTES_PDF";
    const file = formData.get("file") as File | null;

    if (!assignmentId || !unitNumberStr || !title || !file) {
      return NextResponse.json({ success: false, error: "Missing required fields or file" }, { status: 400 });
    }

    const unitNumber = parseInt(unitNumberStr, 10);

    // Look up assignment to get subject code
    const assignment = await prisma.facultySubjectAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        subjectOffering: {
          include: { subject: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    const subjectCode = assignment.subjectOffering.subject.code;

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file to Option A storage (public/uploads/materials/[subjectCode]/unit-[unitNumber]/)
    const saved = await saveCourseMaterialFile({
      subjectCode,
      unitNumber,
      originalFileName: file.name,
      buffer,
    });

    // Create CourseMaterial record in PostgreSQL
    const material = await prisma.courseMaterial.create({
      data: {
        assignmentId,
        unitNumber,
        topicId: topicId || null,
        title,
        description,
        type: (typeStr in MaterialType ? typeStr : "LECTURE_NOTES_PDF") as MaterialType,
        fileUrl: saved.fileUrl,
        fileName: saved.fileName,
        fileSize: saved.fileSize,
      },
    });

    return NextResponse.json({ success: true, material });
  } catch (err: any) {
    console.error("LMS Materials POST error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to upload material" }, { status: 500 });
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

    const material = await prisma.courseMaterial.findUnique({ where: { id } });
    if (!material) {
      return NextResponse.json({ success: false, error: "Material not found" }, { status: 404 });
    }

    // Delete physical file from disk
    await deleteCourseMaterialFile(material.fileUrl);

    // Delete record from database
    await prisma.courseMaterial.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Material deleted successfully" });
  } catch (err: any) {
    console.error("LMS Materials DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete material" }, { status: 500 });
  }
}
