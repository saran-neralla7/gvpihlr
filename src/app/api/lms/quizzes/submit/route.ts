import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.studentId) {
      return NextResponse.json({ success: false, error: "Only students can submit quiz attempts" }, { status: 401 });
    }

    const body = await req.json();
    const { quizId, submittedAnswers, tabSwitchCount } = body;

    if (!quizId || !submittedAnswers) {
      return NextResponse.json({ success: false, error: "Missing quizId or answers" }, { status: 400 });
    }

    // Check if student has already submitted
    const existing = await prisma.quizStudentAttempt.findUnique({
      where: {
        quizId_studentId: {
          quizId,
          studentId: session.studentId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "You have already completed this quiz.", attempt: existing },
        { status: 400 }
      );
    }

    // Load quiz with questions to auto-grade
    const quiz = await prisma.courseQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { questionBank: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q) => {
      const correctOpt = q.questionBank.correctOption;
      const userSelected = submittedAnswers[q.questionBankId];
      if (correctOpt !== null && userSelected !== undefined && Number(userSelected) === correctOpt) {
        score += q.marks || 1.0;
      }
    });

    const attempt = await prisma.quizStudentAttempt.create({
      data: {
        quizId,
        studentId: session.studentId,
        score,
        submittedAnswers,
        tabSwitchCount: parseInt(tabSwitchCount || "0", 10),
        completedAt: new Date(),
      },
    });

    // Record Telemetry
    await prisma.studentActivityLog
      .create({
        data: {
          studentId: session.studentId,
          userId: session.userId,
          category: "QUIZ_INTERACTION",
          action: "QUIZ_SUBMIT",
          targetResource: quizId,
          description: `Completed Quiz: "${quiz.title}" with score ${score}/${quiz.totalMarks} (Anti-cheat tab switches: ${tabSwitchCount || 0})`,
          metadata: {
            score,
            totalMarks: quiz.totalMarks,
            tabSwitchCount: tabSwitchCount || 0,
          },
        },
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      score,
      totalMarks: quiz.totalMarks,
      attempt,
    });
  } catch (err: any) {
    console.error("Quiz Submit error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit quiz attempt" }, { status: 500 });
  }
}
