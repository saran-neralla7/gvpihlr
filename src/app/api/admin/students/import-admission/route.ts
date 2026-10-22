import { NextResponse } from "next/server";
import { getCurrentSession, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import { recordAuditLog, extractClientInfo } from "@/lib/audit";
import { RoleType, StudentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseBooleanVal(val: any): boolean | null {
  if (val === undefined || val === null || val === "") return null;
  const str = String(val).trim().toLowerCase();
  if (["yes", "true", "1", "y"].includes(str)) return true;
  if (["no", "false", "0", "n"].includes(str)) return false;
  return null;
}

function parseDateVal(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === "number") {
    // Excel serial date
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date;
  }
  const str = String(val).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // Try DD-MM-YYYY or DD/MM/YYYY
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");

  if (!session || (!isSuperAdminUser && !isOfficeUser)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { ipAddress, userAgent } = extractClientInfo(req);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No Excel file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });

    // Use first sheet or sheet named Admission_Details
    const sheetName = workbook.SheetNames.includes("Admission_Details")
      ? "Admission_Details"
      : workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return NextResponse.json({ success: false, error: "Excel sheet is empty." }, { status: 400 });
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, error: "The uploaded sheet contains no data rows." }, { status: 400 });
    }

    let updatedCount = 0;
    let createdCount = 0;
    const errors: { row: number; rollNumber?: string; message: string }[] = [];

    // Preload reference data for creating new students if needed
    const studentRole = await prisma.role.findUnique({
      where: { name: RoleType.STUDENT },
    });
    const defaultAcademicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true, isActive: true },
    }) || await prisma.academicYear.findFirst({ orderBy: { code: "desc" } });

    for (let i = 0; i < rawRows.length; i++) {
      const rowIdx = i + 2; // Row number in Excel (header is row 1)
      const raw = rawRows[i];

      // Build key lookup mapping
      const row: Record<string, any> = {};
      for (const [k, v] of Object.entries(raw)) {
        row[normalizeKey(k)] = v;
      }

      // Roll number detection
      const rollNumber = String(
        row["rollnumber"] || row["rollno"] || row["roll"] || row["studentrollno"] || ""
      ).trim().toUpperCase();

      if (!rollNumber) {
        errors.push({ row: rowIdx, message: "Missing Roll Number." });
        continue;
      }

      const fullName = String(
        row["fullname"] || row["name"] || row["studentname"] || ""
      ).trim();

      const aadhaar = String(
        row["aadhaarnumber"] || row["aadharnumber"] || row["aadhaar"] || row["aadhar"] || row["registernumber"] || ""
      ).trim() || null;

      const gender = String(row["gender"] || "").trim().toUpperCase() || null;
      const dob = parseDateVal(row["dateofbirthyyyymmdd"] || row["dateofbirth"] || row["dob"]);
      const bloodGroup = String(row["bloodgroup"] || "").trim().toUpperCase() || null;
      const casteCategory = String(row["castecategory"] || row["caste"] || "").trim() || null;
      const ews = String(row["ews"] || "").trim() || null;
      const specialCategory = String(row["specialcategory"] || "").trim() || null;
      const state = String(row["state"] || "").trim() || null;
      const region = String(row["region"] || "").trim() || null;
      const nationality = String(row["nationality"] || "").trim() || "Indian";
      const religion = String(row["religion"] || "").trim() || null;

      const transport = parseBooleanVal(row["transportfacilityyesno"] || row["transportfacility"] || row["transport"] || row["busfacility"]);
      const hostel = parseBooleanVal(row["hostelfacilityyesno"] || row["hostelfacility"] || row["hostel"]);

      const studentPhone = String(row["studentphone"] || row["phone"] || row["mobile"] || "").trim() || null;
      const studentEmail = String(row["studentemail"] || row["email"] || "").trim() || null;

      const fatherName = String(row["fathername"] || "").trim() || null;
      const fatherOccupation = String(row["fatheroccupation"] || "").trim() || null;
      const fatherAadhaar = String(row["fatheraadhaar"] || row["fatheraadhar"] || "").trim() || null;

      const motherName = String(row["mothername"] || "").trim() || null;
      const motherOccupation = String(row["motheroccupation"] || "").trim() || null;
      const motherAadhaar = String(row["motheraadhaar"] || row["motheraadhar"] || "").trim() || null;

      const parentPhone = String(row["parentphone"] || row["parentmobile"] || "").trim() || null;
      const parentEmail = String(row["parentemail"] || "").trim() || null;

      const permanentAddress = String(row["permanentaddress"] || row["address"] || "").trim() || null;
      const permanentPincode = String(row["permanentpincode"] || row["pincode"] || "").trim() || null;
      const correspondenceAddress = String(row["correspondenceaddress"] || "").trim() || null;
      const correspondencePincode = String(row["correspondencepincode"] || "").trim() || null;

      const tenthBoard = String(row["10thboard"] || row["tenthboard"] || "").trim() || null;
      const tenthMedium = String(row["10thmedium"] || row["tenthmedium"] || "").trim() || null;
      const tenthPercentage = String(row["10thpercentage"] || row["tenthpercentage"] || "").trim() || null;
      const tenthPassYear = String(row["10thpassyear"] || row["tenthpassyear"] || "").trim() || null;

      const twelfthBoard = String(row["12thboard"] || row["twelfthboard"] || row["interboard"] || "").trim() || null;
      const twelfthMedium = String(row["12thmedium"] || row["twelfthmedium"] || row["intermedium"] || "").trim() || null;
      const twelfthPercentage = String(row["12thpercentage"] || row["twelfthpercentage"] || row["interpercentage"] || "").trim() || null;
      const twelfthPassYear = String(row["12thpassyear"] || row["twelfthpassyear"] || row["interpassyear"] || "").trim() || null;

      const qualifyingExam = String(row["qualifyingexam"] || "").trim() || null;
      const eapcetRank = String(row["eapcetrank"] || "").trim() || null;
      const eapcetHallTicket = String(row["eapcethallticket"] || "").trim() || null;
      const jeeRank = String(row["jeerank"] || "").trim() || null;
      const jeeScore = String(row["jeescore"] || row["jeepercentile"] || "").trim() || null;
      const jeeHallTicket = String(row["jeehallticket"] || "").trim() || null;

      try {
        const existingStudent = await prisma.student.findUnique({
          where: { rollNumber },
          include: { user: true },
        });

        if (existingStudent) {
          // UPDATE existing student
          await prisma.student.update({
            where: { id: existingStudent.id },
            data: {
              ...(aadhaar ? { registerNumber: aadhaar } : {}),
              ...(gender ? { gender } : {}),
              ...(dob ? { dateOfBirth: dob } : {}),
              ...(bloodGroup ? { bloodGroup } : {}),
              ...(casteCategory ? { casteCategory } : {}),
              ...(ews ? { ews } : {}),
              ...(specialCategory ? { specialCategory } : {}),
              ...(state ? { state } : {}),
              ...(region ? { region } : {}),
              ...(nationality ? { nationality } : {}),
              ...(religion ? { religion } : {}),
              ...(transport !== null ? { transportFacility: transport } : {}),
              ...(hostel !== null ? { hostelFacility: hostel } : {}),
              ...(fatherName ? { fatherName, parentName: fatherName } : {}),
              ...(fatherOccupation ? { fatherOccupation } : {}),
              ...(fatherAadhaar ? { fatherAadhaar } : {}),
              ...(motherName ? { motherName } : {}),
              ...(motherOccupation ? { motherOccupation } : {}),
              ...(motherAadhaar ? { motherAadhaar } : {}),
              ...(parentPhone ? { parentPhone } : {}),
              ...(parentEmail ? { parentEmail } : {}),
              ...(permanentAddress ? { permanentAddress } : {}),
              ...(permanentPincode ? { permanentPincode } : {}),
              ...(correspondenceAddress ? { correspondenceAddress } : {}),
              ...(correspondencePincode ? { correspondencePincode } : {}),
              ...(tenthBoard ? { tenthBoard } : {}),
              ...(tenthMedium ? { tenthMedium } : {}),
              ...(tenthPercentage ? { tenthPercentage } : {}),
              ...(tenthPassYear ? { tenthPassYear } : {}),
              ...(twelfthBoard ? { twelfthBoard } : {}),
              ...(twelfthMedium ? { twelfthMedium } : {}),
              ...(twelfthPercentage ? { interPercentage: twelfthPercentage } : {}),
              ...(twelfthPassYear ? { twelfthPassYear } : {}),
              ...(qualifyingExam ? { qualifyingExam } : {}),
              ...(eapcetRank ? { eapcetRank } : {}),
              ...(eapcetHallTicket ? { eapcetHallTicket } : {}),
              ...(jeeRank ? { jeeRank } : {}),
              ...(jeeScore ? { jeeScore, jeePercentile: jeeScore } : {}),
              ...(jeeHallTicket ? { jeeHallTicket } : {}),
            },
          });

          // Update user fullName, phone, email if provided
          const userUpdates: any = {};
          if (fullName) userUpdates.fullName = fullName;
          if (studentPhone) userUpdates.phone = studentPhone;
          if (studentEmail) userUpdates.email = studentEmail;

          if (Object.keys(userUpdates).length > 0) {
            await prisma.user.update({
              where: { id: existingStudent.userId },
              data: userUpdates,
            });
          }

          updatedCount++;
        } else {
          // INSERT new student
          if (!fullName) {
            errors.push({ row: rowIdx, rollNumber, message: "Full Name is required to create a new student record." });
            continue;
          }

          const defaultEmail = studentEmail || `${rollNumber.toLowerCase()}@student.gvpihlr.edu.in`;
          const defaultPhone = studentPhone || "+91 9848011000";
          const passwordHash = await hashPassword("Student@1234");

          const newUser = await prisma.user.create({
            data: {
              username: rollNumber,
              email: defaultEmail,
              phone: defaultPhone,
              fullName,
              passwordHash,
              isActive: true,
              ...(studentRole ? { roles: { create: { roleId: studentRole.id } } } : {}),
            },
          });

          const newStudent = await prisma.student.create({
            data: {
              userId: newUser.id,
              rollNumber,
              registerNumber: aadhaar,
              gender,
              dateOfBirth: dob,
              bloodGroup,
              status: StudentStatus.ACTIVE,
              admissionYear: defaultAcademicYear?.code?.split("-")[0] || "2026",
              casteCategory,
              ews,
              specialCategory,
              state,
              region,
              nationality,
              religion,
              transportFacility: transport ?? false,
              hostelFacility: hostel ?? false,
              fatherName,
              fatherOccupation,
              fatherAadhaar,
              motherName,
              motherOccupation,
              motherAadhaar,
              parentName: fatherName || motherName,
              parentPhone,
              parentEmail,
              permanentAddress,
              permanentPincode,
              correspondenceAddress,
              correspondencePincode,
              tenthBoard,
              tenthMedium,
              tenthPercentage,
              tenthPassYear,
              twelfthBoard,
              twelfthMedium,
              interPercentage: twelfthPercentage,
              twelfthPassYear,
              qualifyingExam,
              eapcetRank,
              eapcetHallTicket,
              jeeRank,
              jeeScore,
              jeePercentile: jeeScore,
              jeeHallTicket,
            },
          });

          // If program and section are given, enroll them
          const programCode = String(row["programcode"] || row["program"] || "").trim().toUpperCase();
          const sectionName = String(row["sectionname"] || row["section"] || "").trim();

          if (programCode && sectionName && defaultAcademicYear) {
            const program = await prisma.program.findFirst({
              where: { OR: [{ code: programCode }, { name: { contains: programCode, mode: "insensitive" } }] },
            });
            const section = await prisma.section.findFirst({
              where: {
                academicYearId: defaultAcademicYear.id,
                name: sectionName,
                ...(program ? { programId: program.id } : {}),
              },
            });

            if (program && section) {
              await prisma.studentEnrollment.create({
                data: {
                  studentId: newStudent.id,
                  academicYearId: defaultAcademicYear.id,
                  programId: program.id,
                  sectionId: section.id,
                  year: section.year,
                  semester: section.semester,
                  isCurrent: true,
                },
              });
            }
          }

          createdCount++;
        }
      } catch (err: any) {
        errors.push({ row: rowIdx, rollNumber, message: err.message || "Failed to process row" });
      }
    }

    await recordAuditLog({
      userId: session.userId,
      action: "IMPORT",
      resource: "Student",
      resourceId: "BULK_EXCEL_IMPORT",
      details: { totalRows: rawRows.length, updatedCount, createdCount, errorCount: errors.length },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `Processed ${rawRows.length} rows: ${updatedCount} updated, ${createdCount} created, ${errors.length} errors.`,
      stats: {
        totalRows: rawRows.length,
        updatedCount,
        createdCount,
        errorCount: errors.length,
      },
      errors: errors.slice(0, 50), // Send first 50 errors if any
    });
  } catch (error: any) {
    console.error("Bulk admission import failed:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process upload" }, { status: 500 });
  }
}
