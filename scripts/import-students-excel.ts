import { PrismaClient, RoleType, StudentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import xlsx from "xlsx";
import path from "path";

const prisma = new PrismaClient();

interface SectionGroupDef {
  index: number;
  headerSubstring: string;
  programCode: string;
  sectionName: string; // "1" or "2"
}

const SECTION_DEFS: SectionGroupDef[] = [
  { index: 1, headerSubstring: "CHEMICAL ENGINEERING", programCode: "BTECH-CHEMICAL-ENG", sectionName: "1" },
  { index: 2, headerSubstring: "CIVIL ENGINEERING", programCode: "BTECH-CIVIL-ENG", sectionName: "1" },
  { index: 3, headerSubstring: "COMPUTER SCIENCE AND ENGINEERING (SECTION-1)", programCode: "BTECH-CS-AND-ENG", sectionName: "1" },
  { index: 4, headerSubstring: "COMPUTER SCIENCE AND ENGINEERING (SECTION-2)", programCode: "BTECH-CS-AND-ENG", sectionName: "2" },
  { index: 5, headerSubstring: "COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING) SECTION-1", programCode: "BTECH-CS-AND-ENG-AI-AND-ML", sectionName: "1" },
  { index: 6, headerSubstring: "COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING) SECTION-2", programCode: "BTECH-CS-AND-ENG-AI-AND-ML", sectionName: "2" },
  { index: 7, headerSubstring: "COMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY)", programCode: "BTECH-CS-AND-ENG-CYBERSECURITY", sectionName: "1" },
  { index: 8, headerSubstring: "COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)", programCode: "BTECH-CS-AND-ENG-DATA-SCIENCE", sectionName: "1" },
  { index: 9, headerSubstring: "ELECTRICAL AND ELECTRONICS ENGINEERING", programCode: "BTECH-ELECTRICAL-AND-ELECTRONICS-ENG", sectionName: "1" },
  { index: 10, headerSubstring: "ELECTRONICS AND COMMUNICATION ENGINEERING (SECTION-1)", programCode: "BTECH-ELECTRONICS-AND-COMMUNICATION-ENG", sectionName: "1" },
  { index: 11, headerSubstring: "ELECTRONICS AND COMMUNICATION ENGINEERING (SECTION-2)", programCode: "BTECH-ELECTRONICS-AND-COMMUNICATION-ENG", sectionName: "2" },
  { index: 12, headerSubstring: "ELECTRONICS AND COMMUNICATION ENGINEERING (VLSI DESIGN AND EMBEDDED SYSTEMS)", programCode: "BTECH-ELECTRONICS-ENG-VLSI-DESIGN-AND-TECHNOLOGY", sectionName: "1" },
  { index: 13, headerSubstring: "MECHANICAL ENGINEERING", programCode: "BTECH-MECHANICAL-ENG", sectionName: "1" },
  { index: 14, headerSubstring: "MECHANICAL ENGINEERING (ROBOTICS AND ARTIFICIAL INTELLIGENCE)", programCode: "BTECH-MECHANICAL-ENG-ROBOTICS-AND-AI", sectionName: "1" },
];

function cleanText(str: string): string {
  return str.replace(/\s+/g, " ").trim().toUpperCase();
}

function sanitizePhone(raw: any): string | null {
  if (!raw) return null;
  const str = String(raw).trim().replace(/\.0$/, "").replace(/[^0-9]/g, "");
  return str.length >= 10 ? str : null;
}

function sanitizeEmail(raw: any): string | null {
  if (!raw) return null;
  const str = String(raw).trim();
  if (str === "***" || str === "-" || str.length < 5 || !str.includes("@")) {
    return null;
  }
  return str.toLowerCase();
}

function cleanStringSafe(raw: any): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const str = String(raw).trim();
  return str.length > 0 ? str : null;
}

async function main() {
  console.log("=================================================================");
  console.log("🚀 Starting Ingestion of STUDENT LIST.xlsx into GVPIHLR CMS");
  console.log("=================================================================\n");

  // 1. Ensure Academic Year 2026-27 exists and isCurrent = true
  const academicYear = await prisma.academicYear.upsert({
    where: { code: "2026-27" },
    update: { isCurrent: true, isActive: true },
    create: {
      code: "2026-27",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-05-31"),
      isCurrent: true,
      isActive: true,
    },
  });
  console.log(`✅ Academic Year ready: ${academicYear.code} (ID: ${academicYear.id})`);

  // 2. Ensure Role STUDENT exists
  const studentRole = await prisma.role.upsert({
    where: { name: RoleType.STUDENT },
    update: {},
    create: {
      name: RoleType.STUDENT,
      description: "Undergraduate / Postgraduate Student Role",
    },
  });
  console.log(`✅ Role ready: ${studentRole.name} (ID: ${studentRole.id})`);

  // 3. Read Excel Workbook
  const filePath = path.join(process.cwd(), "STUDENT LIST.xlsx");
  const wb = xlsx.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rawRows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`✅ Read ${rawRows.length} rows from sheet "${sheetName}".\n`);

  // 4. Parse sections and their students
  interface RawStudentRow {
    rowIndex: number;
    slNo: any;
    rollNo: string;
    aadhar: string | null;
    interPct: string | null;
    jeePercentile: string | null;
    jeeRank: string | null;
    eapcetRank: string | null;
    name: string;
    gender: string;
    caste: string | null;
    ews: string | null;
    specialCat: string | null;
    state: string | null;
    region: string | null;
    studentMobile: string | null;
    studentEmail: string | null;
    fatherName: string | null;
    tcVerified: string | null;
    parentMobile: string | null;
  }

  interface ParsedSectionGroup {
    def: SectionGroupDef;
    students: RawStudentRow[];
  }

  const parsedGroups: ParsedSectionGroup[] = [];
  let currentGroup: ParsedSectionGroup | null = null;
  let defPointer = 0;

  for (let r = 0; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const firstCell = row[0] ? cleanText(String(row[0])) : "";

    // Check if this row begins a new section definition
    if (defPointer < SECTION_DEFS.length) {
      const targetDef = SECTION_DEFS[defPointer];
      const targetHeader = cleanText(targetDef.headerSubstring);
      if (firstCell === targetHeader || firstCell.includes(targetHeader)) {
        if (currentGroup) {
          parsedGroups.push(currentGroup);
        }
        currentGroup = {
          def: targetDef,
          students: [],
        };
        defPointer++;
        continue;
      }
    }

    const rollNo = row[1] ? String(row[1]).trim().toUpperCase() : "";
    if (rollNo.startsWith("26UE")) {
      if (!currentGroup) {
        throw new Error(`Found student roll ${rollNo} outside any recognized section!`);
      }

      const aadharRaw = row[2];
      const aadhar = aadharRaw ? String(aadharRaw).trim().replace(/\.0$/, "").replace(/[^0-9]/g, "") : "";

      currentGroup.students.push({
        rowIndex: r,
        slNo: row[0],
        rollNo,
        aadhar: aadhar.length >= 10 ? aadhar : null,
        interPct: cleanStringSafe(row[3]),
        jeePercentile: cleanStringSafe(row[4]),
        jeeRank: cleanStringSafe(row[5]),
        eapcetRank: cleanStringSafe(row[6]),
        name: row[7] ? String(row[7]).trim() : rollNo,
        gender: row[10] ? String(row[10]).trim() : "Male",
        caste: row[11] ? String(row[11]).trim() : null,
        ews: row[12] ? String(row[12]).trim() : null,
        specialCat: row[13] ? String(row[13]).trim() : null,
        state: row[14] ? String(row[14]).trim() : null,
        region: row[15] ? String(row[15]).trim() : null,
        studentMobile: sanitizePhone(row[17]),
        studentEmail: sanitizeEmail(row[18]),
        fatherName: row[19] ? String(row[19]).trim() : null,
        tcVerified: row[20] ? String(row[20]).trim() : null,
        parentMobile: sanitizePhone(row[21]),
      });
    }
  }

  if (currentGroup) {
    parsedGroups.push(currentGroup);
  }

  console.log(`✅ Parsed ${parsedGroups.length} Section Groups:`);
  let totalCount = 0;
  for (const g of parsedGroups) {
    console.log(`   - [Sec ${g.def.sectionName}] ${g.def.programCode} -> ${g.students.length} students`);
    totalCount += g.students.length;
  }
  console.log(`\n📊 Total students across all sections: ${totalCount}\n`);

  if (totalCount !== 1165) {
    throw new Error(`Expected 1,165 students, but parsed ${totalCount}! Aborting.`);
  }

  // 5. Create Sections and Lab Batches in DB
  console.log("🏫 Creating/Verifying Sections & Lab Batches in Database...");
  const sectionRecordMap = new Map<string, { sectionId: string; programId: string; labBatch1Id: string; labBatch2Id: string }>();

  for (const g of parsedGroups) {
    const program = await prisma.program.findUnique({
      where: { code: g.def.programCode },
    });
    if (!program) {
      throw new Error(`Program code ${g.def.programCode} not found in database!`);
    }

    const displayName = `${program.name} - Year 1 - Sem 1 - Sec ${g.def.sectionName} (2026-27)`;

    const section = await prisma.section.upsert({
      where: {
        academicYearId_programId_year_semester_name: {
          academicYearId: academicYear.id,
          programId: program.id,
          year: 1,
          semester: 1,
          name: g.def.sectionName,
        },
      },
      update: {
        displayName,
        capacity: g.students.length + 20,
        isActive: true,
      },
      create: {
        academicYearId: academicYear.id,
        programId: program.id,
        year: 1,
        semester: 1,
        name: g.def.sectionName,
        displayName,
        capacity: g.students.length + 20,
        isActive: true,
      },
    });

    // Create Lab Batches 1 & 2
    const batch1 = await prisma.labBatch.upsert({
      where: {
        sectionId_batchNumber: {
          sectionId: section.id,
          batchNumber: 1,
        },
      },
      update: { name: "Batch 1", isActive: true },
      create: {
        sectionId: section.id,
        batchNumber: 1,
        name: "Batch 1",
        isActive: true,
      },
    });

    const batch2 = await prisma.labBatch.upsert({
      where: {
        sectionId_batchNumber: {
          sectionId: section.id,
          batchNumber: 2,
        },
      },
      update: { name: "Batch 2", isActive: true },
      create: {
        sectionId: section.id,
        batchNumber: 2,
        name: "Batch 2",
        isActive: true,
      },
    });

    const mapKey = `${g.def.programCode}_${g.def.sectionName}`;
    sectionRecordMap.set(mapKey, {
      sectionId: section.id,
      programId: program.id,
      labBatch1Id: batch1.id,
      labBatch2Id: batch2.id,
    });
  }
  console.log(`✅ All 14 Sections and 28 Lab Batches successfully created/verified.\n`);

  // 6. Pre-generate password hashes in batches of 50
  console.log("🔐 Generating password hashes for all 1,165 students (Password = Roll Number)...");
  const allStudentsList: { group: ParsedSectionGroup; student: RawStudentRow; indexInSection: number }[] = [];

  for (const g of parsedGroups) {
    g.students.forEach((st, idx) => {
      allStudentsList.push({
        group: g,
        student: st,
        indexInSection: idx + 1,
      });
    });
  }

  const startTime = Date.now();
  const passwordHashMap = new Map<string, string>();
  const HASH_BATCH_SIZE = 50;

  for (let i = 0; i < allStudentsList.length; i += HASH_BATCH_SIZE) {
    const chunk = allStudentsList.slice(i, i + HASH_BATCH_SIZE);
    await Promise.all(
      chunk.map(async ({ student }) => {
        const hash = await bcrypt.hash(student.rollNo, 10);
        passwordHashMap.set(student.rollNo, hash);
      })
    );
    process.stdout.write(`   Hashed ${Math.min(i + HASH_BATCH_SIZE, allStudentsList.length)} / ${allStudentsList.length} passwords...\r`);
  }
  console.log(`\n✅ Finished hashing in ${((Date.now() - startTime) / 1000).toFixed(1)}s.\n`);

  // 7. Ingest Students into Database in Chunks of 25
  console.log("💾 Ingesting Students into Database (Users, Roles, Profiles, Enrollments)...");
  const DB_CHUNK_SIZE = 25;
  let processed = 0;

  for (let i = 0; i < allStudentsList.length; i += DB_CHUNK_SIZE) {
    const chunk = allStudentsList.slice(i, i + DB_CHUNK_SIZE);

    await Promise.all(
      chunk.map(async ({ group, student, indexInSection }) => {
        const secInfo = sectionRecordMap.get(`${group.def.programCode}_${group.def.sectionName}`)!;
        const passwordHash = passwordHashMap.get(student.rollNo)!;
        const institutionalEmail = `${student.rollNo.toLowerCase()}@student.gvpihlr.edu.in`;

        // 7.1 Upsert User
        const user = await prisma.user.upsert({
          where: { username: student.rollNo },
          update: {
            fullName: student.name,
            phone: student.studentMobile,
            passwordHash: passwordHash,
            isActive: true,
            mustChangePassword: false,
          },
          create: {
            username: student.rollNo,
            email: institutionalEmail,
            fullName: student.name,
            phone: student.studentMobile,
            passwordHash: passwordHash,
            isActive: true,
            mustChangePassword: false,
          },
        });

        // 7.2 Ensure UserRole (STUDENT)
        const existingRole = await prisma.userRole.findFirst({
          where: { userId: user.id, roleId: studentRole.id },
        });
        if (!existingRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: studentRole.id,
              programId: secInfo.programId,
            },
          });
        } else if (existingRole.programId !== secInfo.programId) {
          await prisma.userRole.update({
            where: { id: existingRole.id },
            data: { programId: secInfo.programId },
          });
        }

        // 7.3 Upsert Student Profile
        const studentProfile = await prisma.student.upsert({
          where: { rollNumber: student.rollNo },
          update: {
            registerNumber: student.aadhar || null,
            parentName: student.fatherName,
            parentPhone: student.parentMobile,
            parentEmail: student.studentEmail, // personal email from excel
            gender: student.gender,
            status: StudentStatus.ACTIVE,
            admissionYear: "2026",
            casteCategory: student.caste,
            ews: student.ews,
            specialCategory: student.specialCat,
            state: student.state,
            region: student.region,
            interPercentage: student.interPct,
            jeePercentile: student.jeePercentile,
            jeeRank: student.jeeRank,
            eapcetRank: student.eapcetRank,
            tcVerified: student.tcVerified,
          },
          create: {
            userId: user.id,
            rollNumber: student.rollNo,
            registerNumber: student.aadhar || null,
            parentName: student.fatherName,
            parentPhone: student.parentMobile,
            parentEmail: student.studentEmail,
            gender: student.gender,
            status: StudentStatus.ACTIVE,
            admissionYear: "2026",
            casteCategory: student.caste,
            ews: student.ews,
            specialCategory: student.specialCat,
            state: student.state,
            region: student.region,
            interPercentage: student.interPct,
            jeePercentile: student.jeePercentile,
            jeeRank: student.jeeRank,
            eapcetRank: student.eapcetRank,
            tcVerified: student.tcVerified,
          },
        });

        // 7.4 Upsert StudentEnrollment
        await prisma.studentEnrollment.upsert({
          where: {
            studentId_academicYearId_semester: {
              studentId: studentProfile.id,
              academicYearId: academicYear.id,
              semester: 1,
            },
          },
          update: {
            programId: secInfo.programId,
            sectionId: secInfo.sectionId,
            year: 1,
            rollNoInSection: String(indexInSection),
            isCurrent: true,
          },
          create: {
            studentId: studentProfile.id,
            academicYearId: academicYear.id,
            programId: secInfo.programId,
            sectionId: secInfo.sectionId,
            year: 1,
            semester: 1,
            rollNoInSection: String(indexInSection),
            isCurrent: true,
          },
        });

        // 7.5 Assign to Lab Batch (Batch 1 for 1st half, Batch 2 for 2nd half)
        const halfCount = Math.ceil(group.students.length / 2);
        const assignedBatchId = indexInSection <= halfCount ? secInfo.labBatch1Id : secInfo.labBatch2Id;

        await prisma.labBatchStudent.upsert({
          where: {
            labBatchId_studentId: {
              labBatchId: assignedBatchId,
              studentId: studentProfile.id,
            },
          },
          update: {},
          create: {
            labBatchId: assignedBatchId,
            studentId: studentProfile.id,
          },
        });
      })
    );

    processed += chunk.length;
    process.stdout.write(`   Imported ${processed} / ${allStudentsList.length} students...\r`);
  }

  console.log(`\n\n🎉 Successfully ingested all ${processed} students into the database!`);

  // Verification Summary
  const countStudents = await prisma.student.count();
  const countUsers = await prisma.user.count();
  const countEnrollments = await prisma.studentEnrollment.count();
  const countSections = await prisma.section.count();

  console.log("\n=================================================================");
  console.log("📋 SYSTEM VERIFICATION SUMMARY");
  console.log("=================================================================");
  console.log(`• Total Student Profiles: ${countStudents}`);
  console.log(`• Total Users:            ${countUsers}`);
  console.log(`• Total Enrollments:      ${countEnrollments}`);
  console.log(`• Total Sections:         ${countSections}`);
  console.log("=================================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during student import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
