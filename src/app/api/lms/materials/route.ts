import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { saveCourseMaterialFile, deleteCourseMaterialFile } from "@/lib/lmsStorage";
import { MaterialType } from "@prisma/client";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const unitNumber = searchParams.get("unitNumber");

    if (!assignmentId) {
      return NextResponse.json({ success: false, error: "assignmentId is required" }, { status: 400 });
    }

    // Resolve sibling assignments sharing the same subject offering & section
    // so all co-faculty and students see the shared pool of materials
    const currentAssignment = await prisma.facultySubjectAssignment.findUnique({
      where: { id: assignmentId },
      select: { subjectOfferingId: true, sectionId: true },
    });

    let assignmentIds = [assignmentId];
    if (currentAssignment) {
      const siblings = await prisma.facultySubjectAssignment.findMany({
        where: {
          subjectOfferingId: currentAssignment.subjectOfferingId,
          sectionId: currentAssignment.sectionId,
          isActive: true,
        },
        select: { id: true },
      });
      if (siblings.length > 0) {
        assignmentIds = siblings.map((s) => s.id);
      }
    }

    const where: any = { assignmentId: { in: assignmentIds } };
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
    const rateLimitError = enforceRateLimit(req, "lms:materials:upload", {
      maxRequests: 30,
      windowMs: 60 * 1000,
      message: "Upload rate limit reached. Please wait a moment before uploading more files.",
    });
    if (rateLimitError) return rateLimitError;

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
    const videoUrl = (formData.get("videoUrl") as string) || (formData.get("fileUrl") as string) || "";
    const file = formData.get("file") as File | null;

    const isLinkType = typeStr === "VIDEO_LECTURE" || typeStr === "REFERENCE_LINK";

    if (!assignmentId || !unitNumberStr || !title) {
      return NextResponse.json({ success: false, error: "Missing required fields (assignmentId, unitNumber, title)" }, { status: 400 });
    }

    if (!isLinkType && !file) {
      return NextResponse.json({ success: false, error: "Please select a file to upload" }, { status: 400 });
    }

    if (isLinkType && !videoUrl && !file) {
      return NextResponse.json({ success: false, error: "Please provide a valid video lecture URL or link" }, { status: 400 });
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

    let savedFileUrl = "";
    let savedFileName = "";
    let savedFileSize = 0;

    if (file && file.size > 0) {
      // STRICT 5MB FILE SIZE LIMIT
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a file under 5MB.`,
          },
          { status: 400 }
        );
      }

      // Convert file to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save file to Option A storage
      const saved = await saveCourseMaterialFile({
        subjectCode,
        unitNumber,
        originalFileName: file.name,
        buffer,
      });

      savedFileUrl = saved.fileUrl;
      savedFileName = saved.fileName;
      savedFileSize = saved.fileSize;
    } else if (isLinkType && videoUrl) {
      // Video or reference link
      savedFileUrl = videoUrl.trim();
      savedFileName = title.trim();
      savedFileSize = 0;
    }

    // Create CourseMaterial record in PostgreSQL
    const material = await prisma.courseMaterial.create({
      data: {
        assignmentId,
        unitNumber,
        topicId: topicId || null,
        title: title.trim(),
        description: description.trim(),
        type: (typeStr in MaterialType ? typeStr : "LECTURE_NOTES_PDF") as MaterialType,
        fileUrl: savedFileUrl,
        fileName: savedFileName || "Resource Link",
        fileSize: savedFileSize,
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
