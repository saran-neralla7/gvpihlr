import book3Data from "./book3FacultyData.json";

export interface Book3SubjectFaculty {
  branch: string;
  subjectShortName: string;
  subjectName: string;
  facultyNames: string[];
}

const facultyMap: Record<string, string[]> = book3Data as Record<string, string[]>;

const BRANCH_KEY_TO_BRANCH: Record<string, string> = {
  "BTECH-CHEMICAL-ENG - 1": "CHEMICAL",
  "BTECH-CIVIL-ENG - 1": "CIVIL",
  "BTECH-CS-AND-ENG - 1": "CSE-1",
  "BTECH-CS-AND-ENG - 2": "CSE-2",
  "BTECH-CS-AND-ENG-AI-AND-ML - 1": "CSE(AI&ML)-1",
  "BTECH-CS-AND-ENG-AI-AND-ML - 2": "CSE(AI&ML)-2",
  "BTECH-CS-AND-ENG-CYBERSECURITY - 1": "CSE (CS & DS)",
  "BTECH-CS-AND-ENG-DATA-SCIENCE - 1": "CSE (CS & DS)",
  "BTECH-ELECTRICAL-AND-ELECTRONICS-ENG - 1": "EEE",
  "BTECH-ELECTRONICS-AND-COMMUNICATION-ENG - 1": "ECE-1",
  "BTECH-ELECTRONICS-AND-COMMUNICATION-ENG - 2": "ECE-2",
  "BTECH-ELECTRONICS-ENG-VLSI-DESIGN-AND-TECHNOLOGY - 1": "ECE-3",
  "BTECH-MECHANICAL-ENG - 1": "MECH",
  "BTECH-MECHANICAL-ENG-ROBOTICS-AND-AI - 1": "MECH-ROBOTICS",
};

/**
 * Resolves faculty names for a section and subject using Book3.xlsx master mapping.
 */
export function resolveFacultyNames(
  programCode: string,
  sectionName: string,
  subjectShortName: string,
  subjectName?: string
): string[] {
  const secKey = `${programCode.trim()} - ${sectionName.trim()}`;
  let branch = BRANCH_KEY_TO_BRANCH[secKey];
  if (!branch) {
    // Fallback branch inference
    if (programCode.includes("VLSI")) branch = "ECE-3";
    else if (programCode.includes("ROBOTICS")) branch = "MECH-ROBOTICS";
    else if (programCode.includes("CYBER") || programCode.includes("DATA")) branch = "CSE (CS & DS)";
    else if (programCode.includes("AI-AND-ML")) branch = sectionName === "2" ? "CSE(AI&ML)-2" : "CSE(AI&ML)-1";
    else if (programCode.includes("CS-AND-ENG")) branch = sectionName === "2" ? "CSE-2" : "CSE-1";
    else if (programCode.includes("ELECTRONICS")) branch = sectionName === "2" ? "ECE-2" : "ECE-1";
    else if (programCode.includes("MECHANICAL")) branch = "MECH";
    else if (programCode.includes("ELECTRICAL")) branch = "EEE";
    else if (programCode.includes("CIVIL")) branch = "CIVIL";
    else if (programCode.includes("CHEMICAL")) branch = "CHEMICAL";
    else branch = programCode;
  }

  const sUpper = subjectShortName.trim().toUpperCase();
  const candidates = [sUpper];

  if (sUpper === "PSUC") candidates.push("PPSTC");
  if (sUpper === "PSUC LAB") candidates.push("PPSTC LAB");
  if (sUpper === "ESS. ENG.") candidates.push("ESS. ENG. TUT", "ESS. ENG. LAB");
  if (sUpper === "ENGG. CHEM LAB") candidates.push("CHEM LAB");
  if (sUpper === "CHEM LAB") candidates.push("ENGG. CHEM LAB");
  if (sUpper === "FDS / CSP") candidates.push("FDS");
  if (sUpper === "FDS / CSP LAB") candidates.push("FDS LAB");

  for (const c of candidates) {
    const key = `${branch}::${c}`;
    const result = facultyMap[key];
    if (result && result.length > 0) {
      return result;
    }
  }

  return [];
}

/**
 * Returns formatted comma-separated faculty names string.
 */
export function resolveFacultyNameString(
  programCode: string,
  sectionName: string,
  subjectShortName: string,
  subjectName?: string
): string {
  const facs = resolveFacultyNames(programCode, sectionName, subjectShortName, subjectName);
  return facs.length > 0 ? facs.join(", ") : "—";
}
