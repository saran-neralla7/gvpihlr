# GVPIHLR ERP — Database Architecture & Relational Design

**Database Engine:** PostgreSQL 16  
**ORM / Schema Definition:** Prisma ORM 5  
**Core Integrity Goal:** Multi-School, Multi-Program, Multi-Section, and Temporal Isolation  

---

## 1. Schema Invariant Dictionary

```
AcademicYear (code: unique, e.g. "2026-27")
  ├── School (code: unique, e.g. "SCSE", "SENG", "SSCI")
  │     ├── Department (code: unique, e.g. "CSE", "MATH", "PHY")
  │     └── Program (code: unique, e.g. "BTECH-CSE", "BTECH-MECH")
  │           └── Section (composite unique: [academicYearId, programId, year, semester, name])
  │                 ├── LabBatch (composite unique: [sectionId, batchNumber])
  │                 └── StudentEnrollment (composite unique: [studentId, academicYearId, semester])
  │
  ├── Subject (code: unique, e.g. "26MA101")
  │     └── SubjectOffering (composite unique: [academicYearId, programId, subjectId, year, semester])
  │           └── FacultySubjectAssignment (composite unique: [academicYearId, facultyId, subjectOfferingId, sectionId])
  │                 └── AttendanceSession (composite unique: [academicYearId, sectionId, assignmentId, sessionDate, periodNumber, labBatchId])
  │                       ├── AttendanceRecord (composite unique: [sessionId, studentId])
  │                       └── AttendanceAuditLog (immutable audit records)
```

---

## 2. Table Specifications & Indexes

| Table | Primary Key | Critical Foreign Keys | Unique Invariants / Indexes |
| :--- | :--- | :--- | :--- |
| `AcademicYear` | `id` (cuid) | None | `code` (unique), `isCurrent` (index) |
| `School` | `id` (cuid) | None | `code` (unique) |
| `Department` | `id` (cuid) | `schoolId -> School.id` | `code` (unique), `schoolId` (index) |
| `Program` | `id` (cuid) | `schoolId -> School.id` | `code` (unique), `schoolId` (index) |
| `Section` | `id` (cuid) | `academicYearId`, `programId` | `[academicYearId, programId, year, semester, name]` (unique) |
| `LabBatch` | `id` (cuid) | `sectionId -> Section.id` | `[sectionId, batchNumber]` (unique) |
| `Faculty` | `id` (cuid) | `userId`, `departmentId` | `employeeId` (unique), `shortName` (index) |
| `Student` | `id` (cuid) | `userId` | `rollNumber` (unique), `status` (index) |
| `StudentEnrollment`| `id` (cuid) | `studentId`, `academicYearId`, `sectionId`, `programId` | `[studentId, academicYearId, semester]` (unique) |
| `Subject` | `id` (cuid) | `departmentId -> Department.id` | `code` (unique), `departmentId` (index) |
| `SubjectOffering` | `id` (cuid) | `academicYearId`, `programId`, `subjectId` | `[academicYearId, programId, subjectId, year, semester]` (unique) |
| `FacultySubjectAssignment` | `id` (cuid) | `academicYearId`, `facultyId`, `subjectOfferingId`, `sectionId` | `[academicYearId, facultyId, subjectOfferingId, sectionId]` (unique) |
| `AttendanceSession` | `id` (cuid) | `academicYearId`, `assignmentId`, `sectionId`, `facultyId`, `recordedById` | Partial unique index for regular sessions; `[academicYearId, sectionId, sessionDate]` (index) |
| `AttendanceRecord` | `id` (cuid) | `sessionId`, `studentId` | `[sessionId, studentId]` (unique), `[studentId, status]` (index) |
| `AttendanceAuditLog` | `id` (cuid) | `sessionId`, `studentId`, `changedById` | `[sessionId]`, `[studentId]`, `[changedById]` (indexes) |
| `AuditLog` | `id` (cuid) | `userId` | `[userId]`, `[action]`, `[resource, resourceId]`, `[timestamp]` |

---

## 3. Referential Protection & Archival Policy

To satisfy historical audit compliance:
1. **Never cascade-delete attendance records** through parent administrative entities.
2. If an entity (School, Department, Program, Section, Faculty, or Student) has recorded attendance sessions, hard deletion is blocked by our `deleteMasterRecord` engine with the message:
   `"This record is already referenced by historical academic data and cannot be permanently deleted. You can deactivate it."`
3. Super Admin can toggle `isActive: false` at any time to archive entities from active dropdowns and marking views without corrupting past reports.
