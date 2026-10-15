import { PrismaClient, RoleType, StudentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import xlsx from "xlsx";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================================");
  console.log("🚀 Syncing / Enrolling Students from ATTENDANCE-GVPIHLR.xlsx");
  console.log("=================================================================\n");

  const academicYear = await prisma.academicYear.findUniqueOrThrow({
    where: { code: "2026-27" },
  });

  const studentRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleType.STUDENT },
  });

  const sections = await prisma.section.findMany({
    include: { program: true },
  });

  const getSection = (progCode: string, secName: string) => {
    return sections.find(
      (s) => s.program.code === progCode && s.name === secName
    );
  };

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  const wbAtt = xlsx.readFile("ATTENDANCE-GVPIHLR.xlsx");
  const sheet = wbAtt.Sheets["ATTENDANCE (13-10-2026)"];
  const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let addedCount = 0;
  let enrolledCount = 0;

  for (let r = 5; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[1]) continue;
    const roll = String(row[1]).trim().toUpperCase();
    if (!roll.startsWith("26UE")) continue;

    const name = String(row[2] || "").trim();
    const branch = String(row[3] || "").trim();
    const studentMobile = row[4] ? String(row[4]).trim() : null;
    const parentMobile = row[5] ? String(row[5]).trim() : null;
    const tcVerified = String(row[6] || "YES").trim();

    let programCode = "";
    let sectionName = "1";

    if (branch === "CHEMICAL") {
      programCode = "BTECH-CHEMICAL-ENG";
    } else if (branch === "CIVIL") {
      programCode = "BTECH-CIVIL-ENG";
    } else if (branch === "CSC") {
      programCode = "BTECH-CS-AND-ENG-CYBERSECURITY";
    } else if (branch === "CSD") {
      programCode = "BTECH-CS-AND-ENG-DATA-SCIENCE";
    } else if (branch === "CSE") {
      programCode = "BTECH-CS-AND-ENG";
      const num = parseInt(roll.replace(/[^0-9]/g, "").slice(2), 10);
      sectionName = num > 120 ? "2" : "1";
    } else if (branch === "CSM") {
      programCode = "BTECH-CS-AND-ENG-AI-AND-ML";
      const num = parseInt(roll.replace(/[^0-9]/g, "").slice(2), 10);
      sectionName = num > 120 ? "2" : "1";
    } else if (branch === "ECE") {
      programCode = "BTECH-ELECTRONICS-AND-COMMUNICATION-ENG";
      const num = parseInt(roll.replace(/[^0-9]/g, "").slice(2), 10);
      sectionName = num > 120 ? "2" : "1";
    } else if (branch === "VLSI") {
      programCode = "BTECH-ELECTRONICS-ENG-VLSI-DESIGN-AND-TECHNOLOGY";
    } else if (branch === "EEE") {
      programCode = "BTECH-ELECTRICAL-AND-ELECTRONICS-ENG";
    } else if (branch === "MECHANICAL") {
      programCode = "BTECH-MECHANICAL-ENG";
    } else if (branch === "MRB") {
      programCode = "BTECH-MECHANICAL-ENG-ROBOTICS-AND-AI";
    } else {
      console.warn(`Unknown branch: ${branch} for roll ${roll}`);
      continue;
    }

    const targetSection = getSection(programCode, sectionName);
    if (!targetSection) {
      console.error(`Target section not found for ${programCode} Sec ${sectionName}`);
      continue;
    }

    let student = await prisma.student.findUnique({
      where: { rollNumber: roll },
      include: { enrollments: true },
    });

    if (!student) {
      const user = await prisma.user.upsert({
        where: { username: roll },
        update: {
          fullName: name || roll,
          phone: studentMobile,
          isActive: true,
        },
        create: {
          username: roll,
          fullName: name || roll,
          email: `${roll.toLowerCase()}@student.gvpihlr.edu.in`,
          phone: studentMobile,
          passwordHash: defaultPasswordHash,
          isActive: true,
          userRoles: {
            create: {
              roleId: studentRole.id,
              programId: targetSection.programId,
            },
          },
        },
      });

      student = await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber: roll,
          status: StudentStatus.ACTIVE,
          parentPhone: parentMobile,
          tcVerified,
          admissionYear: "2026",
        },
        include: { enrollments: true },
      });

      addedCount++;
    }

    // Ensure student is enrolled in targetSection
    const currEnrollment = student.enrollments.find((e) => e.isCurrent);
    if (!currEnrollment || currEnrollment.sectionId !== targetSection.id) {
      await prisma.studentEnrollment.upsert({
        where: {
          studentId_academicYearId_semester: {
            studentId: student.id,
            academicYearId: academicYear.id,
            semester: 1,
          },
        },
        update: {
          sectionId: targetSection.id,
          programId: targetSection.programId,
          year: 1,
          isCurrent: true,
        },
        create: {
          studentId: student.id,
          sectionId: targetSection.id,
          programId: targetSection.programId,
          academicYearId: academicYear.id,
          year: 1,
          semester: 1,
          isCurrent: true,
        },
      });
      enrolledCount++;
    }
  }

  const finalTotal = await prisma.student.count();
  const enrolledTotal = await prisma.studentEnrollment.count({ where: { isCurrent: true } });
  console.log(`\n✅ Student sync complete: Added ${addedCount} new students, enrolled/updated ${enrolledCount}.`);
  console.log(`📊 Total students in DB: ${finalTotal}, Total active enrollments: ${enrolledTotal}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Error syncing students:", e);
  process.exit(1);
});
