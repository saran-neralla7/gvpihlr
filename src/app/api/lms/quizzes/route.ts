import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const sectionId = searchParams.get("sectionId");

    const where: any = {};
    if (assignmentId) {
      where.assignmentId = assignmentId;
    } else if (sectionId) {
      where.assignment = { sectionId };
    }

    // If student, only show published quizzes
    if (session.studentId) {
      where.isPublished = true;
    }

    const quizzes = await prisma.courseQuiz.findMany({
      where,
      include: {
        assignment: {
          include: {
            subjectOffering: { include: { subject: true } },
            faculty: { include: { user: true } },
            section: true,
          },
        },
        questions: {
          include: { questionBank: true },
          orderBy: { order: "asc" },
        },
        attempts: session.studentId
          ? {
              where: { studentId: session.studentId },
            }
          : {
              include: { student: true },
            },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, quizzes });
  } catch (err: any) {
    console.error("Quizzes GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load quizzes" }, { status: 500 });
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
      title,
      unitNumber,
      durationMinutes,
      totalMarks,
      startTime,
      endTime,
      isPublished,
      questionIds, // Array of questionBankItem IDs
    } = body;

    if (!assignmentId || !title || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const quiz = await prisma.courseQuiz.create({
      data: {
        assignmentId,
        title,
        unitNumber: unitNumber ? parseInt(unitNumber, 10) : null,
        durationMinutes: parseInt(durationMinutes || "20", 10),
        totalMarks: parseFloat(totalMarks || "20.0"),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isPublished: Boolean(isPublished),
        questions: {
          create: (questionIds || []).map((qId: string, idx: number) => ({
            questionBankId: qId,
            order: idx + 1,
            marks: 1.0,
          })),
        },
      },
      include: {
        questions: { include: { questionBank: true } },
      },
    });

    return NextResponse.json({ success: true, quiz });
  } catch (err: any) {
    console.error("Quizzes POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to create quiz" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (!session.roles.includes("FACULTY") && !session.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isPublished } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const quiz = await prisma.courseQuiz.update({
      where: { id },
      data: {
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      },
    });

    return NextResponse.json({ success: true, quiz });
  } catch (err: any) {
    console.error("Quizzes PATCH error:", err);
    return NextResponse.json({ success: false, error: "Failed to update quiz" }, { status: 500 });
  }
}
