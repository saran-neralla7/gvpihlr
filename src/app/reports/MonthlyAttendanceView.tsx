"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  FileSpreadsheet,
  Printer,
  FileText,
  LayoutGrid,
  Users,
  Percent,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface SessionItem {
  id: string;
  sessionDate: string; // YYYY-MM-DD
  formattedDate: string;
  periodNumber: number;
  periodTiming: string;
  subjectName: string;
  subjectCode: string;
  subjectShortName: string;
  cleanShortName?: string;
  subjectId?: string;
}

interface StudentReportItem {
  studentId: string;
  rollNumber: string;
  fullName: string;
  phone?: string | null;
  attendanceMap?: Record<string, "P" | "A" | "-">;
}

interface MonthlyAttendanceViewProps {
  students: StudentReportItem[];
  sessions: SessionItem[];
  sectionName: string;
  programName: string;
  year?: number;
  semester?: number;
}

export default function MonthlyAttendanceView({
  students,
  sessions,
  sectionName,
  programName,
  year = 1,
  semester = 1,
}: MonthlyAttendanceViewProps) {
  // Sub-view: "summary" (Consolidated) | "subject_wise" (Subject-Wise Consolidated)
  const [viewMode, setViewMode] = useState<"summary" | "subject_wise">("summary");

  // Derive all distinct months from recorded sessions
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, { key: string; label: string; count: number }>();

    sessions.forEach((sess) => {
      if (!sess.sessionDate) return;
      const key = sess.sessionDate.slice(0, 7); // "YYYY-MM"
      if (!monthMap.has(key)) {
        // Parse year and month
        const parts = key.split("-");
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = new Date(y, m, 1);
        const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        monthMap.set(key, { key, label, count: 0 });
      }
      monthMap.get(key)!.count += 1;
    });

    // Sort descending (latest month first)
    return Array.from(monthMap.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [sessions]);

  // Selected Month key (e.g. "2026-10")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return availableMonths[0]?.key || "2026-10";
  });

  // Keep selectedMonth valid if availableMonths change
  const activeMonthKey = useMemo(() => {
    if (availableMonths.length === 0) return selectedMonth;
    if (availableMonths.some((m) => m.key === selectedMonth)) return selectedMonth;
    return availableMonths[0].key;
  }, [availableMonths, selectedMonth]);

  const activeMonthObj = availableMonths.find((m) => m.key === activeMonthKey);
  const activeMonthLabel = activeMonthObj ? activeMonthObj.label : activeMonthKey;

  // Filter sessions and compute student attendance strictly for activeMonthKey
  const { monthSessions, totalMonthHeld, monthSubjectColumns, monthlyStudents } = useMemo(() => {
    const mSessions = sessions.filter((s) => s.sessionDate.startsWith(activeMonthKey));
    const totalHeld = mSessions.length;

    // Build subject columns conducted strictly during this month
    const subColMap = new Map<
      string,
      { id: string; name: string; code: string; shortName: string; conducted: number }
    >();

    mSessions.forEach((s) => {
      const subKey = s.subjectId || s.subjectCode;
      if (subKey) {
        if (!subColMap.has(subKey)) {
          subColMap.set(subKey, {
            id: subKey,
            name: s.subjectName,
            code: s.subjectCode,
            shortName: s.cleanShortName || s.subjectShortName.replace(/[()]/g, ""),
            conducted: 0,
          });
        }
        subColMap.get(subKey)!.conducted += 1;
      }
    });

    const mSubColumns = Array.from(subColMap.values()).sort((a, b) => b.conducted - a.conducted);

    // Compute student stats for this month
    const mStudents = students.map((st) => {
      const attMap = st.attendanceMap || {};
      let attended = 0;
      const subAttMap: Record<string, number> = {};

      mSubColumns.forEach((col) => {
        subAttMap[col.id] = 0;
      });

      mSessions.forEach((sess) => {
        const val = attMap[sess.id];
        if (val === "P") {
          attended += 1;
          const subKey = sess.subjectId || sess.subjectCode;
          if (subKey && subAttMap[subKey] !== undefined) {
            subAttMap[subKey] += 1;
          }
        }
      });

      const absent = totalHeld - attended;
      const pct = totalHeld > 0 ? parseFloat(((attended / totalHeld) * 100).toFixed(1)) : null;
      const isDefaulter = totalHeld > 0 && pct !== null && pct < 75.0;

      return {
        studentId: st.studentId,
        rollNumber: st.rollNumber,
        fullName: st.fullName,
        phone: st.phone,
        attended,
        absent,
        percentage: pct,
        isDefaulter,
        subjectAttendance: subAttMap,
      };
    });

    return {
      monthSessions: mSessions,
      totalMonthHeld: totalHeld,
      monthSubjectColumns: mSubColumns,
      monthlyStudents: mStudents,
    };
  }, [sessions, activeMonthKey, students]);

  // Defaulters in this month
  const monthDefaultersCount = useMemo(() => {
    return monthlyStudents.filter((s) => s.isDefaulter).length;
  }, [monthlyStudents]);

  // Average attendance rate in this month
  const monthAverageRate = useMemo(() => {
    const validPcts = monthlyStudents
      .map((s) => s.percentage)
      .filter((p): p is number => p !== null);
    if (validPcts.length === 0) return "—";
    const sum = validPcts.reduce((a, b) => a + b, 0);
    return (sum / validPcts.length).toFixed(1) + "%";
  }, [monthlyStudents]);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV handler
  const handleExportCSV = () => {
    if (viewMode === "summary") {
      const headers = [
        "S.No",
        "Roll Number",
        "Student Name",
        `Classes Held (${totalMonthHeld})`,
        "Classes Attended",
        "Classes Absent",
        "Attendance %",
        "Compliance Status",
      ];
      const rows = monthlyStudents.map((s, idx) => [
        idx + 1,
        `"${s.rollNumber}"`,
        `"${s.fullName}"`,
        totalMonthHeld,
        s.attended,
        s.absent,
        s.percentage !== null ? `"${s.percentage}%"` : `"N/A"`,
        s.isDefaulter ? `"DEFAULTER (<75%)"` : `"ELIGIBLE"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `GVPIHLR_Monthly_Consolidated_${sectionName}_${activeMonthKey}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        "S.No",
        "Roll Number",
        "Student Name",
        ...monthSubjectColumns.map((c) => `"${c.shortName || c.code} (${c.conducted} Held)"`),
        `Total Classes Held (${totalMonthHeld})`,
        "Total Attended",
        "Attendance %",
        "Status",
      ];
      const rows = monthlyStudents.map((s, idx) => [
        idx + 1,
        `"${s.rollNumber}"`,
        `"${s.fullName}"`,
        ...monthSubjectColumns.map((c) => s.subjectAttendance[c.id] ?? 0),
        totalMonthHeld,
        s.attended,
        s.percentage !== null ? `"${s.percentage}%"` : `"N/A"`,
        s.isDefaulter ? `"DEFAULTER"` : `"ELIGIBLE"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `GVPIHLR_Monthly_Subject_Wise_${sectionName}_${activeMonthKey}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Month & Sub-Mode Navigation Toolbar (Hidden in Print) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        {/* Month Selector Pills / Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Select Calendar Month:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {availableMonths.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMonth(m.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeMonthKey === m.key
                    ? "bg-[#0B2545] text-white shadow-xs font-black"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{m.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                    activeMonthKey === m.key
                      ? "bg-blue-800 text-blue-100"
                      : "bg-slate-200 text-slate-600 font-bold"
                  }`}
                >
                  {m.count} Sessions
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Mode Switcher: Consolidated Summary vs Subject-Wise Consolidated */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("summary")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === "summary"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Monthly Consolidated</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("subject_wise")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === "subject_wise"
                  ? "bg-white text-blue-900 shadow-xs border border-slate-200 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
              <span>Subject-Wise Consolidated</span>
            </button>
          </div>

          {/* Export & Print Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition shadow-xs"
              title="Download Monthly CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B2545] hover:bg-[#132E5C] text-white rounded-xl text-xs font-bold transition shadow-xs"
              title="Print Monthly Register"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly KPI Metrics (Hidden in Print) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Month Sessions Held
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {totalMonthHeld}
            <span className="text-xs font-semibold text-slate-400 ml-1.5">Sessions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{activeMonthLabel}</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {monthlyStudents.length}
            <span className="text-xs font-semibold text-slate-400 ml-1.5">Students</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Section {sectionName}</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Month Average Attendance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {monthAverageRate}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Section aggregate compliance</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Month Defaulters (&lt;75%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2 font-mono">
            {monthDefaultersCount}
            <span className="text-xs font-semibold text-slate-400 ml-1.5">Students</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Below statutory norm in {activeMonthLabel}</p>
        </div>
      </div>

      {/* Printable Monthly Document Card */}
      <div className="bg-white border border-slate-300/80 rounded-3xl p-5 sm:p-8 shadow-xs print-container space-y-5 max-w-full overflow-hidden">
        {/* Official Institutional Header with Logo in Same Row */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            <img
              src="/gvpihlr.png"
              alt="GVPIHLR University Crest"
              className="max-h-16 max-w-16 sm:max-h-20 sm:max-w-20 object-contain"
            />
          </div>

          <div className="text-center flex-1 space-y-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
              GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH
            </h1>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-600">
              (Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956) • Visakhapatnam
            </h2>
            <div className="inline-block mt-1 px-4 py-1 rounded-full bg-blue-50 border border-blue-200">
              <h3 className="text-xs sm:text-sm font-black text-blue-900 tracking-wide uppercase">
                {viewMode === "summary"
                  ? `Monthly Consolidated Attendance Register — ${activeMonthLabel}`
                  : `Monthly Subject-Wise Consolidated Register — ${activeMonthLabel}`}
              </h3>
            </div>
            <div className="text-[11px] text-slate-600 font-semibold space-y-0.5 pt-2">
              <div>
                Program: <strong>{programName}</strong> | Year: <strong>{year}</strong> | Semester:{" "}
                <strong>{semester}</strong> | Section: <strong>{sectionName}</strong>
              </div>
              <div>
                Selected Month: <strong>{activeMonthLabel}</strong> | Total Sessions Conducted:{" "}
                <strong>{totalMonthHeld}</strong>
              </div>
            </div>
          </div>

          <div className="w-16 sm:w-20 flex-shrink-0 hidden sm:block print:block" />
        </div>

        {/* =====================================================================
            SUB-VIEW 1: MONTHLY CONSOLIDATED SUMMARY (Held, Attended, Absent, %)
            ===================================================================== */}
        {viewMode === "summary" && (
          <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-300/90 shadow-2xs">
            <table className="w-full min-w-max border-collapse border-slate-300 text-[11px] print-table">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-300 print:bg-slate-100">
                  <th className="border border-slate-300 px-2 py-2 text-center font-bold text-slate-800 w-12 print:w-8 print:p-1 print:text-[10px]">
                    #
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 w-32 print:w-24 print:p-1 print:text-[10.5px]">
                    Roll Number
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 min-w-[200px] print:w-44 print:p-1 print:text-[10.5px]">
                    Student Name
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-700 bg-slate-100 w-24 print:w-16 print:p-1 print:text-[10.5px]">
                    Classes Held
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center font-bold text-emerald-900 bg-emerald-50/70 w-24 print:w-16 print:p-1 print:text-[10.5px] print:bg-slate-100">
                    Attended
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center font-bold text-rose-900 bg-rose-50/70 w-20 print:w-14 print:p-1 print:text-[10.5px] print:bg-slate-100">
                    Absent
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-900 bg-slate-100 w-24 print:w-16 print:p-1 print:text-[10.5px]">
                    Month %
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-800 bg-slate-100 w-28 print:w-20 print:p-1 print:text-[10px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlyStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium">
                      No records found for the selected month.
                    </td>
                  </tr>
                ) : (
                  monthlyStudents.map((st, idx) => (
                    <tr
                      key={st.studentId}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        st.isDefaulter ? "bg-rose-50/20" : ""
                      }`}
                    >
                      <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-500 font-mono text-[10px] print:p-1 print:text-[10px]">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold text-slate-900 print:p-1 print:text-[10.5px]">
                        <Link
                          href={`/admin/students/${st.studentId}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {st.rollNumber}
                        </Link>
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 print:p-1 print:text-[10.5px]">
                        <Link
                          href={`/admin/students/${st.studentId}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {st.fullName}
                        </Link>
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-bold text-slate-600 bg-slate-50/50 print:p-1 print:text-[10.5px]">
                        {totalMonthHeld}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-extrabold text-emerald-700 bg-emerald-50/30 print:p-1 print:text-[10.5px] print:text-black">
                        {st.attended}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-bold text-rose-600 bg-rose-50/30 print:p-1 print:text-[10.5px] print:text-black">
                        {st.absent}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-black print:p-1 print:text-[10.5px]">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs print:p-0 print:text-[10.5px] ${
                            st.isDefaulter
                              ? "bg-rose-100 text-rose-800 font-black print:text-rose-700"
                              : "text-emerald-700 font-bold print:text-emerald-800"
                          }`}
                        >
                          {st.percentage !== null ? `${st.percentage}%` : "—"}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center print:p-1 print:text-[10px]">
                        {st.isDefaulter ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 print:text-[10px]">
                            Defaulter
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 print:text-[10px]">
                            Eligible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* =====================================================================
            SUB-VIEW 2: MONTHLY SUBJECT-WISE CONSOLIDATED
            (Print shows ONLY: Subject Columns + Total Attended + Attendance %)
            ===================================================================== */}
        {viewMode === "subject_wise" && (
          <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-300/90 shadow-2xs">
            <table className="w-full min-w-max border-collapse border-slate-300 text-[11px] print-table">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-300 print:bg-slate-100">
                  {/* S.No */}
                  <th
                    rowSpan={2}
                    className="sticky left-0 bg-slate-100 z-20 border border-slate-300 px-2.5 py-2 text-center font-bold text-slate-800 w-12 print:static print:w-8 print:px-1 print:py-1 print:text-[10px]"
                  >
                    #
                  </th>

                  {/* Roll Number (Frozen Sticky) */}
                  <th
                    rowSpan={2}
                    className="sticky left-12 bg-slate-100 z-20 border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 w-32 shadow-[1px_0_0_0_#cbd5e1] print:static print:shadow-none print:w-24 print:px-1.5 print:py-1 print:text-[10.5px]"
                  >
                    Roll Number
                  </th>

                  {/* Student Name (Frozen Sticky) */}
                  <th
                    rowSpan={2}
                    className="sticky left-44 bg-slate-100 z-20 border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 min-w-[190px] shadow-[2px_0_4px_0_rgba(0,0,0,0.06)] print:static print:shadow-none print:min-w-0 print:w-36 print:px-1.5 print:py-1 print:text-[10.5px]"
                  >
                    Student Name
                  </th>

                  {/* Subject Columns Conducted in this Month */}
                  {monthSubjectColumns.map((col) => (
                    <th
                      key={col.id}
                      className="border border-slate-300 px-3 py-2 text-center bg-blue-50/50 min-w-[100px] print:min-w-0 print:px-1 print:py-1 print:bg-slate-50"
                    >
                      <div className="font-extrabold text-slate-900 tracking-tight text-xs print:text-[10px] print:leading-tight">
                        {col.shortName || col.code}
                      </div>
                      <div className="text-[10px] font-bold text-blue-700 mt-0.5 print:text-[10px] print:text-slate-700">
                        ({col.conducted})
                      </div>
                    </th>
                  ))}

                  {/* Total Conducted - Shown on screen, HIDDEN in print */}
                  <th
                    rowSpan={2}
                    className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-700 bg-slate-100 w-20 print:hidden"
                  >
                    <div>Total Held</div>
                    <div className="text-[10px] text-slate-500 font-semibold">({totalMonthHeld})</div>
                  </th>

                  {/* Total Attended - ALWAYS Visible in print and screen */}
                  <th
                    rowSpan={2}
                    className="border border-slate-300 px-3 py-2 text-center font-bold text-blue-900 bg-blue-100/60 w-24 print:w-14 print:px-1 print:py-1 print:bg-slate-100 print:text-black print:text-[11px]"
                  >
                    Total Attended
                  </th>

                  {/* Overall Attendance Percentage - ALWAYS Visible in print and screen */}
                  <th
                    rowSpan={2}
                    className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-900 bg-slate-100 w-20 print:w-14 print:px-1 print:py-1 print:text-[11px]"
                  >
                    Attendance %
                  </th>

                  {/* Defaulter Status - Shown on screen, HIDDEN in print */}
                  <th
                    rowSpan={2}
                    className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-800 bg-slate-100 w-24 no-print print:hidden"
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {monthlyStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={monthSubjectColumns.length + 7}
                      className="px-4 py-8 text-center text-slate-400 font-medium"
                    >
                      No records found for the selected month.
                    </td>
                  </tr>
                ) : (
                  monthlyStudents.map((st, idx) => (
                    <tr
                      key={st.studentId}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        st.isDefaulter ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* S.No */}
                      <td className="sticky left-0 bg-white z-10 border border-slate-300 px-2 py-1.5 text-center text-slate-500 font-mono text-[10px] print:static print:w-8 print:px-1 print:py-1 print:text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Roll Number */}
                      <td className="sticky left-12 bg-white z-10 border border-slate-300 px-3 py-1.5 font-mono font-bold text-slate-900 shadow-[1px_0_0_0_#e2e8f0] print:static print:shadow-none print:w-24 print:px-1.5 print:py-1 print:text-[10.5px]">
                        <Link
                          href={`/admin/students/${st.studentId}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {st.rollNumber}
                        </Link>
                      </td>

                      {/* Student Name */}
                      <td className="sticky left-44 bg-white z-10 border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 shadow-[2px_0_4px_0_rgba(0,0,0,0.06)] print:static print:shadow-none print:min-w-0 print:w-36 print:px-1.5 print:py-1 print:text-[10.5px]">
                        <Link
                          href={`/admin/students/${st.studentId}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {st.fullName}
                        </Link>
                      </td>

                      {/* Subject Cells */}
                      {monthSubjectColumns.map((col) => {
                        const attended = st.subjectAttendance[col.id] ?? 0;
                        const conducted = col.conducted;
                        const pct =
                          conducted > 0
                            ? Math.round((attended / conducted) * 100)
                            : null;

                        return (
                          <td
                            key={col.id}
                            className="border border-slate-300 px-2.5 py-1.5 text-center print:px-1 print:py-1 print:text-[10.5px]"
                          >
                            {conducted > 0 ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="font-bold text-slate-900 text-xs print:text-[11px]">
                                  {attended}
                                </span>
                                <span
                                  className={`text-[9px] font-semibold print:text-[10px] ${
                                    pct !== null && pct < 75
                                      ? "text-rose-600 print:text-rose-700"
                                      : "text-slate-400 print:text-slate-600"
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-medium">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Held - Screen only, HIDDEN in print */}
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-bold text-slate-600 bg-slate-50/50 print:hidden">
                        {totalMonthHeld}
                      </td>

                      {/* Total Attended - ALWAYS Visible in print and screen */}
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-extrabold text-blue-700 bg-blue-50/30 print:w-14 print:px-1 print:py-1 print:text-black print:text-[11px] print:bg-slate-50">
                        {st.attended}
                      </td>

                      {/* Attendance Percentage - ALWAYS Visible in print and screen */}
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-black print:w-14 print:px-1 print:py-1 print:text-[11px]">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs print:p-0 print:text-[11px] ${
                            st.isDefaulter
                              ? "bg-rose-100 text-rose-800 font-black print:text-rose-700"
                              : "text-emerald-700 font-bold print:text-emerald-800"
                          }`}
                        >
                          {st.percentage !== null ? `${st.percentage}%` : "—"}
                        </span>
                      </td>

                      {/* Status - Screen only, HIDDEN in print */}
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center no-print print:hidden">
                        {st.isDefaulter ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                            Defaulter
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                            Eligible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signature Footnote for Printed Register (Strict Single Row in Print) */}
        <table className="w-full border-none mt-10 print-signatures-table print-only">
          <tbody>
            <tr>
              <td className="w-1/3 text-center border-none px-4">
                <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                  Class Coordinator / Mentor
                </div>
              </td>
              <td className="w-1/3 text-center border-none px-4">
                <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                  Head of Department (HOD)
                </div>
              </td>
              <td className="w-1/3 text-center border-none px-4">
                <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                  Dean of Academic Affairs
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
