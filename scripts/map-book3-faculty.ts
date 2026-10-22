import { prisma } from "../src/lib/prisma";
import xlsx from "xlsx";

export interface SubjectFacultyMapEntry {
  branch: string;
  sectionKey: string;
  subjectCode: string;
  subjectShortName: string;
  subjectName: string;
  facultyNames: string[];
}

const BRANCH_TO_SECTION_KEYS: Record<string, string[]> = {
  "CSE-1": ["BTECH-CS-AND-ENG - 1"],
  "CSE-2": ["BTECH-CS-AND-ENG - 2"],
  "CSE(AI&ML)-1": ["BTECH-CS-AND-ENG-AI-AND-ML - 1"],
  "CSE(AI&ML)-2": ["BTECH-CS-AND-ENG-AI-AND-ML - 2"],
  "CSE (CS & DS)": [
    "BTECH-CS-AND-ENG-CYBERSECURITY - 1",
    "BTECH-CS-AND-ENG-DATA-SCIENCE - 1",
  ],
  "ECE-1": ["BTECH-ELECTRONICS-AND-COMMUNICATION-ENG - 1"],
  "ECE-2": ["BTECH-ELECTRONICS-AND-COMMUNICATION-ENG - 2"],
  "ECE-3": ["BTECH-ELECTRONICS-ENG-VLSI-DESIGN-AND-TECHNOLOGY - 1"],
  "MECH": ["BTECH-MECHANICAL-ENG - 1"],
  "EEE": ["BTECH-ELECTRICAL-AND-ELECTRONICS-ENG - 1"],
  "CIVIL": ["BTECH-CIVIL-ENG - 1"],
  "CHEMICAL": ["BTECH-CHEMICAL-ENG - 1"],
  "MECH-ROBOTICS": ["BTECH-MECHANICAL-ENG-ROBOTICS-AND-AI - 1"],
};

const SUB_SHORT_TO_CODE: Record<string, string> = {
  "CAL & LA": "26MA101",
  "ENGG.PHY": "26PH101",
  "PPSTC": "26CS105",
  "AITA": "26CS102",
  "FWD": "26CS103",
  "ENV. STD.": "26CH101",
  "3DDA": "26CS104",
  "FAI & ML": "26AI101",
  "DLD": "26EC101",
  "ESAM": "26EC102",
  "SUS. ENGG.": "26CE101",
  "ESS. ENG.": "26EN101",
  "ESS. ENG. TUT": "26EN101",
  "COM": "26CH102",
  "EME": "26ME101",
  "FEEE": "26EE101",
  "S&G": "26CE102",
  "PAC": "26CH104",
  "PCE": "26CH103",
  "FDS": "26DS101",
  "FDS / CSP": "26DS101",
  "PCS": "26EN102",
  "ENGG. PHY. LAB": "26PH101L",
  "PPSTC LAB": "26CS105L",
  "AITA LAB": "26CS102L",
  "FWD LAB": "26CS103L",
  "FAI & ML LAB": "26AI101L",
  "ENGG. CHEM LAB": "26CH105L",
  "CHEM LAB": "26CH105L",
  "DLD LAB": "26EC101L",
  "ESS. ENG. LAB": "26EN101L",
  "EME LAB": "26ME101L",
  "FEEE LAB": "26EE101L",
  "S&G LAB": "26CE102L",
  "PAC LAB": "26CH104L",
  "PCE LAB": "26CH103L",
  "FDS LAB": "26DS101L",
  "FDS / CSP LAB": "26DS101L",
};

export async function mapBook3Faculty() {
  console.log("Reading Book3.xlsx...");
  const wb = xlsx.readFile("Book3.xlsx");
  const sheet2 = xlsx.utils.sheet_to_json<any>(wb.Sheets["Sheet2"]);
  const sheet3 = xlsx.utils.sheet_to_json<any>(wb.Sheets["Sheet3"]);

  console.log(`Loaded ${sheet2.length} rows from Sheet2, ${sheet3.length} rows from Sheet3.`);

  // Load all faculty from DB
  const dbFaculty = await prisma.faculty.findMany({
    include: { user: true, department: true },
  });

  const facultyByName = new Map<string, typeof dbFaculty[0]>();
  for (const f of dbFaculty) {
    if (f.user?.fullName) {
      facultyByName.set(f.user.fullName.trim().toLowerCase(), f);
    }
    if (f.shortName) {
      facultyByName.set(f.shortName.trim().toLowerCase(), f);
    }
  }

  // Load all sections
  const sections = await prisma.section.findMany({
    include: {
      program: true,
      academicYear: true,
    },
  });

  const sectionByKey = new Map<string, typeof sections[0]>();
  for (const s of sections) {
    const key = `${s.program.code} - ${s.name}`;
    sectionByKey.set(key, s);
  }

  // Load all subjects
  const subjects = await prisma.subject.findMany();
  const subjectByCode = new Map<string, typeof subjects[0]>();
  for (const sub of subjects) {
    subjectByCode.set(sub.code, sub);
  }

  // Get current academic year
  const currentAcademicYear =
    (await prisma.academicYear.findFirst({ where: { isCurrent: true } })) ||
    (await prisma.academicYear.findFirst({ orderBy: { startDate: "desc" } }));

  if (!currentAcademicYear) {
    throw new Error("No academic year found in database");
  }

  const mappingRecords: SubjectFacultyMapEntry[] = [];
  let assignmentsCreated = 0;
  let assignmentsExisting = 0;

  for (const row of sheet2) {
    const branch = (row.Branch || "").trim();
    const subShort = (row.sub_short || "").trim().toUpperCase();
    const rawFac = row.Faculty_Name || "";
    const facNames = [
      ...new Set(
        rawFac
          .split(/[\r\n]+/)
          .map((s: string) => s.trim())
          .filter(Boolean)
      ),
    ];

    if (!branch || !subShort || facNames.length === 0) continue;

    const sectionKeys = BRANCH_TO_SECTION_KEYS[branch];
    if (!sectionKeys) {
      console.warn(`No section mapping found for branch: ${branch}`);
      continue;
    }

    const subCode = SUB_SHORT_TO_CODE[subShort];
    if (!subCode) {
      // Could be tutorial row or non-curriculum row
      continue;
    }

    const subject = subjectByCode.get(subCode);
    if (!subject) {
      console.warn(`Subject not found for code: ${subCode} (${subShort})`);
      continue;
    }

    for (const secKey of sectionKeys) {
      const section = sectionByKey.get(secKey);
      if (!section) {
        console.warn(`Section not found for key: ${secKey}`);
        continue;
      }

      mappingRecords.push({
        branch,
        sectionKey: secKey,
        subjectCode: subject.code,
        subjectShortName: subject.shortName,
        subjectName: subject.name,
        facultyNames: facNames,
      });

      // Find or create SubjectOffering for section's program and subject
      let offering = await prisma.subjectOffering.findFirst({
        where: {
          academicYearId: currentAcademicYear.id,
          programId: section.programId,
          subjectId: subject.id,
          year: section.year,
          semester: section.semester,
        },
      });

      if (!offering) {
        offering = await prisma.subjectOffering.create({
          data: {
            academicYearId: currentAcademicYear.id,
            programId: section.programId,
            subjectId: subject.id,
            year: section.year,
            semester: section.semester,
            isElective: false,
            isActive: true,
          },
        });
      }

      // Map all faculty
      for (let i = 0; i < facNames.length; i++) {
        const facName = facNames[i];
        const fac = facultyByName.get(facName.toLowerCase());
        if (!fac) {
          console.warn(`Faculty not found in DB: ${facName}`);
          continue;
        }

        const isPrimary = i === 0;

        const existingAssignment =
          await prisma.facultySubjectAssignment.findFirst({
            where: {
              academicYearId: currentAcademicYear.id,
              facultyId: fac.id,
              subjectOfferingId: offering.id,
              sectionId: section.id,
            },
          });

        if (existingAssignment) {
          assignmentsExisting++;
          // Ensure isPrimary is set properly
          if (existingAssignment.isPrimary !== isPrimary) {
            await prisma.facultySubjectAssignment.update({
              where: { id: existingAssignment.id },
              data: { isPrimary },
            });
          }
        } else {
          await prisma.facultySubjectAssignment.create({
            data: {
              academicYearId: currentAcademicYear.id,
              facultyId: fac.id,
              subjectOfferingId: offering.id,
              sectionId: section.id,
              isPrimary,
              isActive: true,
            },
          });
          assignmentsCreated++;
        }
      }
    }
  }

  console.log(
    `Completed faculty mapping: ${mappingRecords.length} records processed. ` +
      `Assignments created: ${assignmentsCreated}, existing/updated: ${assignmentsExisting}.`
  );

  return mappingRecords;
}

if (require.main === module) {
  mapBook3Faculty()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
