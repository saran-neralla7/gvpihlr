import fs from "fs";
import path from "path";

export interface SaveMaterialOptions {
  subjectCode: string;
  unitNumber: number;
  originalFileName: string;
  buffer: Buffer;
}

export interface SaveMaterialResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

/**
 * Saves a course material file to the local persistent directory (Option A).
 * Path: public/uploads/materials/[subjectCode]/unit-[unitNumber]/[filename]
 * URL:  /uploads/materials/[subjectCode]/unit-[unitNumber]/[filename]
 */
export async function saveCourseMaterialFile(
  options: SaveMaterialOptions
): Promise<SaveMaterialResult> {
  const { subjectCode, unitNumber, originalFileName, buffer } = options;

  // Sanitize subject code and filename
  const cleanCode = subjectCode.replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanUnit = `unit-${unitNumber}`;
  const ext = path.extname(originalFileName) || ".pdf";
  const baseName = path.basename(originalFileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  
  // Unique timestamp suffix to prevent overwriting identical file names
  const uniqueFileName = `${baseName}_${Date.now()}${ext}`;

  // Target directory inside public/
  const targetDir = path.join(process.cwd(), "public", "uploads", "materials", cleanCode, cleanUnit);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, uniqueFileName);
  await fs.promises.writeFile(filePath, buffer);

  const fileUrl = `/uploads/materials/${cleanCode}/${cleanUnit}/${uniqueFileName}`;

  return {
    fileUrl,
    fileName: originalFileName,
    fileSize: buffer.length,
  };
}

/**
 * Safely removes a file from disk if it exists
 */
export async function deleteCourseMaterialFile(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl.startsWith("/uploads/materials/")) {
      return false;
    }
    const relativePath = fileUrl.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), "public", relativePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
  } catch (err) {
    console.error("Error deleting material file:", err);
  }
  return false;
}
