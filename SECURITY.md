# GVPIHLR ERP — Security Architecture & Hardening Model

**Target Institution:** Gayatri Vidya Parishad Institute of Higher Learning and Research (GVPIHLR)  
**Security Standard:** Enterprise Institutional Grade (OWASP ASVS Level 2 Compliant)  

---

## 1. Authentication & Session Defense

### 1.1 Password Hashing & Account Lockout
- **Algorithm:** bcrypt with 12 salt rounds (Argon2id compatible migration bridge).
- **Lockout Mechanism:** 5 consecutive failed login attempts trigger an automatic 15-minute account freeze.
- **Enumeration Defense:** Generic failure responses (`"Invalid username or password"`) prevent user enumeration attacks.

### 1.2 Session Protection
- Sessions are signed using **HMAC-SHA256** with timing-safe comparison to prevent timing attacks.
- Tokens are delivered exclusively through **HTTP-Only, Secure, SameSite=Lax** cookies (`gvpihlr_session`).
- Tokens cannot be read by clientside JavaScript, protecting against XSS session hijacking.
- Expiration is enforced server-side (12-hour session lifetime).

---

## 2. Authorization & Scoping (Anti-IDOR / Anti-BOLA)

### 2.1 Server-Side Context Derivation
The server **never trusts** client-supplied claims for:
`role`, `userId`, `schoolId`, `departmentId`, `programId`, `sectionId`, or `facultyId`.
All authorization is derived from the authenticated session cookie and validated through server-side database relations.

### 2.2 Resource-Level Authorization Rules
- **Faculty:** May only mark or view attendance for sections explicitly assigned to them in `FacultySubjectAssignment` for the current academic year.
- **HOD:** Restricted to their authorized department and its associated curriculum offerings.
- **Dean:** Restricted to their governed School.
- **Student / Parent:** Strictly scoped to their own enrollment ID. Calling `/api/reports/section` requires appropriate authority; direct student endpoint `/student` filters strictly by session `studentId`.
- **Super Admin:** Holds global authority, with every administrative mutation logged to `AuditLog`.

---

## 3. Database Integrity & Injection Defenses

### 3.1 Parameterized Queries via Prisma
Zero dynamic raw SQL concatenation is permitted. All queries utilize Prisma ORM with parameterized arguments.

### 3.2 Composite Unique Invariants
Database engine constraints prevent invalid states:
- `Section`: `@@unique([academicYearId, programId, year, semester, name])`
- `FacultySubjectAssignment`: `@@unique([academicYearId, facultyId, subjectOfferingId, sectionId])`
- `AttendanceSession`: `AttendanceSession_regular_unique` on `(academicYearId, sectionId, assignmentId, sessionDate, periodNumber)` where `labBatchId IS NULL`.

---

## 4. Tamper-Resistant Audit Logging

The `AuditLog` and `AttendanceAuditLog` tables record:
- Actor ID, Username, and Role
- Action type (e.g., `LOGIN`, `FAILED_LOGIN`, `ATTENDANCE_SESSION_SUBMIT`, `ATTENDANCE_RECORD_UPDATE`, `DELETE_SECTION`)
- Resource name and ID
- IP address and User Agent
- Masked payload: Automatically redacts keys containing `password`, `secret`, `token`, `cookie`, `auth`.

---

## 5. Security HTTP Headers

Configured in `next.config.mjs`:
- `X-Frame-Options: DENY` (Clickjacking mitigation)
- `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Powered-By`: Disabled to obscure server framework identity.
