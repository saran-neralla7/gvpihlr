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
- [x] Student Dedicated Profile & Dossier (`/admin/students/[id]`)
- [x] Future Module 2: Internal Marks
- [x] Future Module 3: Examinations & Hall Tickets
- [x] Future Module 4: Faculty Feedback & Appraisals

---

## 4. Mandatory Mobile Responsiveness & PWA Directive

> **CORE ARCHITECTURAL REQUIREMENT:**  
> **Every single feature, page, modal, and table built in this system MUST be strictly mobile-responsive.**  
> The system is architected to transition into a standalone **Progressive Web App (PWA)** for faculty, mentors, students, and office staff in production.

### Mobile & PWA Specifications:
1. **Touch Targets:** All interactive controls (buttons, quick presets, tab selectors, dropdown triggers) must have a minimum touch target of `44x44px` with comfortable padding.
2. **Table Containment:** All complex registers (Subject-Wise, Daily Matrix, Monthly Attendance) must use contained horizontal scroll wrappers (`overflow-x-auto`) with freeze columns (`sticky left-0`) so headers and roll numbers stay fixed while users swipe horizontally on mobile.
3. **Responsive Drawers & Modals:** Desktop dialogs should seamlessly transform into bottom sheet drawers or scrollable viewports on screens $< 640\text{px}$.
4. **Mobile Telephony Integration:** Student and parent phone numbers must be paired with direct `tel:<number>` dialer buttons that launch the phone's native dialpad instantly with one tap.
5. **PWA Offline & Hardware Caching:** Layouts and forms must support touch gestures, portrait and landscape orientations, viewport safe-area padding (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`), and offline local cache sync.
