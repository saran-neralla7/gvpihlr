import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId) {
      return NextResponse.json({ success: false, error: "subjectId is required" }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        questionBankItems: {
          orderBy: [{ unitNumber: "asc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ success: false, error: "Subject not found" }, { status: 404 });
    }

    const rows = subject.questionBankItems.map((q) => {
      const opts = Array.isArray(q.options) ? (q.options as string[]) : [];
      let correctLetter = "";
      if (q.correctOption !== null && q.correctOption !== undefined) {
        correctLetter = ["A", "B", "C", "D"][q.correctOption] || `${q.correctOption + 1}`;
      }

      return {
        "Unit Number": q.unitNumber,
        "Question Type": q.type,
        "Difficulty": q.difficulty,
        "Marks": q.marks,
        "Question Text": q.questionText,
        "Option A": opts[0] || "",
        "Option B": opts[1] || "",
        "Option C": opts[2] || "",
        "Option D": opts[3] || "",
        "Correct Option": correctLetter,
        "Blooms Level": q.bloomsLevel || "",
        "Explanation": q.explanation || "",
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [
      {
        "Unit Number": 1,
        "Question Type": "MCQ",
        "Difficulty": "MEDIUM",
        "Marks": 1,
        "Question Text": "No questions authored yet for this subject.",
        "Option A": "",
        "Option B": "",
        "Option C": "",
        "Option D": "",
        "Correct Option": "",
        "Blooms Level": "",
        "Explanation": "",
      }
    ]);

    ws["!cols"] = [
      { wch: 12 }, // Unit Number
      { wch: 16 }, // Question Type
      { wch: 12 }, // Difficulty
      { wch: 8 },  // Marks
      { wch: 55 }, // Question Text
      { wch: 22 }, // Option A
      { wch: 22 }, // Option B
      { wch: 22 }, // Option C
      { wch: 22 }, // Option D
      { wch: 14 }, // Correct Option
      { wch: 14 }, // Blooms Level
      { wch: 45 }, // Explanation
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Question_Bank");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const safeCode = subject.code.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${safeCode}_Question_Bank_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Questions export error:", error);
    return NextResponse.json({ success: false, error: "Failed to export Question Bank" }, { status: 500 });
  }
}
