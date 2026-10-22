import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { QuestionDifficulty, QuestionType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const unitNumber = searchParams.get("unitNumber");
    const difficulty = searchParams.get("difficulty");

    if (!subjectId) {
      return NextResponse.json({ success: false, error: "subjectId is required" }, { status: 400 });
    }

    const where: any = { subjectId };
    if (unitNumber) {
      where.unitNumber = parseInt(unitNumber, 10);
    }
    if (difficulty && difficulty in QuestionDifficulty) {
      where.difficulty = difficulty as QuestionDifficulty;
    }

    const questions = await prisma.questionBankItem.findMany({
      where,
      orderBy: [{ unitNumber: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    console.error("Questions GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load questions" }, { status: 500 });
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
      subjectId,
      assignmentId,
      unitNumber,
      difficulty,
      type,
      questionText,
      options,
      correctOption,
      explanation,
      bloomsLevel,
      marks,
    } = body;

    if (!subjectId || !unitNumber || !questionText) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const question = await prisma.questionBankItem.create({
      data: {
        subjectId,
        assignmentId: assignmentId || null,
        unitNumber: parseInt(unitNumber, 10),
        difficulty: (difficulty as QuestionDifficulty) || QuestionDifficulty.MEDIUM,
        type: (type as QuestionType) || QuestionType.MCQ,
        questionText,
        options: options || undefined,
        correctOption: correctOption !== undefined ? parseInt(correctOption, 10) : null,
        explanation: explanation || null,
        bloomsLevel: bloomsLevel || "Understand",
        marks: marks ? parseFloat(marks) : 1.0,
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (err: any) {
    console.error("Questions POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to create question" }, { status: 500 });
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

    await prisma.questionBankItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Question deleted successfully" });
  } catch (err: any) {
    console.error("Questions DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete question" }, { status: 500 });
  }
}
