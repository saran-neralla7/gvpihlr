import { z } from "zod";
import { RoleType, SubjectType, SessionType, AttendanceStatus, StudentStatus } from "@prisma/client";

// =========================================================================
// AUTHENTICATION VALIDATIONS
// =========================================================================

export const LoginSchema = z.object({
  username: z.string().min(2, "Username or Roll Number is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  loginType: z.enum(["FACULTY", "STUDENT"]).default("FACULTY"),
});

// =========================================================================
// MASTER DATA SCHEMAS
// =========================================================================

export const AcademicYearSchema = z.object({
  code: z.string().min(4, "Academic year code is required (e.g. 2026-27)"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isCurrent: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const SchoolSchema = z.object({
  code: z.string().min(2, "School code is required (e.g. SCSE)"),
  name: z.string().min(3, "School name is required"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const DepartmentSchema = z.object({
  schoolId: z.string().min(1, "School ID is required"),
  code: z.string().min(2, "Department code is required (e.g. CSE)"),
  name: z.string().min(3, "Department name is required"),
  isTeachingOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const ProgramSchema = z.object({
  schoolId: z.string().min(1, "School ID is required"),
  code: z.string().min(2, "Program code is required (e.g. BTECH-CSE)"),
  name: z.string().min(3, "Program name is required"),
  degreeType: z.string().default("UG"),
  durationYears: z.number().int().min(1).max(6).default(4),
  totalSemesters: z.number().int().min(1).max(12).default(8),
  isActive: z.boolean().default(true),
});

export const SectionSchema = z.object({
  academicYearId: z.string().min(1, "Academic Year is required"),
  programId: z.string().min(1, "Program is required"),
  year: z.number().int().min(1).max(6),
  semester: z.number().int().min(1).max(12),
  name: z.string().min(1, "Section code is required (e.g. A, B)"),
  displayName: z.string().optional(),
  capacity: z.number().int().min(1).default(60),
  isActive: z.boolean().default(true),
});

export const LabBatchSchema = z.object({
  sectionId: z.string().min(1, "Section ID is required"),
  batchNumber: z.number().int().min(1),
  name: z.string().min(1, "Batch name is required (e.g. Batch 1)"),
  capacity: z.number().int().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const SubjectSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  code: z.string().min(2, "Subject code is required (e.g. 26MA101)"),
  name: z.string().min(3, "Subject name is required"),
  shortName: z.string().min(1, "Short name is required"),
  credits: z.number().min(0).max(10).default(3.0),
  type: z.nativeEnum(SubjectType).default(SubjectType.THEORY),
  isActive: z.boolean().default(true),
});

export const SubjectOfferingSchema = z.object({
  academicYearId: z.string().min(1, "Academic Year is required"),
  programId: z.string().min(1, "Program is required"),
  subjectId: z.string().min(1, "Subject is required"),
  year: z.number().int().min(1).max(6),
  semester: z.number().int().min(1).max(12),
  isElective: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const FacultySubjectAssignmentSchema = z.object({
  academicYearId: z.string().min(1, "Academic Year is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  subjectOfferingId: z.string().min(1, "Subject Offering is required"),
  sectionId: z.string().min(1, "Section is required"),
  isPrimary: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const FacultySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  shortName: z.string().min(1, "Short name is required (e.g. KR)"),
  departmentId: z.string().min(1, "Department is required"),
  employeeId: z.string().min(2, "Employee ID is required"),
  designation: z.string().default("Assistant Professor"),
  qualification: z.string().optional().nullable(),
  email: z.string().email("Valid email required").optional().nullable(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const StudentSchema = z.object({
  rollNumber: z.string().min(2, "Roll Number is required"),
  fullName: z.string().min(2, "Full Name is required"),
  academicYearId: z.string().min(1, "Academic Year is required"),
  programId: z.string().min(1, "Program is required"),
  year: z.number().int().min(1).max(6),
  semester: z.number().int().min(1).max(12),
  sectionId: z.string().min(1, "Section is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  labBatchId: z.string().optional().nullable(),
});

// =========================================================================
// ATTENDANCE SUBMISSION SCHEMAS
// =========================================================================

export const AttendanceRecordInputSchema = z.object({
  studentId: z.string().min(1),
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().optional().nullable(),
});

export const AttendanceSubmissionSchema = z.object({
  academicYearId: z.string().min(1),
  assignmentId: z.string().min(1),
  sectionId: z.string().min(1),
  facultyId: z.string().min(1),
  labBatchId: z.string().optional().nullable(),
  sessionDate: z.string().min(10), // "YYYY-MM-DD"
  periodNumber: z.number().int().min(1).max(10).default(1),
  sessionType: z.nativeEnum(SessionType).default(SessionType.REGULAR),
  topicCovered: z.string().optional().nullable(),
  records: z.array(AttendanceRecordInputSchema).min(1, "At least one student record is required"),
});

export const UpdateAttendanceRecordSchema = z.object({
  recordId: z.string().min(1),
  newStatus: z.nativeEnum(AttendanceStatus),
  reason: z.string().min(3, "Reason for modification is required for audit trail"),
});
