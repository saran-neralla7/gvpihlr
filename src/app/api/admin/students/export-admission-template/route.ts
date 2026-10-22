import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");

  if (!session || (!isSuperAdminUser && !isOfficeUser)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  // Pre-configured headers
  const headers = [
    "Roll Number",
    "Full Name",
    "Aadhaar Number",
    "Gender",
    "Date of Birth (YYYY-MM-DD)",
    "Blood Group",
    "Caste Category",
    "EWS",
    "Special Category",
    "State",
    "Region",
    "Nationality",
    "Religion",
    "Transport Facility (YES/NO)",
    "Hostel Facility (YES/NO)",
    "Student Phone",
    "Student Email",
    "Father Name",
    "Father Occupation",
    "Father Aadhaar",
    "Mother Name",
    "Mother Occupation",
    "Mother Aadhaar",
    "Parent Phone",
    "Parent Email",
    "Permanent Address",
    "Permanent Pincode",
    "Correspondence Address",
    "Correspondence Pincode",
    "10th Board",
    "10th Medium",
    "10th Percentage",
    "10th Pass Year",
    "12th Board",
    "12th Medium",
    "12th Percentage",
    "12th Pass Year",
    "Qualifying Exam",
    "EAPCET Rank",
    "EAPCET Hall Ticket",
    "JEE Rank",
    "JEE Score",
    "JEE Hall Ticket",
    "Program Code",
    "Section Name",
    "Academic Year",
  ];

  const sampleRow = [
    "5241411014",
    "Ramesh Kumar",
    "987654321098",
    "MALE",
    "2006-07-15",
    "O+",
    "BC-B",
    "NO",
    "NONE",
    "Andhra Pradesh",
    "AU",
    "Indian",
    "Hindu",
    "NO",
    "YES",
    "9848012345",
    "5241411014@student.gvpihlr.edu.in",
    "Suresh Kumar",
    "Business",
    "123412341234",
    "Lakshmi Devi",
    "Homemaker",
    "567856785678",
    "9848098765",
    "parent.suresh@gmail.com",
    "D.No 4-56, Main Road, Madhurawada, Visakhapatnam",
    "530048",
    "D.No 4-56, Main Road, Madhurawada, Visakhapatnam",
    "530048",
    "AP SSC",
    "English",
    "92.4",
    "2022",
    "BIE AP",
    "English",
    "95.2",
    "2024",
    "EAPCET",
    "14520",
    "24567891",
    "45200",
    "89.5",
    "2403105432",
    "CSE",
    "Section 1",
    "2026-27",
  ];

  const wsData = [headers, sampleRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-fit column widths
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 14) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Admission_Details");

  // Instructions Sheet
  const instructions = [
    ["GVPIHLR ERP - Admission Master Excel Upload Guide"],
    [""],
    ["Field", "Required?", "Format / Notes"],
    ["Roll Number", "YES", "Unique student roll number (e.g., 5241411014). Used as primary key for upsert."],
    ["Full Name", "YES", "Student full legal name as per SSC certificate."],
    ["Aadhaar Number", "Optional", "12-digit Aadhaar number."],
    ["Gender", "Optional", "MALE / FEMALE / OTHER"],
    ["Date of Birth", "Optional", "YYYY-MM-DD or DD-MM-YYYY format."],
    ["Blood Group", "Optional", "A+, A-, B+, B-, O+, O-, AB+, AB-"],
    ["Caste Category", "Optional", "OC, BC-A, BC-B, BC-C, BC-D, BC-E, SC, ST"],
    ["Transport Facility", "Optional", "YES or NO"],
    ["Hostel Facility", "Optional", "YES or NO"],
    ["Parent Phone", "Optional", "10-digit mobile number"],
    ["10th / 12th Details", "Optional", "Board name, medium of instruction, % or CGPA, pass year"],
    ["Entrance Exam Details", "Optional", "EAPCET rank/hall ticket, JEE rank/score/hall ticket"],
    ["Program Code", "Optional", "e.g., CSE, ECE, AIDS, MECH, CIVIL (Used if creating new student enrollment)"],
    ["Section Name", "Optional", "e.g., Section 1, Section 2, A, B"],
    ["Academic Year", "Optional", "e.g., 2026-27"],
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="GVPIHLR_Admission_Details_Template.xlsx"',
    },
  });
}
