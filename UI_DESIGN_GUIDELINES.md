# GVPIHLR ERP — Institutional UI/UX Design System Guidelines

**Standard Authority:** Gayatri Vidya Parishad Institute of Higher Learning and Research (GVPIHLR)  
**Mandate Scope:** Universal — Applies to Attendance, Academics, Examination, Admissions, and all future ERP Modules.  

---

## 1. Zero Native Browser Controls Policy

To maintain enterprise institutional dignity and brand consistency across macOS, Windows, iOS, and Android:

> **STRICT BAN ON NATIVE BROWSER CONTROLS:**
> 1. **No Browser Popups:** Never use native JavaScript `alert()`, `confirm()`, or `prompt()`. All notifications, warnings, destructive confirmations, and review screens must use custom **GVPIHLR Modal Dialogs**.
> 2. **No Native Date Pickers:** Never use raw `<input type="date">`. All dates must be selected through our **`CustomDatePicker`** component featuring the official GVPIHLR calendar palette, month navigation, and presets.
> 3. **No Native Dropdowns:** Never use raw unstyled `<select>` elements that summon OS-level select sheets. All dropdowns must use **`CustomSelect`** with bespoke triggers, animated chevron icons, hover states, and option checkmarks.

---

## 2. Reusable Component Suite (`src/components/ui/`)

- **`CustomModal`**: Elegant modal dialogue with backdrop blur, custom icons, confirmation & cancellation triggers.
- **`CustomDatePicker`**: Interactive calendar with Month/Year switching, day grids, today indicator, and quick "Today" shortcut.
- **`CustomSelect`**: Searchable/styled dropdown with chevron transitions, item checkmarks, and outside-click dismissal.

---

## 3. Enforcement Checklist for Every Module

- [x] Attendance Marking Interface (`/attendance/mark/[assignmentId]`)
- [x] Attendance Reports & Analytics (`/reports`)
- [x] Super Admin Master Data Control Center (`/admin/master`)
- [x] Future Module 2: Internal Marks
- [x] Future Module 3: Examinations & Hall Tickets
- [x] Future Module 4: Faculty Feedback & Appraisals
