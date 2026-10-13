"use client";

import React, { useState } from "react";
import {
  Printer,
  X,
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Percent,
} from "lucide-react";
import type { AllSectionsReportResponse, AllSectionsReportItem } from "@/lib/reportsActions";

interface AllSectionsPrintReportsProps {
  data: AllSectionsReportResponse;
  initialMode?: "consolidated" | "subject_wise";
  onClose: () => void;
}

const COLLEGE_NAME = "GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH";
const COLLEGE_SUBTITLE =
  "(Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956) • Visakhapatnam";

export default function AllSectionsPrintReports({
  data,
  initialMode = "consolidated",
  onClose,
}: AllSectionsPrintReportsProps) {
  const [reportType, setReportType] = useState<"consolidated" | "subject_wise">(initialMode);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("ALL");

  const handlePrint = () => {
    window.print();
  };

  const sectionsToDisplay =
    selectedSectionFilter === "ALL"
      ? data.sections
      : data.sections.filter((s) => s.sectionId === selectedSectionFilter);

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
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Top Control Bar (Screen only) */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0F2C59] via-[#163A70] to-[#0B2545] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                PORTRAIT A4 • ONE-CLICK REPORT
              </span>
              <span className="text-xs font-bold text-blue-200">
                Academic Year 2026-2027
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              All Sections Consolidated Attendance Report
            </h2>
            <p className="text-xs text-slate-200 font-medium">
              Compiles all {data.sections.length} active sections in high-clarity Portrait A4 format for executive review and university printing.
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

        {/* Filter bar (Screen only) */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 uppercase text-[11px]">Preview Section:</span>
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All {data.sections.length} Sections (Full Compilation)</option>
              {data.sections.map((s) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.schoolCode} - {s.displayName} ({s.totalStudents} Students)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <span>Total Sections: <strong>{data.summary.totalSections}</strong></span>
            <span>Total Enrolled: <strong>{data.summary.totalStudents.toLocaleString()}</strong></span>
            <span>Overall Rate: <strong>{data.summary.overallAverageAttendance}%</strong></span>
            <span>Defaulters (&lt;75%): <strong className="text-rose-600">{data.summary.totalDefaulters}</strong></span>
          </div>
        </div>

        {/* Scrollable Container (Visible on screen AND captured during print) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60" id="all-sections-print-container">
          {/* =========================================================================
              DOCUMENT COVER / EXECUTIVE SUMMARY PAGE (Portrait A4)
              ========================================================================= */}
          {selectedSectionFilter === "ALL" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-[210mm] mx-auto mb-8 avoid-break text-black print:border-none print:shadow-none print:p-0 print:mb-0">
              {/* Institutional Header */}
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

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mt-2 px-1">
                  <span>Academic Year: <strong>2026-2027 (ODD SEMESTER)</strong></span>
                  <span>Batch: <strong>2026-2030 (Year 1)</strong></span>
                  <span>Printed: <strong>{new Date().toLocaleDateString("en-GB")}</strong></span>
                </div>
              </div>

              {/* Master KPI Banner */}
              <div className="grid grid-cols-4 gap-2.5 mb-5 text-center">
                <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-[9.5pt] font-bold text-slate-600 uppercase">Total Sections</div>
                  <div className="text-[14pt] font-black text-slate-900">{data.summary.totalSections}</div>
                </div>
                <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-[9.5pt] font-bold text-slate-600 uppercase">Total Students</div>
                  <div className="text-[14pt] font-black text-slate-900">{data.summary.totalStudents.toLocaleString()}</div>
                </div>
                <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-[9.5pt] font-bold text-slate-600 uppercase">Average Attendance</div>
                  <div className="text-[14pt] font-black text-emerald-800">{data.summary.overallAverageAttendance}%</div>
                </div>
                <div className="p-2.5 border border-slate-300 rounded-lg bg-rose-50">
                  <div className="text-[9.5pt] font-bold text-rose-800 uppercase">Total Defaulters</div>
                  <div className="text-[14pt] font-black text-rose-700">{data.summary.totalDefaulters}</div>
                </div>
              </div>

              {/* Summary Table of All Sections */}
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
                      <th className="p-1.5 border border-slate-800 text-center w-16">Enrolled</th>
                      <th className="p-1.5 border border-slate-800 text-center w-16">Held</th>
                      <th className="p-1.5 border border-slate-800 text-center w-20">Attended %</th>
                      <th className="p-1.5 border border-slate-800 text-center w-20">Eligible (≥75%)</th>
                      <th className="p-1.5 border border-slate-800 text-center w-20 text-rose-800">Defaulters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sections.map((sec, idx) => {
                      const eligibleCount = sec.totalStudents - sec.defaultersCount;
                      return (
                        <tr key={sec.sectionId} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-bold">{idx + 1}</td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-black">{sec.schoolCode}</td>
                          <td className="p-1.5 border border-slate-800 text-[10pt] font-bold">{sec.displayName}</td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-bold">{sec.totalStudents}</td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-bold">{sec.totalSessionsConducted}</td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10.5pt] font-black">{sec.averageAttendance}%</td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-bold text-emerald-800">{eligibleCount}</td>
                          <td className="p-1.5 border border-slate-800 text-center text-[10pt] font-bold text-rose-800">{sec.defaultersCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200 text-slate-900 font-black text-[10pt]">
                      <td colSpan={3} className="p-1.5 border border-slate-800 text-right uppercase">
                        University Grand Total
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center text-[10.5pt]">{data.summary.totalStudents}</td>
                      <td className="p-1.5 border border-slate-800 text-center text-[10.5pt]">—</td>
                      <td className="p-1.5 border border-slate-800 text-center text-[11pt]">{data.summary.overallAverageAttendance}%</td>
                      <td className="p-1.5 border border-slate-800 text-center text-[10.5pt] text-emerald-900">
                        {data.summary.totalStudents - data.summary.totalDefaulters}
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center text-[10.5pt] text-rose-900">{data.summary.totalDefaulters}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signature Row */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-4 gap-4 text-center text-[9.5pt] font-black text-slate-800">
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
          {sectionsToDisplay.map((sec, secIdx) => {
            return (
              <div
                key={sec.sectionId}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-[210mm] mx-auto mb-8 page-break-section text-black print:border-none print:shadow-none print:p-0 print:mb-0"
              >
                {/* Header per Section */}
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

                  {/* Section Metadata */}
                  <div className="grid grid-cols-3 text-[9.5pt] font-bold text-slate-800 mt-2 px-1 text-left bg-slate-50 p-1.5 rounded border border-slate-200">
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
                      Total Classes Conducted: <strong>{sec.totalSessionsConducted} Sessions</strong>
                    </div>
                    <div className="text-right">
                      Average Attendance: <strong>{sec.averageAttendance}%</strong>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    VIEW 1: CONSOLIDATED ROSTER (Portrait A4 Table)
                    ========================================================================= */}
                {reportType === "consolidated" ? (
                  <div>
                    <table className="w-full text-[9.5pt] border-collapse border border-slate-800 text-left">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-black">
                          <th className="p-1 border border-slate-800 text-center w-8">#</th>
                          <th className="p-1 border border-slate-800 w-28 font-mono">Roll Number</th>
                          <th className="p-1 border border-slate-800">Student Name</th>
                          <th className="p-1 border border-slate-800 text-center w-16">Total Held</th>
                          <th className="p-1 border border-slate-800 text-center w-16">Attended</th>
                          <th className="p-1 border border-slate-800 text-center w-16">Absent</th>
                          <th className="p-1 border border-slate-800 text-center w-18">Attendance %</th>
                          <th className="p-1 border border-slate-800 text-center w-24">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.students.map((st, i) => (
                          <tr
                            key={st.studentId}
                            className={
                              st.isDefaulter
                                ? "bg-rose-50/70 font-semibold text-rose-900"
                                : i % 2 === 0
                                ? "bg-white font-medium"
                                : "bg-slate-50 font-medium"
                            }
                          >
                            <td className="p-1 border border-slate-800 text-center text-[10pt] font-bold">{i + 1}</td>
                            <td className="p-1 border border-slate-800 font-mono font-bold text-[10pt] tracking-tight">
                              {st.rollNumber}
                            </td>
                            <td className="p-1 border border-slate-800 font-bold text-[10pt] truncate max-w-[200px]">
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
                            <td className="p-1 border border-slate-800 text-center text-[9pt] font-black">
                              {st.isDefaulter ? (
                                <span className="text-rose-700">DEFAULTER (&lt;75%)</span>
                              ) : (
                                <span className="text-emerald-800">ELIGIBLE</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-200 text-slate-900 font-black text-[9.5pt]">
                          <td colSpan={3} className="p-1.5 border border-slate-800 text-right uppercase">
                            Section Total ({sec.totalStudents} Students)
                          </td>
                          <td className="p-1.5 border border-slate-800 text-center">{sec.totalSessionsConducted}</td>
                          <td className="p-1.5 border border-slate-800 text-center">
                            {sec.students.reduce((acc, s) => acc + s.attendedClasses, 0)}
                          </td>
                          <td className="p-1.5 border border-slate-800 text-center">
                            {sec.students.reduce((acc, s) => acc + s.absentClasses, 0)}
                          </td>
                          <td className="p-1.5 border border-slate-800 text-center font-black">
                            {sec.averageAttendance}%
                          </td>
                          <td className="p-1.5 border border-slate-800 text-center text-rose-800">
                            {sec.defaultersCount} Defaulters
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  /* =========================================================================
                      VIEW 2: SUBJECT-WISE CONSOLIDATED ROSTER (Portrait A4 Table)
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
                          <th className="p-1 border border-slate-800 text-center w-12">Held</th>
                          <th className="p-1 border border-slate-800 text-center w-12">Attended</th>
                          <th className="p-1 border border-slate-800 text-center w-14">%</th>
                          <th className="p-1 border border-slate-800 text-center w-16">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.students.map((st, i) => (
                          <tr
                            key={st.studentId}
                            className={
                              st.isDefaulter
                                ? "bg-rose-50/70 font-semibold text-rose-900"
                                : i % 2 === 0
                                ? "bg-white font-medium"
                                : "bg-slate-50 font-medium"
                            }
                          >
                            <td className="p-1 border border-slate-800 text-center text-[10pt] font-bold">{i + 1}</td>
                            <td className="p-1 border border-slate-800 font-mono font-bold text-[10pt]">
                              {st.rollNumber}
                            </td>
                            <td className="p-1 border border-slate-800 font-bold text-[10pt] truncate max-w-[140px]">
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
                            <td className="p-1 border border-slate-800 text-center text-[9pt] font-black">
                              {st.isDefaulter ? (
                                <span className="text-rose-700">DEF</span>
                              ) : (
                                <span className="text-emerald-800">OK</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Section Signature Block */}
                <div className="mt-4 pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-[9pt] font-black text-slate-800 avoid-break">
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
