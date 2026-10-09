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

### Database Restoration & Seeding
To populate a fresh database instance with the exact current institutional dataset:
```bash
# Option 1: Using Prisma Seed
npm run db:seed

# Option 2: Using SQL Dump
psql -d gvpihlr_erp -f prisma/current_data.sql
```

*All schools, programs, regulations, and faculty can be managed in real-time by the Super Admin at `/admin/master`.*
