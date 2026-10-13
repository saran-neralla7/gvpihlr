"use client";

import React, { useState, useMemo } from "react";
import {
  Printer,
  X,
  FileText,
  Calendar,
  Users,
  Percent,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import type { AllSectionsReportResponse, AllSectionsReportItem } from "@/lib/reportsActions";
import InstitutionalDatePicker from "@/components/InstitutionalDatePicker";

interface AllSectionsPrintReportsProps {
  data: AllSectionsReportResponse;
  initialMode?: "consolidated" | "subject_wise";
  onClose: () => void;
}

const COLLEGE_NAME = "GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH";
const COLLEGE_SUBTITLE =
  "(Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956) • Visakhapatnam";

export default function AllSectionsPrintReports({
  data: initialData,
  initialMode = "consolidated",
  onClose,
}: AllSectionsPrintReportsProps) {
  const [reportData, setReportData] = useState<AllSectionsReportResponse>(initialData);
  const [reportType, setReportType] = useState<"consolidated" | "subject_wise">(initialMode);
  
  // Scoped Filters
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>("ALL");
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>("ALL");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("ALL");

  // Date Range state
  const [fromDate, setFromDate] = useState<string>(
    initialData.dateRange?.startDate || "2026-09-22"
  );
  const [toDate, setToDate] = useState<string>(
    initialData.dateRange?.endDate || "2026-10-07"
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch updated data when user clicks "Apply Dates"
  const handleRefreshReportData = async () => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("startDate", fromDate);
      if (toDate) params.append("endDate", toDate);
      if (selectedSchoolFilter !== "ALL") params.append("schoolId", selectedSchoolFilter);
      if (selectedProgramFilter !== "ALL") params.append("programId", selectedProgramFilter);

      const res = await fetch(`/api/reports/all-sections?${params.toString()}`);
      const result = await res.json();
      if (result && result.success) {
        setReportData(result);
      } else {
        alert("Failed to load reports for the selected dates: " + (result?.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error refreshing reports:", err);
      alert("Error refreshing reports for selected dates.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Cascaded list of programs based on selected school
  const filteredProgramsList = useMemo(() => {
    const progs = reportData.availablePrograms || [];
    if (selectedSchoolFilter === "ALL") return progs;
    return progs.filter((p) => p.schoolId === selectedSchoolFilter);
  }, [reportData.availablePrograms, selectedSchoolFilter]);

  // Sections matching active school, program, and section dropdowns
  const matchingSections = useMemo(() => {
    return reportData.sections.filter((sec) => {
      if (selectedSchoolFilter !== "ALL") {
        const prog = (reportData.availablePrograms || []).find((p) => p.name === sec.programName || p.code === sec.programCode);
        if (prog && prog.schoolId !== selectedSchoolFilter) return false;
      }
      if (selectedProgramFilter !== "ALL") {
        const prog = (reportData.availablePrograms || []).find((p) => p.id === selectedProgramFilter);
        if (prog && prog.name !== sec.programName) return false;
      }
      return true;
    });
  }, [reportData.sections, selectedSchoolFilter, selectedProgramFilter, reportData.availablePrograms]);

  // Final list of sections to display (respecting single-section preview if chosen)
  const sectionsToDisplay = useMemo(() => {
    if (selectedSectionFilter === "ALL") return matchingSections;
    return matchingSections.filter((s) => s.sectionId === selectedSectionFilter);
  }, [matchingSections, selectedSectionFilter]);

  // Overall statistics for sections in current view
  const totalEnrolledInView = useMemo(() => {
    return matchingSections.reduce((acc, s) => acc + s.totalStudents, 0);
  }, [matchingSections]);

  const averageAttendanceInView = useMemo(() => {
    if (matchingSections.length === 0) return 0;
    const sum = matchingSections.reduce((acc, s) => acc + s.averageAttendance, 0);
    return parseFloat((sum / matchingSections.length).toFixed(1));
  }, [matchingSections]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Print Container Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 8mm 10mm 8mm;
          }
          body * {
            visibility: hidden !important;
          }
          #all-sections-print-container,
          #all-sections-print-container * {
            visibility: visible !important;
          }
          #all-sections-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-section {
            page-break-before: always !important;
            break-before: page !important;
          }
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th,
          td {
            border: 1px solid #1e293b !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Main Modal Wrapper (Screen View) */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Top Control Bar (Screen only) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F2C59] via-[#163A70] to-[#0B2545] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                PORTRAIT A4 • ONE-CLICK REPORT
              </span>
              <span className="text-xs font-bold text-blue-200">
                Academic Year 2026-2027
              </span>
              {reportData.isSuperAdmin ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30">
                  Admin (All Programs)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px] font-bold border border-amber-400/30">
                  First Year Incharge Scope
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              All Sections Consolidated Attendance Report
            </h2>
            <p className="text-xs text-slate-200 font-medium">
              Compiles active sections in high-clarity Portrait A4 format for executive review and university printing.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Switcher: Consolidated vs Subject-Wise */}
            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/20">
              <button
                type="button"
                onClick={() => setReportType("consolidated")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  reportType === "consolidated"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Consolidated
              </button>
              <button
                type="button"
                onClick={() => setReportType("subject_wise")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  reportType === "subject_wise"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Subject-Wise
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Report</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar (Screen only) with Live Date Selection & School/Program Scoping */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* School Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10px]">School:</span>
              <select
                value={selectedSchoolFilter}
                onChange={(e) => {
                  setSelectedSchoolFilter(e.target.value);
                  setSelectedProgramFilter("ALL");
                  setSelectedSectionFilter("ALL");
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[210px] truncate"
              >
                <option value="ALL">
                  {reportData.isSuperAdmin ? "All Schools (University)" : "All Assigned Schools"}
                </option>
                {reportData.availableSchools?.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Program Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Program:</span>
              <select
                value={selectedProgramFilter}
                onChange={(e) => {
                  setSelectedProgramFilter(e.target.value);
                  setSelectedSectionFilter("ALL");
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[230px] truncate"
              >
                <option value="ALL">
                  {reportData.isSuperAdmin ? "All Programs" : "All Assigned Programs"}
                </option>
                {filteredProgramsList.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Section:</span>
              <select
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[190px] truncate"
              >
                <option value="ALL">All {matchingSections.length} Sections</option>
                {matchingSections.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.schoolCode} - {s.displayName} ({s.totalStudents} Students)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range: From Date & To Date */}
            <div className="flex items-center gap-1.5">
              <InstitutionalDatePicker
                label="From:"
                value={fromDate}
                onChange={(d) => setFromDate(d)}
                variant="light"
              />
              <span className="text-slate-400 font-bold text-xs">—</span>
              <InstitutionalDatePicker
                label="To:"
                value={toDate}
                onChange={(d) => setToDate(d)}
                variant="light"
              />
              <button
                type="button"
                disabled={isRefreshing}
                onClick={handleRefreshReportData}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 disabled:opacity-50"
              >
                {isRefreshing ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Apply Dates</span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600 font-semibold text-xs">
            <span>Sections: <strong>{matchingSections.length}</strong></span>
            <span>Enrolled: <strong>{totalEnrolledInView.toLocaleString()}</strong></span>
            <span>Avg Attendance: <strong>{averageAttendanceInView}%</strong></span>
          </div>
        </div>

        {/* Scrollable Container (Visible on screen AND captured during print) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60" id="all-sections-print-container">
          {/* =========================================================================
              DOCUMENT COVER / EXECUTIVE SUMMARY PAGE (Portrait A4)
              ========================================================================= */}
          {selectedSectionFilter === "ALL" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-[210mm] mx-auto mb-8 avoid-break text-black print:border-none print:shadow-none print:p-0 print:mb-0">
              {/* Institutional Header with Logo in Same Row */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                <div className="flex items-center justify-center gap-3 mb-1.5">
                  <img
                    src="/gvpihlr.png"
                    alt="University Seal"
                    className="w-14 h-14 object-contain flex-shrink-0"
                  />
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight uppercase font-sans">
                      {COLLEGE_NAME}
                    </h1>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 leading-tight mt-0.5 font-sans">
                      {COLLEGE_SUBTITLE}
                    </p>
                  </div>
                </div>

                <div className="mt-2 py-1 px-3 bg-slate-100 rounded-lg inline-block border border-slate-300">
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase font-sans">
                    {reportType === "consolidated"
                      ? "ALL SECTIONS CONSOLIDATED ATTENDANCE SUMMARY"
                      : "ALL SECTIONS SUBJECT-WISE ATTENDANCE MASTER COMPILATION"}
                  </h2>
                </div>

                <div className="flex items-center justify-between text-[10pt] font-bold text-slate-800 mt-2 px-1 border-t border-slate-200 pt-1.5">
                  <span>Academic Year: <strong>2026-2027</strong></span>
                  <span className="bg-slate-100 px-3 py-0.5 rounded border border-slate-300 text-slate-900 font-black">
                    Attendance Window: <strong>{fromDate} to {toDate}</strong>
                  </span>
                  <span>Printed: <strong>{new Date().toLocaleDateString("en-GB")}</strong></span>
                </div>
              </div>

              {/* Master KPI Banner (Clean institutional metrics) */}
              <div className="grid grid-cols-4 gap-2.5 mb-5 text-center">
                <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-[10pt] font-bold text-slate-600 uppercase">Total Sections</div>
                  <div className="text-[14pt] font-black text-slate-900">{matchingSections.length}</div>
                </div>
                <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-[10pt] font-bold text-slate-600 uppercase">Total Students</div>
                  <div className="text-[14pt] font-black text-slate-900">{totalEnrolledInView.toLocaleString()}</div>
                </div>
                <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-[10pt] font-bold text-slate-600 uppercase">Average Attendance</div>
                  <div className="text-[14pt] font-black text-emerald-800">{averageAttendanceInView}%</div>
                </div>
                <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-[10pt] font-bold text-slate-600 uppercase">Total Sessions Held</div>
                  <div className="text-[14pt] font-black text-blue-900">
                    {matchingSections.reduce((acc, s) => acc + s.totalSessionsConducted, 0)}
                  </div>
                </div>
              </div>

              {/* Summary Table of All Sections (NO Status / Eligible / Defaulter columns) */}
              <div className="mb-6">
                <h3 className="text-[10.5pt] font-black text-slate-900 uppercase mb-2">
                  Section-Wise Attendance Roster Summary
                </h3>
                <table className="w-full border-collapse border border-slate-800 text-left">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-black text-[10pt]">
                      <th className="p-1.5 border border-slate-800 text-center w-8">#</th>
                      <th className="p-1.5 border border-slate-800 w-16 text-center">School</th>
                      <th className="p-1.5 border border-slate-800">Program &amp; Section Name</th>
                      <th className="p-1.5 border border-slate-800 text-center w-24">Enrolled</th>
                      <th className="p-1.5 border border-slate-800 text-center w-24">Held</th>
                      <th className="p-1.5 border border-slate-800 text-center w-28">Attended %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchingSections.map((sec, idx) => (
                      <tr key={sec.sectionId} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-bold">{idx + 1}</td>
                        <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-black">{sec.schoolCode}</td>
                        <td className="p-1.5 border border-slate-800 text-[10pt] font-bold">{sec.displayName}</td>
                        <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-bold">{sec.totalStudents}</td>
                        <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-bold">{sec.totalSessionsConducted}</td>
                        <td className="p-1.5 border border-slate-800 text-center text-[10.5pt] font-black">{sec.averageAttendance}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200 text-slate-900 font-black text-[10pt]">
                      <td colSpan={3} className="p-1.5 border border-slate-800 text-right uppercase">
                        University Grand Total
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center text-[10.5pt]">{totalEnrolledInView}</td>
                      <td className="p-1.5 border border-slate-800 text-center text-[10.5pt]">
                        {matchingSections.reduce((acc, s) => acc + s.totalSessionsConducted, 0)}
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center text-[11pt]">{averageAttendanceInView}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signature Row */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-4 gap-4 text-center text-[10pt] font-black text-slate-800">
                <div className="pt-8 border-t border-slate-800">Class Incharge</div>
                <div className="pt-8 border-t border-slate-800">Head of Department</div>
                <div className="pt-8 border-t border-slate-800">First Year Incharge</div>
                <div className="pt-8 border-t border-slate-800">Registrar-I/C</div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION-BY-SECTION DETAILED SHEETS (Each section on its own Portrait A4)
              ========================================================================= */}
          {sectionsToDisplay.map((sec) => {
            return (
              <div
                key={sec.sectionId}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-[210mm] mx-auto mb-8 page-break-section text-black print:border-none print:shadow-none print:p-0 print:mb-0"
              >
                {/* Header per Section with Logo */}
                <div className="border-b-2 border-slate-900 pb-2.5 mb-3 text-center">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <img
                      src="/gvpihlr.png"
                      alt="University Seal"
                      className="w-12 h-12 object-contain flex-shrink-0"
                    />
                    <div>
                      <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight uppercase font-sans">
                        {COLLEGE_NAME}
                      </h2>
                      <p className="text-[9pt] font-semibold text-slate-700 leading-tight font-sans">
                        {COLLEGE_SUBTITLE}
                      </p>
                    </div>
                  </div>

                  <div className="mt-1.5 py-0.5 px-3 bg-slate-100 rounded inline-block border border-slate-300">
                    <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase font-sans">
                      {reportType === "consolidated"
                        ? "CONSOLIDATED CLASS ATTENDANCE REGISTER"
                        : "SUBJECT-WISE CONSOLIDATED CLASS ATTENDANCE REGISTER"}
                    </h3>
                  </div>

                  {/* Section Metadata including Attendance Period */}
                  <div className="grid grid-cols-3 text-[9.5pt] font-bold text-slate-800 mt-2 px-1 text-left bg-slate-50 p-2 rounded border border-slate-200 gap-y-1">
                    <div>
                      School: <strong>{sec.schoolName} ({sec.schoolCode})</strong>
                    </div>
                    <div className="text-center">
                      Program: <strong>{sec.programName}</strong>
                    </div>
                    <div className="text-right">
                      Section: <strong>{sec.displayName}</strong>
                    </div>
                    <div>
                      Academic Year: <strong>2026-2027 (Year {sec.year}, Sem {sec.semester})</strong>
                    </div>
                    <div className="text-center">
                      Period: <strong>{fromDate} to {toDate}</strong>
                    </div>
                    <div className="text-right">
                      Conducted: <strong>{sec.totalSessionsConducted} Sessions ({sec.averageAttendance}%)</strong>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    VIEW 1: CONSOLIDATED ROSTER (Portrait A4 Table - NO Status Column)
                    ========================================================================= */}
                {reportType === "consolidated" ? (
                  <div>
                    <table className="w-full border-collapse border border-slate-800 text-left">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-black text-[10pt]">
                          <th className="p-1 border border-slate-800 text-center w-8">#</th>
                          <th className="p-1 border border-slate-800 w-32 font-mono">Roll Number</th>
                          <th className="p-1 border border-slate-800">Student Name</th>
                          <th className="p-1 border border-slate-800 text-center w-20">Total Held</th>
                          <th className="p-1 border border-slate-800 text-center w-20">Attended</th>
                          <th className="p-1 border border-slate-800 text-center w-20">Absent</th>
                          <th className="p-1 border border-slate-800 text-center w-24">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.students.map((st, i) => (
                          <tr
                            key={st.studentId}
                            className={i % 2 === 0 ? "bg-white font-medium" : "bg-slate-50 font-medium"}
                          >
                            <td className="p-1 border border-slate-800 text-center text-[10pt] font-bold">{i + 1}</td>
                            <td className="p-1 border border-slate-800 font-mono font-bold text-[10pt] tracking-tight">
                              {st.rollNumber}
                            </td>
                            <td className="p-1 border border-slate-800 font-bold text-[10pt] truncate max-w-[220px]">
                              {st.fullName}
                            </td>
                            <td className="p-1 border border-slate-800 text-center text-[10pt] font-bold">
                              {st.totalClasses}
                            </td>
                            <td className="p-1 border border-slate-800 text-center text-[10pt] font-black text-emerald-800">
                              {st.attendedClasses}
                            </td>
                            <td className="p-1 border border-slate-800 text-center text-[10pt] font-bold text-rose-700">
                              {st.absentClasses}
                            </td>
                            <td className="p-1 border border-slate-800 text-center text-[10.5pt] font-black">
                              {st.percentage !== null ? `${st.percentage}%` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-200 text-slate-900 font-black text-[10pt]">
                          <td colSpan={3} className="p-1.5 border border-slate-800 text-right uppercase">
                            Section Total ({sec.totalStudents} Students)
                          </td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10.5pt]">{sec.totalSessionsConducted}</td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10.5pt]">
                            {sec.students.reduce((acc, s) => acc + s.attendedClasses, 0)}
                          </td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10.5pt]">
                            {sec.students.reduce((acc, s) => acc + s.absentClasses, 0)}
                          </td>
                          <td className="p-1.5 border border-slate-800 text-center font-black text-[11pt]">
                            {sec.averageAttendance}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  /* =========================================================================
                      VIEW 2: SUBJECT-WISE CONSOLIDATED ROSTER (Portrait A4 Table - NO Status Column)
                      ========================================================================= */
                  <div>
                    {/* Subject Legend Bar */}
                    <div className="mb-2 p-2 bg-slate-50 border border-slate-300 rounded text-[9pt] font-bold text-slate-800 flex flex-wrap gap-x-3 gap-y-1">
                      <span className="uppercase text-slate-500">Subjects Conducted:</span>
                      {sec.subjectColumns.map((col) => (
                        <span key={col.id} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          <strong>{col.shortName}</strong> ({col.code}): {col.conducted} Held
                        </span>
                      ))}
                    </div>

                    <table className="w-full border-collapse border border-slate-800 text-left">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-black text-[9.5pt]">
                          <th className="p-1 border border-slate-800 text-center w-7">#</th>
                          <th className="p-1 border border-slate-800 w-24 font-mono">Roll No</th>
                          <th className="p-1 border border-slate-800">Student Name</th>
                          {sec.subjectColumns.map((col) => (
                            <th key={col.id} className="p-1 border border-slate-800 text-center font-mono">
                              <div>{col.shortName}</div>
                              <div className="text-[9pt] text-slate-600 font-normal">({col.conducted})</div>
                            </th>
                          ))}
                          <th className="p-1 border border-slate-800 text-center w-14">Held</th>
                          <th className="p-1 border border-slate-800 text-center w-14">Attended</th>
                          <th className="p-1 border border-slate-800 text-center w-16">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.students.map((st, i) => (
                          <tr
                            key={st.studentId}
                            className={i % 2 === 0 ? "bg-white font-medium" : "bg-slate-50 font-medium"}
                          >
                            <td className="p-1 border border-slate-800 text-center text-[10pt] font-bold">{i + 1}</td>
                            <td className="p-1 border border-slate-800 font-mono font-bold text-[10pt]">
                              {st.rollNumber}
                            </td>
                            <td className="p-1 border border-slate-800 font-bold text-[10pt] truncate max-w-[150px]">
                              {st.fullName}
                            </td>
                            {sec.subjectColumns.map((col) => {
                              const att = st.subjectAttendance[col.id] ?? 0;
                              return (
                                <td key={col.id} className="p-1 border border-slate-800 text-center font-bold text-[10pt]">
                                  {att}
                                </td>
                              );
                            })}
                            <td className="p-1 border border-slate-800 text-center font-bold text-[10pt]">
                              {st.totalClasses}
                            </td>
                            <td className="p-1 border border-slate-800 text-center font-black text-emerald-800 text-[10pt]">
                              {st.attendedClasses}
                            </td>
                            <td className="p-1 border border-slate-800 text-center font-black text-[10.5pt]">
                              {st.percentage !== null ? `${st.percentage}%` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Section Signature Block */}
                <div className="mt-4 pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-[10pt] font-black text-slate-800 avoid-break">
                  <div className="pt-6 border-t border-slate-800">Class Incharge</div>
                  <div className="pt-6 border-t border-slate-800">Head of Department / 1st Year Incharge</div>
                  <div className="pt-6 border-t border-slate-800">Registrar-I/C</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
