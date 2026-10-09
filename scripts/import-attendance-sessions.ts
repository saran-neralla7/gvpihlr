import { PrismaClient, SubjectType, AttendanceStatus, SessionType } from "@prisma/client";
import xlsx from "xlsx";
import path from "path";

const prisma = new PrismaClient();

// Canonical Subjects definition
interface SubjectDef {
  code: string;
  name: string;
  shortName: string;
  type: SubjectType;
  departmentCode: string;
  aliases: string[];
}

const SUBJECT_DEFS: SubjectDef[] = [
  {
    code: "26MA101",
    name: "Calculus and Linear Algebra",
    shortName: "CAL & LA",
    type: SubjectType.THEORY,
    departmentCode: "MATH",
    aliases: ["CALCULUS AND LINEAR ALGEBRA", "CAL & LA", "CAL&LA"],
  },
  {
    code: "26PH101",
    name: "Engineering Physics",
    shortName: "ENGG.PHY",
    type: SubjectType.THEORY,
    departmentCode: "PHYS",
    aliases: ["ENGINEERING PHYSICS", "ENGG.PHY", "ENGG. PHY"],
  },
  {
    code: "26CS101",
    name: "Problem Solving using C",
    shortName: "PSUC",
    type: SubjectType.THEORY,
    departmentCode: "CSE",
    aliases: ["PROBLEM SOLVING USING C", "PSUC"],
  },
  {
    code: "26CS102",
    name: "AI Tools and Applications",
    shortName: "AITA",
    type: SubjectType.THEORY,
    departmentCode: "CSE",
    aliases: ["AI TOOLS AND APPLICATIONS", "AITA"],
  },
  {
    code: "26CS103",
    name: "Fundamentals of Web Designing and User Interface",
    shortName: "FWD",
    type: SubjectType.THEORY,
    departmentCode: "CSE",
    aliases: ["FUNDAMENTALS OF WEB DESIGNING AND UI", "FWD"],
  },
  {
    code: "26CH101",
    name: "Environmental Studies",
    shortName: "ENV. STD.",
    type: SubjectType.THEORY,
    departmentCode: "CHEM_SCI",
    aliases: ["ENVIRONMENTAL STUDIES", "ENV. STD.", "ENV. STD", "ES"],
  },
  {
    code: "26CS104",
    name: "3D Design and Animation",
    shortName: "3DDA",
    type: SubjectType.THEORY,
    departmentCode: "CSE",
    aliases: ["3D DESIGN AND ANIMATION", "3DDA"],
  },
  {
    code: "26AI101",
    name: "Foundations of Artificial Intelligence & Machine Learning",
    shortName: "FAI & ML",
    type: SubjectType.THEORY,
    departmentCode: "CSE",
    aliases: ["FOUNDATIONS OF AI AND ML", "FAI & ML", "FAI&ML"],
  },
  {
    code: "26EC101",
    name: "Digital Logic Design",
    shortName: "DLD",
    type: SubjectType.THEORY,
    departmentCode: "ECE",
    aliases: ["DIGITAL LOGIC DESIGN", "DLD"],
  },
  {
    code: "26EC102",
    name: "Energy Systems and Advanced Materials",
    shortName: "ESAM",
    type: SubjectType.THEORY,
    departmentCode: "ECE",
    aliases: ["ENERGY SYSTEMS AND ADVANCED MATERIALS", "ESAM"],
  },
  {
    code: "26CE101",
    name: "Sustainability Engineering",
    shortName: "SUS. ENGG.",
    type: SubjectType.THEORY,
    departmentCode: "CIVIL",
    aliases: ["SUSTAINABILITY ENGINEERING", "SUS. ENGG.", "SUS. ENGG", "SE"],
  },
  {
    code: "26EN101",
    name: "Essential English",
    shortName: "ESS. ENG.",
    type: SubjectType.THEORY,
    departmentCode: "ENG",
    aliases: ["ESSENTIAL ENGLISH", "ESS. ENG.", "ESS. ENG", "EE"],
  },
  {
    code: "26CH102",
    name: "Chemistry of Materials",
    shortName: "COM",
    type: SubjectType.THEORY,
    departmentCode: "CHEM_SCI",
    aliases: ["CHEMISTRY OF MATERIALS", "COM"],
  },
  {
    code: "26ME101",
    name: "Elements of Mechanical Engineering",
    shortName: "EME",
    type: SubjectType.THEORY,
    departmentCode: "MECH",
    aliases: ["ELEMENTS OF MECHANICAL ENGINEERING", "EME"],
  },
  {
    code: "26EE101",
    name: "Fundamentals of Electrical & Electronics Engineering",
    shortName: "FEEE",
    type: SubjectType.THEORY,
    departmentCode: "EEE",
    aliases: ["FUNDAMENTALS OF ELECTRICAL & ELECTRONICS ENG", "FEEE"],
  },
  {
    code: "26CE102",
    name: "Surveying and Geomatics",
    shortName: "S&G",
    type: SubjectType.THEORY,
    departmentCode: "CIVIL",
    aliases: ["SURVEYING AND GEOMATICS", "S&G"],
  },
  {
    code: "26CH103",
    name: "Principles of Chemical Engineering",
    shortName: "PCE",
    type: SubjectType.THEORY,
    departmentCode: "CHEM",
    aliases: ["PRINCIPLES OF CHEMICAL ENGINEERING", "PCE"],
  },
  {
    code: "26CH104",
    name: "Physical and Analytical Chemistry",
    shortName: "PAC",
    type: SubjectType.THEORY,
    departmentCode: "CHEM_SCI",
    aliases: ["PHYSICAL AND ANALYTICAL CHEMISTRY", "PAC"],
  },
  {
    code: "26DS101",
    name: "Foundations of Data Science & Cybersecurity Principles",
    shortName: "FDS / CSP",
    type: SubjectType.THEORY,
    departmentCode: "CSE",
    aliases: ["FOUNDATIONS OF DATA SCIENCE / CSP", "FDS", "CSP", "FDS / CSP"],
  },
  {
    code: "26CS105",
    name: "Problem Solving & Programming",
    shortName: "PPSTC",
    type: SubjectType.THEORY,
    departmentCode: "CSE",
    aliases: ["PROBLEM SOLVING & PROGRAMMING", "PPSTC"],
  },
  {
    code: "26EN102",
    name: "Professional Communication Skills",
    shortName: "PCS",
    type: SubjectType.THEORY,
    departmentCode: "ENG",
    aliases: ["PROFESSIONAL COMMUNICATION SKILLS", "PCS"],
  },
  // Labs
  {
    code: "26PH101L",
    name: "Engineering Physics Lab",
    shortName: "ENGG. PHY. LAB",
    type: SubjectType.LAB,
    departmentCode: "PHYS",
    aliases: ["ENGINEERING PHYSICS LAB", "ENGG. PHY. LAB", "ENGG.PHY LAB"],
  },
  {
    code: "26CS101L",
    name: "Problem Solving using C Lab",
    shortName: "PSUC LAB",
    type: SubjectType.LAB,
    departmentCode: "CSE",
    aliases: ["PROBLEM SOLVING USING C LAB", "PSUC LAB"],
  },
  {
    code: "26CS102L",
    name: "AI Tools and Applications Lab",
    shortName: "AITA LAB",
    type: SubjectType.LAB,
    departmentCode: "CSE",
    aliases: ["AI TOOLS AND APPLICATIONS LAB", "AITA LAB"],
  },
  {
    code: "26CS103L",
    name: "Fundamentals of Web Designing and UI Lab",
    shortName: "FWD LAB",
    type: SubjectType.LAB,
    departmentCode: "CSE",
    aliases: ["FUNDAMENTALS OF WEB DESIGNING AND UI LAB", "FWD LAB"],
  },
  {
    code: "26AI101L",
    name: "Foundations of AI & ML Lab",
    shortName: "FAI & ML LAB",
    type: SubjectType.LAB,
    departmentCode: "CSE",
    aliases: ["FOUNDATIONS OF AI AND ML LAB", "FAI & ML LAB"],
  },
  {
    code: "26EC101L",
    name: "Digital Logic Design Lab",
    shortName: "DLD LAB",
    type: SubjectType.LAB,
    departmentCode: "ECE",
    aliases: ["DIGITAL LOGIC DESIGN LAB", "DLD LAB"],
  },
  {
    code: "26EN101L",
    name: "Essential English Lab",
    shortName: "ESS. ENG. LAB",
    type: SubjectType.LAB,
    departmentCode: "ENG",
    aliases: ["ESSENTIAL ENGLISH LAB", "ESS. ENG. LAB", "EE LAB"],
  },
  {
    code: "26ME101L",
    name: "Elements of Mechanical Engineering Lab",
    shortName: "EME LAB",
    type: SubjectType.LAB,
    departmentCode: "MECH",
    aliases: ["ELEMENTS OF MECHANICAL ENGINEERING LAB", "EME LAB"],
  },
  {
    code: "26EE101L",
    name: "Fundamentals of Electrical & Electronics Eng Lab",
    shortName: "FEEE LAB",
    type: SubjectType.LAB,
    departmentCode: "EEE",
    aliases: ["FUNDAMENTALS OF ELECTRICAL & ELECTRONICS ENG LAB", "FEEE LAB"],
  },
  {
    code: "26CE102L",
    name: "Surveying and Geomatics Lab",
    shortName: "S&G LAB",
    type: SubjectType.LAB,
    departmentCode: "CIVIL",
    aliases: ["SURVEYING AND GEOMATICS LAB", "S&G LAB"],
  },
  {
    code: "26CH103L",
    name: "Principles of Chemical Engineering Lab",
    shortName: "PCE LAB",
    type: SubjectType.LAB,
    departmentCode: "CHEM",
    aliases: ["PRINCIPLES OF CHEMICAL ENGINEERING LAB", "PCE LAB"],
  },
  {
    code: "26CH104L",
    name: "Physical and Analytical Chemistry Lab",
    shortName: "PAC LAB",
    type: SubjectType.LAB,
    departmentCode: "CHEM_SCI",
    aliases: ["PHYSICAL AND ANALYTICAL CHEMISTRY LAB", "PAC LAB"],
  },
  {
    code: "26CH105L",
    name: "Engineering Chemistry Lab",
    shortName: "ENGG. CHEM LAB",
    type: SubjectType.LAB,
    departmentCode: "CHEM_SCI",
    aliases: ["ENGINEERING CHEMISTRY LAB", "ENGG. CHEM LAB", "CHEM LAB"],
  },
  {
    code: "26CS105L",
    name: "Problem Solving & Programming Lab",
    shortName: "PPSTC LAB",
    type: SubjectType.LAB,
    departmentCode: "CSE",
    aliases: ["PROBLEM SOLVING & PROGRAMMING LAB", "PPSTC LAB"],
  },
  {
    code: "26DS101L",
    name: "Foundations of Data Science / CSP Lab",
    shortName: "FDS / CSP LAB",
    type: SubjectType.LAB,
    departmentCode: "CSE",
    aliases: ["FOUNDATIONS OF DATA SCIENCE / CSP LAB", "CSP LAB"],
  },
];

// Branch matching in daily timetable sheets
const BRANCH_MAP: Record<string, string[]> = {
  "CSE(AI&ML)-1": ["BTECH-CS-AND-ENG-AI-AND-ML_1"],
  "CSE(AI&ML)-2": ["BTECH-CS-AND-ENG-AI-AND-ML_2"],
  "CSE-1": ["BTECH-CS-AND-ENG_1"],
  "CSE-2": ["BTECH-CS-AND-ENG_2"],
  "ECE-1": ["BTECH-ELECTRONICS-AND-COMMUNICATION-ENG_1"],
  "ECE-2": ["BTECH-ELECTRONICS-AND-COMMUNICATION-ENG_2"],
  "ECE-3": ["BTECH-ELECTRONICS-ENG-VLSI-DESIGN-AND-TECHNOLOGY_1"],
  "MECH": ["BTECH-MECHANICAL-ENG_1"],
  "MECH-ROBOTICS": ["BTECH-MECHANICAL-ENG-ROBOTICS-AND-AI_1"],
  "CSE (CS & DS)": [
    "BTECH-CS-AND-ENG-CYBERSECURITY_1",
    "BTECH-CS-AND-ENG-DATA-SCIENCE_1",
  ],
  "EEE": ["BTECH-ELECTRICAL-AND-ELECTRONICS-ENG_1"],
  "CIVIL": ["BTECH-CIVIL-ENG_1"],
  "CHEMICAL": ["BTECH-CHEMICAL-ENG_1"],
};

// 12 Dates starting from 22-Sep-2026
const DATES = [
  { sheet: "Timetable_Final_22", date: "2026-09-22", col: 8 },
  { sheet: "Timetable_Final_23", date: "2026-09-23", col: 9 },
  { sheet: "Timetable_Final_25", date: "2026-09-25", col: 10 },
  { sheet: "Timetable_Final_26", date: "2026-09-26", col: 11 },
  { sheet: "Timetable_Final_28", date: "2026-09-28", col: 12 },
  { sheet: "Timetable_Final_29", date: "2026-09-29", col: 13 },
  { sheet: "Timetable_Final_30", date: "2026-09-30", col: 14 },
  { sheet: "Timetable_Final_01", date: "2026-10-01", col: 15 },
  { sheet: "Timetable_Final_03", date: "2026-10-03", col: 16 },
  { sheet: "Timetable_Final_05", date: "2026-10-05", col: 17 },
  { sheet: "Timetable_Final_06", date: "2026-10-06", col: 18 },
  { sheet: "Timetable_Final_07", date: "2026-10-07", col: 19 },
];

function resolveSubjectDef(raw: string): SubjectDef | null {
  if (!raw) return null;
  let s = raw.split(/[\r\n/]/)[0].trim().toUpperCase().replace(/\s+/g, " ");
  if (s === "BREAK" || s === "LUNCH" || s === "NIL" || !s) return null;

  for (const def of SUBJECT_DEFS) {
    if (def.code === s || def.shortName.toUpperCase() === s || def.name.toUpperCase() === s) {
      return def;
    }
    for (const alias of def.aliases) {
      if (s === alias || s.startsWith(alias) || alias.startsWith(s)) {
        return def;
      }
    }
  }

  // Fallback checks
  if (s.includes("PHYSICS") || s.includes("PHY")) {
    return s.includes("LAB") ? SUBJECT_DEFS.find((d) => d.code === "26PH101L")! : SUBJECT_DEFS.find((d) => d.code === "26PH101")!;
  }
  if (s.includes("CALCULUS") || s.includes("CAL")) return SUBJECT_DEFS.find((d) => d.code === "26MA101")!;
  if (s.includes("PSUC") || s.includes("C LAB") || s.includes("PPSTC")) {
    return s.includes("LAB") ? SUBJECT_DEFS.find((d) => d.code === "26CS101L")! : SUBJECT_DEFS.find((d) => d.code === "26CS101")!;
  }
  if (s.includes("AITA")) {
    return s.includes("LAB") ? SUBJECT_DEFS.find((d) => d.code === "26CS102L")! : SUBJECT_DEFS.find((d) => d.code === "26CS102")!;
  }
  if (s.includes("FWD")) {
    return s.includes("LAB") ? SUBJECT_DEFS.find((d) => d.code === "26CS103L")! : SUBJECT_DEFS.find((d) => d.code === "26CS103")!;
  }
  if (s.includes("ENV") || s.includes("ES")) return SUBJECT_DEFS.find((d) => d.code === "26CH101")!;
  if (s.includes("FAI") || s.includes("ML")) {
    return s.includes("LAB") ? SUBJECT_DEFS.find((d) => d.code === "26AI101L")! : SUBJECT_DEFS.find((d) => d.code === "26AI101")!;
  }
  if (s.includes("EME")) {
    return s.includes("LAB") ? SUBJECT_DEFS.find((d) => d.code === "26ME101L")! : SUBJECT_DEFS.find((d) => d.code === "26ME101")!;
  }
  if (s.includes("COM") || s.includes("CHEM")) {
    return s.includes("LAB") ? SUBJECT_DEFS.find((d) => d.code === "26CH105L")! : SUBJECT_DEFS.find((d) => d.code === "26CH102")!;
  }
  if (s.includes("ENG") || s.includes("EE")) {
    return s.includes("LAB") ? SUBJECT_DEFS.find((d) => d.code === "26EN101L")! : SUBJECT_DEFS.find((d) => d.code === "26EN101")!;
  }
  if (s.includes("SUS") || s.includes("SE")) {
    return SUBJECT_DEFS.find((d) => d.code === "26CE101")!;
  }

  return SUBJECT_DEFS[0]; // fallback default
}

async function main() {
  console.log("=================================================================");
  console.log("🚀 Ingesting Timetable Classes & Attendance (22-Sep to 07-Oct)");
  console.log("=================================================================\n");

  // 1. Get Academic Year 2026-27 and Admin User
  const academicYear = await prisma.academicYear.findUniqueOrThrow({
    where: { code: "2026-27" },
  });
  const adminUser = await prisma.user.findFirstOrThrow({
    where: { username: "admin" },
  });

  // 2. Fetch Departments and map to a primary Faculty ID
  const departments = await prisma.department.findMany({
    include: { facultyMembers: true },
  });
  const deptFacultyMap = new Map<string, string>();
  const allFaculty = await prisma.faculty.findMany();
  const fallbackFacultyId = allFaculty[0].id;

  for (const d of departments) {
    if (d.facultyMembers.length > 0) {
      deptFacultyMap.set(d.code, d.facultyMembers[0].id);
    } else {
      deptFacultyMap.set(d.code, fallbackFacultyId);
    }
  }

  // 3. Upsert all Subjects in DB
  console.log("📚 Upserting 36 Subjects...");
  const subjectRecordMap = new Map<string, string>(); // code -> id

  for (const def of SUBJECT_DEFS) {
    const deptId = departments.find((d) => d.code === def.departmentCode)?.id || departments[0].id;
    const sub = await prisma.subject.upsert({
      where: { code: def.code },
      update: {
        name: def.name,
        shortName: def.shortName,
        type: def.type,
        departmentId: deptId,
        isActive: true,
      },
      create: {
        code: def.code,
        name: def.name,
        shortName: def.shortName,
        type: def.type,
        credits: def.type === SubjectType.LAB ? 1.5 : 3.0,
        departmentId: deptId,
        isActive: true,
      },
    });
    subjectRecordMap.set(def.code, sub.id);
  }
  console.log(`✅ ${subjectRecordMap.size} Subjects ready in Database.\n`);

  // 4. Fetch all 14 Sections and create SubjectOfferings & FacultySubjectAssignments
  console.log("🏫 Preparing Offerings & Assignments for all 14 Sections...");
  const sections = await prisma.section.findMany({
    include: { program: true },
  });

  // map: `${sectionId}_${subjectId}` -> assignmentId
  const assignmentMap = new Map<string, string>();

  for (const sec of sections) {
    for (const def of SUBJECT_DEFS) {
      const subjectId = subjectRecordMap.get(def.code)!;
      const facultyId = deptFacultyMap.get(def.departmentCode) || fallbackFacultyId;

      // 4.1 Upsert SubjectOffering
      const offering = await prisma.subjectOffering.upsert({
        where: {
          academicYearId_programId_subjectId_year_semester: {
            academicYearId: academicYear.id,
            programId: sec.programId,
            subjectId,
            year: 1,
            semester: 1,
          },
        },
        update: { isActive: true },
        create: {
          academicYearId: academicYear.id,
          programId: sec.programId,
          subjectId,
          year: 1,
          semester: 1,
          isActive: true,
        },
      });

      // 4.2 Upsert FacultySubjectAssignment
      const assignment = await prisma.facultySubjectAssignment.upsert({
        where: {
          academicYearId_facultyId_subjectOfferingId_sectionId: {
            academicYearId: academicYear.id,
            facultyId,
            subjectOfferingId: offering.id,
            sectionId: sec.id,
          },
        },
        update: { isActive: true },
        create: {
          academicYearId: academicYear.id,
          facultyId,
          subjectOfferingId: offering.id,
          sectionId: sec.id,
          isPrimary: true,
          isActive: true,
        },
      });

      assignmentMap.set(`${sec.id}_${subjectId}`, assignment.id);
    }
  }
  console.log(`✅ Section Subject Offerings and Assignments ready.\n`);

  // 5. Read Attendance File (Roll No -> Map<dateStr, "P" | "A">)
  console.log("📋 Reading Student Attendance File...");
  const wbAtt = xlsx.readFile("ATTENDANCE (2026-27)  GVPIHLR  09-10-2026.xlsx");
  const sheetAtt = wbAtt.Sheets[wbAtt.SheetNames[0]];
  const attRows: any[][] = xlsx.utils.sheet_to_json(sheetAtt, { header: 1 });

  // studentRoll -> Map<dateStr, "P" | "A">
  const attendanceMap = new Map<string, Map<string, string>>();

  for (let r = 5; r < attRows.length; r++) {
    const row = attRows[r];
    if (!row || !row[1]) continue;
    const roll = String(row[1]).trim().toUpperCase();
    if (!roll.startsWith("26UE")) continue;

    if (!attendanceMap.has(roll)) {
      attendanceMap.set(roll, new Map());
    }
    const studentDates = attendanceMap.get(roll)!;

    for (const d of DATES) {
      const mark = row[d.col] !== undefined && row[d.col] !== null ? String(row[d.col]).trim().toUpperCase() : "A";
      studentDates.set(d.date, mark === "P" ? "P" : "A");
    }
  }
  console.log(`✅ Loaded attendance records for ${attendanceMap.size} students across 12 dates.\n`);

  // 6. Pre-load Enrolled Students per Section
  const sectionEnrollmentsMap = new Map<string, { studentId: string; rollNumber: string }[]>();
  for (const sec of sections) {
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        sectionId: sec.id,
        academicYearId: academicYear.id,
        isCurrent: true,
      },
      include: { student: true },
    });
    sectionEnrollmentsMap.set(
      sec.id,
      enrollments.map((e) => ({
        studentId: e.student.id,
        rollNumber: e.student.rollNumber,
      }))
    );
  }

  // 7. Read Timetable Sheets and generate AttendanceSessions + AttendanceRecords
  console.log("🧹 Clearing previous attendance sessions & records for clean ingest...");
  await prisma.attendanceRecord.deleteMany({});
  await prisma.attendanceSession.deleteMany({});
  console.log("✅ Clean state ready.\n");

  console.log("🗓️ Processing 12 Dates of Timetable Schedules & Generating Sessions...");
  const wbTT = xlsx.readFile("1st Sem TIME TABLE 2026-2027_1.1.2.xlsx");

  // Quick lookup from section key e.g. "BTECH-CS-AND-ENG_1" -> Section
  const secLookup = new Map<string, any>();
  sections.forEach((s) => {
    secLookup.set(`${s.program.code}_${s.name}`, s);
  });

  // Sort branch patterns by length in descending order so "MECH-ROBOTICS" matches before "MECH"
  const sortedBranchEntries = Object.entries(BRANCH_MAP).sort(
    (a, b) => b[0].length - a[0].length
  );

  let totalSessionsCreated = 0;
  let totalRecordsCreated = 0;

  for (const dateItem of DATES) {
    const sheet = wbTT.Sheets[dateItem.sheet];
    if (!sheet) {
      console.warn(`⚠️ Warning: Timetable sheet ${dateItem.sheet} not found!`);
      continue;
    }

    const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const sessionDate = new Date(`${dateItem.date}T00:00:00.000Z`);

    // For each row in the timetable sheet
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;
      const branchCell = String(row[0] || "").trim();

      // Find matching sections (longest pattern match first)
      let targetSectionKeys: string[] = [];
      for (const [pattern, keys] of sortedBranchEntries) {
        if (branchCell.includes(pattern)) {
          targetSectionKeys = keys;
          break;
        }
      }

      if (targetSectionKeys.length === 0) continue;

      // Extract subjects for Periods 1 to 6
      // Cols: 2 (P1), 3 (P2), 5 (P3), 6 (P4), 8 (P5), 9 (P6)
      const periodCols = [2, 3, 5, 6, 8, 9];
      const periodSubjects: (SubjectDef | null)[] = [];

      for (let p = 0; p < periodCols.length; p++) {
        const colIdx = periodCols[p];
        const cellVal = row[colIdx];
        let subDef = resolveSubjectDef(String(cellVal || ""));

        // If P4 is null and P3 was a lab, P4 is part of that 2-hour lab
        if (!subDef && p === 3 && periodSubjects[2]?.type === SubjectType.LAB) {
          subDef = periodSubjects[2];
        }
        // If P6 is null and P5 was a lab, P6 is part of that 2-hour lab
        if (!subDef && p === 5 && periodSubjects[4]?.type === SubjectType.LAB) {
          subDef = periodSubjects[4];
        }

        // Fallback default theory subject if cell was empty
        if (!subDef) {
          subDef = SUBJECT_DEFS[0]; // Calculus
        }
        periodSubjects.push(subDef);
      }

      // Now create sessions and records for each target section and period 1 to 6
      for (const secKey of targetSectionKeys) {
        const sec = secLookup.get(secKey);
        if (!sec) continue;

        const enrolledStudents = sectionEnrollmentsMap.get(sec.id) || [];
        if (enrolledStudents.length === 0) continue;

        for (let p = 0; p < 6; p++) {
          const periodNumber = p + 1;
          const subDef = periodSubjects[p] || SUBJECT_DEFS[0];
          const subjectId = subjectRecordMap.get(subDef.code)!;
          const assignmentId = assignmentMap.get(`${sec.id}_${subjectId}`)!;

          // Calculate present & absent count for this section on this date
          let presentCount = 0;
          let absentCount = 0;
          const recordsToInsert: { studentId: string; status: AttendanceStatus }[] = [];

          for (const st of enrolledStudents) {
            const mark = attendanceMap.get(st.rollNumber)?.get(dateItem.date);
            const isPresent = mark === "P";
            if (isPresent) presentCount++;
            else absentCount++;

            recordsToInsert.push({
              studentId: st.studentId,
              status: isPresent ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
            });
          }

          // Upsert AttendanceSession
          const facultyId = deptFacultyMap.get(subDef.departmentCode) || fallbackFacultyId;

          const existingSession = await prisma.attendanceSession.findFirst({
            where: {
              academicYearId: academicYear.id,
              sectionId: sec.id,
              assignmentId,
              sessionDate,
              periodNumber,
            },
          });

          let sessionId: string;
          if (existingSession) {
            sessionId = existingSession.id;
            await prisma.attendanceSession.update({
              where: { id: sessionId },
              data: {
                totalStudents: enrolledStudents.length,
                presentCount,
                absentCount,
                sessionType: subDef.type === SubjectType.LAB ? SessionType.LAB_PRACTICAL : SessionType.REGULAR,
              },
            });
            // Delete old records to prevent duplicates on rerun
            await prisma.attendanceRecord.deleteMany({
              where: { sessionId },
            });
          } else {
            const newSession = await prisma.attendanceSession.create({
              data: {
                academicYearId: academicYear.id,
                sectionId: sec.id,
                assignmentId,
                facultyId,
                sessionDate,
                periodNumber,
                sessionType: subDef.type === SubjectType.LAB ? SessionType.LAB_PRACTICAL : SessionType.REGULAR,
                totalStudents: enrolledStudents.length,
                presentCount,
                absentCount,
                recordedById: adminUser.id,
              },
            });
            sessionId = newSession.id;
          }

          totalSessionsCreated++;

          // Bulk insert AttendanceRecord
          const recordsData = recordsToInsert.map((r) => ({
            sessionId,
            studentId: r.studentId,
            status: r.status,
          }));

          await prisma.attendanceRecord.createMany({
            data: recordsData,
          });

          totalRecordsCreated += recordsData.length;
        }
      }
    }

    process.stdout.write(`   Processed date: ${dateItem.date} (${dateItem.sheet})\n`);
  }

  console.log(`\n🎉 Ingestion Finished!`);
  console.log(`• Total Attendance Sessions Created: ${totalSessionsCreated}`);
  console.log(`• Total Attendance Records Created:  ${totalRecordsCreated}\n`);

  // 8. Sample Verification Query for a student
  const sampleRoll = "26UECHE0001";
  const student = await prisma.student.findUnique({
    where: { rollNumber: sampleRoll },
    include: {
      enrollments: { include: { section: true, program: true } },
    },
  });

  if (student && student.enrollments[0]) {
    const secId = student.enrollments[0].sectionId;
    const studentRecords = await prisma.attendanceRecord.findMany({
      where: {
        studentId: student.id,
        session: { sectionId: secId },
      },
      include: {
        session: {
          include: {
            assignment: { include: { subjectOffering: { include: { subject: true } } } },
          },
        },
      },
    });

    const attended = studentRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const total = studentRecords.length;
    const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : "-";

    console.log("=================================================================");
    console.log(`📊 LIVE STUDENT VERIFICATION: ${sampleRoll}`);
    console.log("=================================================================");
    console.log(`• Total Classes Conducted: ${total}`);
    console.log(`• Classes Attended:        ${attended}`);
    console.log(`• Attendance Percentage:   ${percentage}%`);
    console.log("=================================================================\n");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error during attendance ingestion:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
