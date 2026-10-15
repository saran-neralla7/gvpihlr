import { PrismaClient, SubjectType } from "@prisma/client";
import xlsx from "xlsx";
import path from "path";

const prisma = new PrismaClient();

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
    aliases: ["ENGINEERING PHYSICS", "ENGG.PHY", "ENGG. PHY", "PHY"],
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
    shortName: "SE",
    type: SubjectType.THEORY,
    departmentCode: "CIVIL",
    aliases: ["SUSTAINABILITY ENGINEERING", "SE"],
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
    code: "26EN101",
    name: "Essential English",
    shortName: "ESS. ENG.",
    type: SubjectType.THEORY,
    departmentCode: "ENG",
    aliases: ["ESSENTIAL ENGLISH", "ESS. ENG.", "EE"],
  },
  {
    code: "26CH102",
    name: "Commodity and Engineering Chemistry",
    shortName: "CEC",
    type: SubjectType.THEORY,
    departmentCode: "CHEM_SCI",
    aliases: ["COMMODITY AND ENGINEERING CHEMISTRY", "CEC", "ENGG. CHEM"],
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

const PERIOD_TIMINGS = [
  { num: 1, startTime: "09:00", endTime: "10:00", col: 2 },
  { num: 2, startTime: "10:00", endTime: "11:00", col: 3 },
  { num: 3, startTime: "11:15", endTime: "12:15", col: 5 },
  { num: 4, startTime: "12:15", endTime: "13:15", col: 6 },
  { num: 5, startTime: "14:15", endTime: "15:15", col: 8 },
  { num: 6, startTime: "15:15", endTime: "16:15", col: 9 },
];

const WEEK_DAYS = [
  { dayOfWeek: 1, sheet: "Timetable_Final_12", name: "MONDAY" },
  { dayOfWeek: 2, sheet: "Timetable_Final_13", name: "TUESDAY" },
  { dayOfWeek: 3, sheet: "Copy of Timetable_Final_14", fallback: "Timetable_Final_07", name: "WEDNESDAY" },
  { dayOfWeek: 4, sheet: "Timetable_Final_15", name: "THURSDAY" },
  { dayOfWeek: 5, sheet: "Timetable_Final_16", name: "FRIDAY" },
  { dayOfWeek: 6, sheet: "Timetable_Final_03", name: "SATURDAY" },
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

function extractRoomNumber(cellVal: string, defaultRoom: string): string {
  if (!cellVal) return defaultRoom;
  const lines = cellVal.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 3) {
    const lastLine = lines[lines.length - 1];
    if (lastLine.match(/^[A-Z0-9\-\.\s,]+$/i) && (lastLine.includes("G-") || lastLine.includes("A-") || lastLine.includes("LAB") || lastLine.includes("ROOM"))) {
      return lastLine;
    }
  }
  return defaultRoom;
}

async function main() {
  console.log("==========================================================");
  console.log("🚀 Ingesting Master Weekly Timetable into TimetableEntry");
  console.log("==========================================================\n");

  const academicYear = await prisma.academicYear.findUniqueOrThrow({
    where: { code: "2026-27" },
  });

  const sections = await prisma.section.findMany({
    where: { isActive: true },
    include: { program: true },
  });

  const secLookup = new Map<string, any>();
  sections.forEach((s) => {
    secLookup.set(`${s.program.code}_${s.name}`, s);
  });

  const subjects = await prisma.subject.findMany();
  const subjectMap = new Map<string, string>();
  subjects.forEach((s) => subjectMap.set(s.code, s.id));

  // Map of (sectionId_subjectId) -> assignment
  const assignments = await prisma.facultySubjectAssignment.findMany({
    where: { isActive: true },
    include: { subjectOffering: { include: { subject: true } } },
  });
  const assignmentMap = new Map<string, { id: string; facultyId: string }>();
  for (const a of assignments) {
    assignmentMap.set(`${a.sectionId}_${a.subjectOffering.subjectId}`, {
      id: a.id,
      facultyId: a.facultyId,
    });
  }

  const sortedBranchEntries = Object.entries(BRANCH_MAP).sort(
    (a, b) => b[0].length - a[0].length
  );

  const filePath = path.join(process.cwd(), "1stSemTIME-TABLE 2026-2027_1.1.2.xlsx");
  const wb = xlsx.readFile(filePath);

  console.log("🧹 Clearing previous TimetableEntry records...");
  await prisma.timetableEntry.deleteMany({});
  console.log("✅ Ready to insert weekly schedule.\n");

  let totalEntriesCreated = 0;

  for (const day of WEEK_DAYS) {
    let sheetName = day.sheet;
    let ws = wb.Sheets[sheetName];
    if (!ws && day.fallback) {
      sheetName = day.fallback;
      ws = wb.Sheets[sheetName];
    }
    if (!ws) {
      console.warn(`⚠️ Sheet ${sheetName} not found, skipping ${day.name}`);
      continue;
    }

    const rows: any[][] = xlsx.utils.sheet_to_json(ws, { header: 1 });
    let dayCount = 0;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;
      const branchCell = String(row[0] || "").trim();
      const defaultRoom = String(row[1] || "").trim() || "G-204";

      let targetSectionKeys: string[] = [];
      for (const [pattern, keys] of sortedBranchEntries) {
        if (branchCell.includes(pattern)) {
          targetSectionKeys = keys;
          break;
        }
      }

      if (targetSectionKeys.length === 0) continue;

      const periodSubjects: (SubjectDef | null)[] = [];
      const periodRooms: string[] = [];

      for (let p = 0; p < PERIOD_TIMINGS.length; p++) {
        const pt = PERIOD_TIMINGS[p];
        const cellVal = String(row[pt.col] || "");
        let subDef = resolveSubjectDef(cellVal);
        let room = extractRoomNumber(cellVal, defaultRoom);

        // Lab continuity
        if (!subDef && p === 3 && periodSubjects[2]?.type === SubjectType.LAB) {
          subDef = periodSubjects[2];
          room = periodRooms[2];
        }
        if (!subDef && p === 5 && periodSubjects[4]?.type === SubjectType.LAB) {
          subDef = periodSubjects[4];
          room = periodRooms[4];
        }

        if (!subDef) {
          subDef = SUBJECT_DEFS[0]; // Calculus
        }

        periodSubjects.push(subDef);
        periodRooms.push(room);
      }

      for (const secKey of targetSectionKeys) {
        const sec = secLookup.get(secKey);
        if (!sec) continue;

        for (let p = 0; p < PERIOD_TIMINGS.length; p++) {
          const pt = PERIOD_TIMINGS[p];
          const subDef = periodSubjects[p] || SUBJECT_DEFS[0];
          const subjectId = subjectMap.get(subDef.code);
          if (!subjectId) continue;

          const assignment = assignmentMap.get(`${sec.id}_${subjectId}`);
          if (!assignment) continue;

          await prisma.timetableEntry.create({
            data: {
              academicYearId: academicYear.id,
              sectionId: sec.id,
              assignmentId: assignment.id,
              facultyId: assignment.facultyId,
              dayOfWeek: day.dayOfWeek,
              startTime: pt.startTime,
              endTime: pt.endTime,
              roomNumber: periodRooms[p] || defaultRoom,
              isActive: true,
            },
          });

          dayCount++;
          totalEntriesCreated++;
        }
      }
    }

    console.log(`✅ ${day.name} (Day ${day.dayOfWeek}) - Created ${dayCount} entries from sheet '${sheetName}'`);
  }

  console.log(`\n🎉 Ingestion Complete! Total Timetable Entries: ${totalEntriesCreated}`);
}

main()
  .catch((e) => {
    console.error("❌ Error importing weekly timetable:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
