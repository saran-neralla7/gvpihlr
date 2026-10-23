import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { QuestionDifficulty, QuestionType } from "@prisma/client";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (!session.roles.includes("FACULTY") && !session.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subjectId = formData.get("subjectId") as string | null;
    const assignmentId = formData.get("assignmentId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Please select an Excel file (.xlsx)" }, { status: 400 });
    }

    // STRICT 5MB LIMIT
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select an Excel file under 5MB.`,
        },
        { status: 400 }
      );
    }

    if (!subjectId) {
      return NextResponse.json({ success: false, error: "subjectId is required" }, { status: 400 });
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ success: false, error: "Subject not found" }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName =
      workbook.SheetNames.find((s) => s.toLowerCase().includes("template") || s.toLowerCase().includes("question")) ||
      workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json({ success: false, error: "No sheets found in Excel file" }, { status: 400 });
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, error: "The Excel file is empty." }, { status: 400 });
    }

    const itemsToInsert: any[] = [];
    const errors: string[] = [];

    rawRows.forEach((row, index) => {
      const rowNum = index + 2; // Accounting for 1-based header row

      // Helper to find case-insensitive column key
      const getVal = (...possibleKeys: string[]) => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
          for (const pk of possibleKeys) {
            if (cleanK === pk.toLowerCase().replace(/[^a-z0-9]/g, "")) {
              return String(row[k]).trim();
            }
          }
        }
        return "";
      };

      const qText = getVal("questiontext", "question", "text", "qtext");
      if (!qText) {
        // Skip empty question rows
        return;
      }

      // Parse unit number (1 to 5)
      const unitRaw = getVal("unitnumber", "unit", "unitnum");
      let unitNumber = parseInt(unitRaw, 10);
      if (isNaN(unitNumber) || unitNumber < 1 || unitNumber > 5) {
        unitNumber = 1;
      }

      // Parse Question Type
      const typeRaw = getVal("questiontype", "type", "qtype").toUpperCase();
      let type: QuestionType = QuestionType.MCQ;
      if (typeRaw.includes("SHORT")) type = QuestionType.SHORT_ANSWER;
      else if (typeRaw.includes("DESC") || typeRaw.includes("LONG")) type = QuestionType.DESCRIPTIVE;
      else type = QuestionType.MCQ;

      // Parse Difficulty
      const diffRaw = getVal("difficulty", "diff", "level").toUpperCase();
      let difficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM;
      if (diffRaw.includes("EASY")) difficulty = QuestionDifficulty.EASY;
      else if (diffRaw.includes("HARD")) difficulty = QuestionDifficulty.HARD;
      else difficulty = QuestionDifficulty.MEDIUM;

      // Parse Marks
      const marksRaw = getVal("marks", "mark", "points");
      const marks = marksRaw ? parseFloat(marksRaw) || 1.0 : 1.0;

      // Options
      const optA = getVal("optiona", "opta", "opt1", "choicea");
      const optB = getVal("optionb", "optb", "opt2", "choiceb");
      const optC = getVal("optionc", "optc", "opt3", "choicec");
      const optD = getVal("optiond", "optd", "opt4", "choiced");

      let optionsJson: string[] | null = null;
      let correctOptionIndex: number | null = null;

      if (type === QuestionType.MCQ) {
        const optionsList = [optA, optB, optC, optD].filter(Boolean);
        if (optionsList.length >= 2) {
          optionsJson = [optA || "Option A", optB || "Option B", optC || "Option C", optD || "Option D"];
        }

        const correctRaw = getVal("correctoption", "correct", "answer", "ans").toUpperCase();
        if (correctRaw === "A" || correctRaw === "1" || correctRaw === "0") correctOptionIndex = 0;
        else if (correctRaw === "B" || correctRaw === "2") correctOptionIndex = 1;
        else if (correctRaw === "C" || correctRaw === "3") correctOptionIndex = 2;
        else if (correctRaw === "D" || correctRaw === "4") correctOptionIndex = 3;
        else if (correctRaw) {
          // Check if correct matches option text
          const idx = [optA, optB, optC, optD].findIndex((o) => o && o.toLowerCase() === correctRaw.toLowerCase());
          if (idx !== -1) correctOptionIndex = idx;
        }
      }

      // Bloom's taxonomy & explanation
      const bloomsLevel = getVal("bloomslevel", "blooms", "bloom", "taxonomy") || "Understand";
      const explanation = getVal("explanation", "solution", "hint", "notes") || null;

      itemsToInsert.push({
        subjectId,
        assignmentId: assignmentId || null,
        unitNumber,
        type,
        difficulty,
        marks,
        questionText: qText,
        options: optionsJson || undefined,
        correctOption: correctOptionIndex,
        bloomsLevel,
        explanation,
      });
    });

    if (itemsToInsert.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid questions found in the Excel file. Please use the sample template format.",
        },
        { status: 400 }
      );
    }

    // Insert all items
    const created = await prisma.questionBankItem.createMany({
      data: itemsToInsert,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${created.count} questions into the Question Bank.`,
      count: created.count,
    });
  } catch (error: any) {
    console.error("Excel questions import error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to import questions" }, { status: 500 });
  }
}
