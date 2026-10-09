import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";
import xlsx from "xlsx";
import path from "path";

type DegreeType = "UG" | "PG";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Book2.xlsx Import into GVPIHLR Campus Management System...");

  // 1. Ensure Academic Year & Regulation R1
  const academicYear = await prisma.academicYear.upsert({
    where: { code: "2026-27" },
    update: { isCurrent: true, isActive: true },
    create: {
      code: "2026-27",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2027-06-30"),
      isCurrent: true,
      isActive: true,
    },
  });
  console.log(`✅ Academic Year ready: ${academicYear.code}`);

  const regulationR1 = await prisma.regulation.upsert({
    where: { code: "R1" },
    update: { isActive: true },
    create: {
      code: "R1",
      name: "Regulation R1",
      academicYearStart: "2026-27",
      description: "Deemed University Academic Curriculum Regulation R1",
      isActive: true,
    },
  });
  console.log(`✅ Regulation ready: ${regulationR1.code} - ${regulationR1.name}`);

  // 2. Schools Definition
  const schoolsData = [
    { code: "SCSE", name: "School of Computer Science and Engineering", description: "Computing, Data Science, AI & Cyber Studies" },
    { code: "SEEE", name: "School of Electrical and Electronics Engineering", description: "Electrical, Electronics & VLSI Systems" },
    { code: "SCMC", name: "School of Chemical, Mechanical and Civil", description: "Core Engineering Disciplines & Robotics" },
    { code: "SSCI", name: "School of Sciences", description: "Mathematical, Physical, Chemical & Biological Sciences, Applications" },
    { code: "SCM", name: "School of Commerce and Management", description: "Management, Business Analytics, Logistics & Enterprise" },
    { code: "SAH", name: "School of Arts and Humanities", description: "Civil Service Studies, Languages, Economics & Humanities" },
  ];

  const schoolsMap = new Map<string, string>();
  for (const s of schoolsData) {
    const sc = await prisma.school.upsert({
      where: { code: s.code },
      update: { name: s.name, description: s.description, isActive: true },
      create: { code: s.code, name: s.name, description: s.description, isActive: true },
    });
    schoolsMap.set(s.code, sc.id);
  }
  console.log(`✅ ${schoolsData.length} Schools created/updated.`);

  // 3. Departments Definition (Distinguishing Service / Teaching departments)
  const departmentsData: { code: string; name: string; schoolCode: string | null; isTeachingOnly: boolean }[] = [
    { code: "CSE", name: "Department of Computer Science and Engineering", schoolCode: "SCSE", isTeachingOnly: false },
    { code: "IT", name: "Department of Information Technology", schoolCode: "SCSE", isTeachingOnly: false },
    { code: "ECE", name: "Department of Electronics and Communication Engineering", schoolCode: "SEEE", isTeachingOnly: false },
    { code: "EEE", name: "Department of Electrical and Electronics Engineering", schoolCode: "SEEE", isTeachingOnly: false },
    { code: "MECH", name: "Department of Mechanical Engineering", schoolCode: "SCMC", isTeachingOnly: false },
    { code: "CIVIL", name: "Department of Civil Engineering", schoolCode: "SCMC", isTeachingOnly: false },
    { code: "CHEM", name: "Department of Chemical Engineering", schoolCode: "SCMC", isTeachingOnly: false },
    { code: "MATH", name: "Department of Mathematics", schoolCode: null, isTeachingOnly: true },
    { code: "PHYS", name: "Department of Physics", schoolCode: null, isTeachingOnly: true },
    { code: "CHEM_SCI", name: "Department of Chemistry", schoolCode: null, isTeachingOnly: true },
    { code: "ENG", name: "Department of English", schoolCode: null, isTeachingOnly: true },
    { code: "MGMT", name: "Department of Management Studies", schoolCode: "SCM", isTeachingOnly: false },
    { code: "HSS", name: "Department of Humanities and Social Sciences", schoolCode: "SAH", isTeachingOnly: false },
  ];

  const deptsMap = new Map<string, string>();
  for (const d of departmentsData) {
    const schoolId = d.schoolCode ? (schoolsMap.get(d.schoolCode) || null) : null;
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name, schoolId, isTeachingOnly: d.isTeachingOnly, isActive: true },
      create: { code: d.code, name: d.name, schoolId, isTeachingOnly: d.isTeachingOnly, isActive: true },
    });
    deptsMap.set(d.code, dept.id);
  }
  console.log(`✅ ${departmentsData.length} Departments created/updated.`);

  // 4. Read Excel Workbook
  const filePath = path.join(process.cwd(), "Book2.xlsx");
  const workbook = xlsx.readFile(filePath);

  // 4.1 Process Programs from Sheet2
  const sheet2 = workbook.Sheets["Sheet2"];
  const sheet2Rows: any[] = xlsx.utils.sheet_to_json(sheet2, { header: 1 });

  const schoolCodeByName: Record<string, string> = {
    "SCHOOL OF COMPUTER SCIENCE AND ENGINEERING": "SCSE",
    "SCHOOL OF ELECTRICAL AND ELECTRONICS ENGINEERING": "SEEE",
    "SCHOOL OF CHEMICAL, MECHANICAL AND CIVIL": "SCMC",
    "SCHOOL OF SCIENCES": "SSCI",
    "SCHOOL OF COMMERCE AND MANAGEMENT": "SCM",
    "SCHOOL OF ARTS AND HUMANITIES": "SAH",
  };

  let currentSchoolName = "";
  let programsCreated = 0;

  for (let i = 2; i < sheet2Rows.length; i++) {
    const row = sheet2Rows[i];
    if (!row || row.length === 0) continue;

    const schoolCell = row[1] ? String(row[1]).trim() : "";
    if (schoolCell && schoolCodeByName[schoolCell.toUpperCase()]) {
      currentSchoolName = schoolCell.toUpperCase();
    }

    const progName = row[2] ? String(row[2]).trim() : "";
    const progLevel = row[3] ? String(row[3]).trim() : "B.Tech";
    const category = row[4] ? String(row[4]).trim() : "UG";

    if (!progName || !currentSchoolName) continue;

    const schoolCode = schoolCodeByName[currentSchoolName];
    const schoolId = schoolsMap.get(schoolCode);
    if (!schoolId) continue;

    // Generate clean unique program code
    let progCode = progName
      .toUpperCase()
      .replace(/&/g, "AND")
      .replace(/[(),]/g, "")
      .replace(/ARTIFICIAL INTELLIGENCE/g, "AI")
      .replace(/MACHINE LEARNING/g, "ML")
      .replace(/COMPUTER SCIENCE/g, "CS")
      .replace(/ENGINEERING/g, "ENG")
      .replace(/\s+/g, "-");

    const lvlPrefix = (progLevel || "UG").toUpperCase().replace(/\./g, "");
    if (!progCode.startsWith(lvlPrefix)) {
      progCode = `${lvlPrefix}-${progCode}`;
    }

    const degreeType: DegreeType = category.toUpperCase() === "PG" ? "PG" : "UG";
    let durationYears = 4;
    let totalSemesters = 8;

    if (progLevel.includes("BCA") || progLevel.includes("B.Sc") || progLevel.includes("BA") || progLevel.includes("BBA")) {
      durationYears = 3;
      totalSemesters = 6;
    } else if (degreeType === "PG") {
      durationYears = 2;
      totalSemesters = 4;
    }

    await prisma.program.upsert({
      where: { code: progCode },
      update: {
        name: progName,
        schoolId,
        regulationId: regulationR1.id,
        degreeType,
        durationYears,
        totalSemesters,
        isActive: true,
      },
      create: {
        code: progCode,
        name: progName,
        schoolId,
        regulationId: regulationR1.id,
        degreeType,
        durationYears,
        totalSemesters,
        isActive: true,
      },
    });

    programsCreated++;
  }
  console.log(`✅ ${programsCreated} Programs created/updated and linked to Regulation R1.`);

  // 5. Ensure FACULTY Role
  const facultyRole = await prisma.role.upsert({
    where: { name: RoleType.FACULTY },
    update: {},
    create: {
      name: RoleType.FACULTY,
      description: "Academic Faculty Member with Attendance & Course Authority",
    },
  });

  // 6. Process Faculty from Sheet3
  const sheet3 = workbook.Sheets["Sheet3"];
  const sheet3Rows: any[] = xlsx.utils.sheet_to_json(sheet3, { header: 1 });

  const deptKeyMap: Record<string, string> = {
    Chemical: "CHEM",
    Chemistry: "CHEM_SCI",
    CIVIL: "CIVIL",
    CSE: "CSE",
    ECE: "ECE",
    EEE: "EEE",
    English: "ENG",
    IT: "IT",
    Mathematics: "MATH",
    Mechanical: "MECH",
    Physics: "PHYS",
  };

  const defaultPassword = "gvp@2026";
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  let facultyCreated = 0;

  for (let i = 1; i < sheet3Rows.length; i++) {
    const row = sheet3Rows[i];
    if (!row || row.length < 5) continue;

    const fullName = row[1] ? String(row[1]).trim() : "";
    const shortName = row[2] ? String(row[2]).trim().toUpperCase() : "";
    const deptName = row[3] ? String(row[3]).trim() : "";
    const designation = row[4] ? String(row[4]).trim() : "Assistant Professor";

    if (!fullName || !shortName || !deptName) continue;

    const deptCode = deptKeyMap[deptName];
    const departmentId = deptCode ? deptsMap.get(deptCode) : null;
    if (!departmentId) {
      console.warn(`⚠️ Warning: Unknown department ${deptName} for faculty ${fullName} (${shortName})`);
      continue;
    }

    const username = shortName; // Username IS shortname
    const email = `${shortName.toLowerCase()}@gvpihlr.edu.in`;
    const employeeId = `GVPIHLR-${shortName}`;

    // Upsert User
    const user = await prisma.user.upsert({
      where: { username },
      update: {
        fullName,
        email,
        passwordHash: hashedPassword,
        isActive: true,
      },
      create: {
        username,
        email,
        passwordHash: hashedPassword,
        fullName,
        phone: "+91 9440112233",
        isActive: true,
      },
    });

    // Ensure UserRole
    const existingRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: facultyRole.id },
    });
    if (!existingRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: facultyRole.id,
          departmentId,
        },
      });
    } else if (existingRole.departmentId !== departmentId) {
      await prisma.userRole.update({
        where: { id: existingRole.id },
        data: { departmentId },
      });
    }

    // Upsert Faculty profile
    const existingProfile = await prisma.faculty.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      await prisma.faculty.update({
        where: { id: existingProfile.id },
        data: {
          shortName,
          employeeId,
          designation,
          departmentId,
          isActive: true,
        },
      });
    } else {
      await prisma.faculty.create({
        data: {
          userId: user.id,
          employeeId,
          shortName,
          designation,
          qualification: "Ph.D / M.Tech",
          departmentId,
          isActive: true,
        },
      });
    }

    facultyCreated++;
  }

  console.log(`\n🎉 SUCCESS! Fully imported ${facultyCreated} faculty members.`);
  console.log(`🔑 Login credentials for all faculty:`);
  console.log(`   - Username: Short Name (e.g. KR, BHP, BSK, SP, DC, etc.)`);
  console.log(`   - Password: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error("❌ Import error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
