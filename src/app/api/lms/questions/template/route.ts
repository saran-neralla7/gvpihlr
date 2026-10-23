import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Sample Questions Template
    const templateData = [
      {
        "Unit Number": 1,
        "Question Type": "MCQ",
        "Difficulty": "EASY",
        "Marks": 1.0,
        "Question Text": "Which of the following is the SI unit of electrical resistance?",
        "Option A": "Ampere",
        "Option B": "Ohm",
        "Option C": "Volt",
        "Option D": "Joule",
        "Correct Option": "B",
        "Blooms Level": "Remember",
        "Explanation": "The SI unit of electrical resistance is the Ohm (Ω), named after Georg Ohm.",
      },
      {
        "Unit Number": 1,
        "Question Type": "MCQ",
        "Difficulty": "MEDIUM",
        "Marks": 2.0,
        "Question Text": "According to Newton's Second Law of Motion, force is equal to the rate of change of:",
        "Option A": "Velocity",
        "Option B": "Acceleration",
        "Option C": "Linear Momentum",
        "Option D": "Kinetic Energy",
        "Correct Option": "C",
        "Blooms Level": "Understand",
        "Explanation": "F = dp/dt. When mass is constant, this reduces to F = m * a.",
      },
      {
        "Unit Number": 2,
        "Question Type": "MCQ",
        "Difficulty": "HARD",
        "Marks": 2.0,
        "Question Text": "In quantum mechanics, the uncertainty principle was formulated by:",
        "Option A": "Erwin Schrodinger",
        "Option B": "Werner Heisenberg",
        "Option C": "Max Planck",
        "Option D": "Niels Bohr",
        "Correct Option": "B",
        "Blooms Level": "Remember",
        "Explanation": "Heisenberg's Uncertainty Principle states Δx * Δp >= h / (4π).",
      },
      {
        "Unit Number": 2,
        "Question Type": "SHORT_ANSWER",
        "Difficulty": "MEDIUM",
        "Marks": 5.0,
        "Question Text": "State Hooke's Law of elasticity and define Young's Modulus.",
        "Option A": "",
        "Option B": "",
        "Option C": "",
        "Option D": "",
        "Correct Option": "",
        "Blooms Level": "Understand",
        "Explanation": "Within elastic limits, stress is directly proportional to strain (Stress = E * Strain).",
      },
      {
        "Unit Number": 3,
        "Question Type": "DESCRIPTIVE",
        "Difficulty": "HARD",
        "Marks": 10.0,
        "Question Text": "Derive the time-independent Schrodinger wave equation for a particle in a one-dimensional box.",
        "Option A": "",
        "Option B": "",
        "Option C": "",
        "Option D": "",
        "Correct Option": "",
        "Blooms Level": "Analyze",
        "Explanation": "Apply boundary conditions ψ(0)=0 and ψ(L)=0 to obtain quantized energy states En = (n²h²)/(8mL²).",
      },
    ];

    const wsTemplate = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    wsTemplate["!cols"] = [
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

    XLSX.utils.book_append_sheet(wb, wsTemplate, "Questions_Template");

    // Sheet 2: Guidelines & Allowed Values
    const instructionsData = [
      {
        "Field Name": "Unit Number",
        "Required": "YES",
        "Allowed Values / Format": "1, 2, 3, 4, or 5 (Integer representing syllabus unit)",
      },
      {
        "Field Name": "Question Type",
        "Required": "YES",
        "Allowed Values / Format": "MCQ, SHORT_ANSWER, or DESCRIPTIVE (Default: MCQ)",
      },
      {
        "Field Name": "Difficulty",
        "Required": "YES",
        "Allowed Values / Format": "EASY, MEDIUM, or HARD (Default: MEDIUM)",
      },
      {
        "Field Name": "Marks",
        "Required": "YES",
        "Allowed Values / Format": "Number e.g. 1, 2, 5, 10 (Default: 1.0)",
      },
      {
        "Field Name": "Question Text",
        "Required": "YES",
        "Allowed Values / Format": "Full question statement (Plain text or markdown)",
      },
      {
        "Field Name": "Option A / B / C / D",
        "Required": "For MCQ",
        "Allowed Values / Format": "Required for MCQ type questions. Leave empty for Short Answer/Descriptive.",
      },
      {
        "Field Name": "Correct Option",
        "Required": "For MCQ",
        "Allowed Values / Format": "A, B, C, D (or 1, 2, 3, 4). Specifies the answer choice index.",
      },
      {
        "Field Name": "Blooms Level",
        "Required": "Optional",
        "Allowed Values / Format": "Remember, Understand, Apply, Analyze, Evaluate, Create",
      },
      {
        "Field Name": "Explanation",
        "Required": "Optional",
        "Allowed Values / Format": "Detailed step-by-step solution, hint, or justification",
      },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
    wsInstructions["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 65 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions_and_Guide");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="GVPIHLR_Question_Bank_Template.xlsx"',
      },
    });
  } catch (error: any) {
    console.error("Template generation error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate Excel template" }, { status: 500 });
  }
}
