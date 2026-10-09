# GVPIHLR ERP — University-Wide Enterprise Resource Planning Platform

**Institution:** Gayatri Vidya Parishad Institute of Higher Learning and Research (GVPIHLR)  
**Status:** Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956  
**Location:** Kommadi, Madhurawada, Visakhapatnam – 530 048, Andhra Pradesh  
**Foundational Milestone:** Module 1: Production Attendance Platform  

---

## 1. Architectural Overview

GVPIHLR has transitioned from an autonomous affiliated college structure (`GVPCDPGC`, affiliated to Andhra University) to a comprehensive Deemed University. This ERP platform replaces legacy flat systems with a relational hierarchy supporting multiple schools, departments, degree programs, academic sessions, and laboratory batches.

```
University (GVPIHLR)
  ↓
Academic Year (e.g., 2026-27)
  ↓
School (e.g., School of CSE, School of Core Engineering, School of Sciences)
  ↓
Department (Teaching/Service units like Mathematics, Physics, Chemistry, CSE)
  ↓
Program (B.Tech CSE, B.Tech MECH)
  ↓
Year (1, 2, 3, 4)
  ↓
Semester (1 to 8)
  ↓
Section (Scoped entity: CSE-A, CSE-B, MECH-A)
  ↓
Lab Batch (Configurable N Batches: Batch 1, Batch 2, Batch 3)
```

---

## 2. Institutional UI/UX Design System Standards

As codified in `UI_DESIGN_GUIDELINES.md`:
- **Zero Native Browser Popups:** All confirmations and notifications utilize custom `CustomModal` dialogs with backdrop blur and branded typography.
- **Zero Native Browser Date Pickers:** All date inputs use `CustomDatePicker` with calendar grids and quick shortcuts.
- **Zero Native Browser Dropdowns:** All selects use `CustomSelect` with chevron transitions, searchable options, and item checkmarks.
- **Pure Light Theme:** Official GVPIHLR palette: Navy Primary (`#0B2545`), Burgundy Maroon (`#8B1528`), and Slate neutrals.
- **Dual-Card Login Portal:** Visual match with the official GVP portal layout (`Faculty Login` & `Student Login`).

---

## 3. Technology Stack

- **Framework:** Next.js 14 App Router
- **Language:** TypeScript (Strict Mode)
- **Database & ORM:** PostgreSQL 16 + Prisma ORM 5
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **Document Generation:** jsPDF, jspdf-autotable, SheetJS (`xlsx`)
- **Authentication:** HMAC-SHA256 HTTP-only cookies, Argon2id & bcrypt compatibility

---

## 4. Quick Start & Setup

### Prerequisites
- Node.js >= 18.18.0 (Tested on Node.js v22.20)
- PostgreSQL 15+ running locally or remotely

### Installation
```bash
# Clone the repository
cd gvpihlr-cms

# Install dependencies
npm install

# Configure Environment Variables
cp .env.example .env

# Synchronize Database Schema
npx prisma db push

# Seed GVPIHLR Master Academic Structure
npx tsx prisma/seed.ts

# Run the Verification Test Suite
npx tsx scripts/verify-system.ts

# Launch Development Server
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## 5. System Access Credentials

| Role / Profile | Username / Identifier | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin` | `Admin@1234` | Full University Control, Master Data Hub, Audit Logs |
| **Faculty Accounts (78 total)** | **Short Name** (e.g. `KR`, `BHP`, `SP`, `DC`, `BSK`, etc.) | `gvp@2026` | Academic Attendance Portal, Subject Classes, Profile |

### Complete Database Restoration (PostgreSQL Dump)
The repository includes a comprehensive, production-ready PostgreSQL dump: **`gvpihlr_database_backup.sql`** (13.0 MB).
This contains all university master data, 1,161 enrolled students across 14 sections, 78 faculty members, and 1,008 conducted sessions with 83,880 attendance marks (including MRB - Robotics & AI and MECH):

```bash
# Restore full PostgreSQL database from backup
psql -h 127.0.0.1 -p 5432 -U postgres -d gvpihlr_erp -f gvpihlr_database_backup.sql
```

---

## 6. Attendance Governance & Reporting Module

The `/reports` module provides dual operating registers with official university headers:

1. **📊 Consolidated Attendance Report:**
   - Institutional student roster summary table (`S.No`, `Roll No`, `Student Name`, `Contact`, `Conducted`, `Attended`, `Absent`, `Percentage %`, `Eligibility Status`).
   - 4 Live KPI metric cards (Total Conducted, Enrolled, Defaulters `< 75%`, Section Average).
   - Instant Search & Defaulter Filters.
   - Portrait **Download PDF** with official GVPIHLR letterhead and **Export Excel** (`.xlsx`).

2. **📑 Daily Matrix Register:**
   - 3-tier column headers: Date (`22/09`, `23/09`...), Period Timing (`09:00-10:00`, `10:00-11:00`...), and Subject Short Code `(CAL & LA)`.
   - Per-period `P` (Present) and `A` (Absent) cells with summary totals (`Total`, `P`, `A`, `Percentage`).
   - Custom Date Range pickers and Quick Date Presets (`22 Sep - 07 Oct`, `Oct 01 - Oct 07`).
   - Multi-part Landscape **Download PDF**, **Print Register** (clean browser print), and **Export Excel**.

*All schools, programs, regulations, and faculty can be managed in real-time by the Super Admin at `/admin/master`.*
