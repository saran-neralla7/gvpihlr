"use client";

import Link from "next/link";
import {
  FileSpreadsheet,
  Printer,
  BookOpen,
  Users,
  AlertTriangle,
  Percent,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export interface SubjectColumnItem {
  id: string;
  name: string;
  code: string;
  shortName: string;
  type?: string;
  conducted: number;
}

export interface SubjectWiseStudentItem {
  studentId: string;
  rollNumber: string;
  fullName: string;
  phone?: string | null;
  subjectAttendance?: Record<string, number>;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  percentage: number | null;
  isDefaulter: boolean;
}

interface SubjectWiseReportTableProps {
  students: SubjectWiseStudentItem[];
  subjectColumns: SubjectColumnItem[];
  totalSessionsConducted: number;
  sectionName: string;
  programName: string;
  year?: number;
  semester?: number;
  startDate?: string;
  endDate?: string;
  onExportCSV: () => void;
}

export default function SubjectWiseReportTable({
  students,
  subjectColumns,
  totalSessionsConducted,
  sectionName,
  programName,
  year = 1,
  semester = 1,
  startDate = "",
  endDate = "",
  onExportCSV,
}: SubjectWiseReportTableProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar for Subject-Wise Report */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs no-print">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Subject-Wise Consolidated Register
          </h3>
          <p className="text-xs text-slate-500">
            Individual subject breakdown with conducted class counts and overall attendance %.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition shadow-xs"
            title="Download Subject-Wise CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B2545] hover:bg-[#132E5C] text-white rounded-xl text-xs font-bold transition shadow-xs"
            title="Print Official Subject Register"
          >
            <Printer className="w-4 h-4" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white border border-slate-300/80 rounded-3xl p-5 sm:p-8 shadow-xs print-container space-y-5 max-w-full overflow-hidden">
        {/* Official Institutional Header */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-200">
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
            GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH
          </h1>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-600">
            (Deemed to be University under Section 3 of the UGC Act, 1956) • Visakhapatnam
          </h2>
          <div className="inline-block mt-1 px-4 py-1 rounded-full bg-blue-50 border border-blue-200">
            <h3 className="text-xs sm:text-sm font-black text-blue-900 tracking-wide uppercase">
              Subject-Wise Consolidated Class Attendance Register
            </h3>
          </div>
          <div className="text-[11px] text-slate-600 font-semibold space-y-0.5 pt-2">
            <div>
              Program: <strong>{programName}</strong> | Academic Year: <strong>2026-2027</strong> | Batch: <strong>2026-2030</strong>
            </div>
            <div>
              Year: <strong>{year}</strong> | Semester: <strong>{semester}</strong> | Section:{" "}
              <strong>{sectionName}</strong> | Period: <strong>{startDate}</strong> to <strong>{endDate}</strong> ({totalSessionsConducted} Total Sessions)
            </div>
          </div>
        </div>

        {/* Contained Overflow Table */}
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-300/90 shadow-2xs">
          <table className="w-full min-w-max border-collapse border-slate-300 text-[11px] print-table">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-300">
                {/* S.No */}
                <th
                  rowSpan={2}
                  className="sticky left-0 bg-slate-100 z-20 border border-slate-300 px-2.5 py-2 text-center font-bold text-slate-800 w-12"
                >
                  #
                </th>

                {/* Roll Number (Frozen Sticky) */}
                <th
                  rowSpan={2}
                  className="sticky left-12 bg-slate-100 z-20 border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 w-32 shadow-[1px_0_0_0_#cbd5e1]"
                >
                  Roll Number
                </th>

                {/* Student Name (Frozen Sticky) */}
                <th
                  rowSpan={2}
                  className="sticky left-44 bg-slate-100 z-20 border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 min-w-[190px] shadow-[2px_0_4px_0_rgba(0,0,0,0.06)]"
                >
                  Student Name
                </th>

                {/* Subject Columns */}
                {subjectColumns.map((col) => (
                  <th
                    key={col.id}
                    className="border border-slate-300 px-3 py-2 text-center bg-blue-50/50 min-w-[100px]"
                  >
                    <div className="font-extrabold text-slate-900 tracking-tight text-xs">
                      {col.shortName || col.code}
                    </div>
                    <div className="text-[10px] font-bold text-blue-700 mt-0.5">
                      ({col.conducted} Conducted)
                    </div>
                  </th>
                ))}

                {/* Total Conducted */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-700 bg-slate-100 w-20"
                >
                  <div>Total Held</div>
                  <div className="text-[10px] text-slate-500 font-semibold">({totalSessionsConducted})</div>
                </th>

                {/* Total Attended */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-3 py-2 text-center font-bold text-blue-900 bg-blue-100/60 w-24"
                >
                  Total Attended
                </th>

                {/* Overall Attendance Percentage */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-900 bg-slate-100 w-20"
                >
                  Attendance %
                </th>

                {/* Defaulter Status */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-800 bg-slate-100 w-24 no-print"
                >
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={subjectColumns.length + 7}
                    className="px-4 py-8 text-center text-slate-400 font-medium"
                  >
                    No students matching the selected criteria.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const isDefaulter = student.isDefaulter;

                  return (
                    <tr
                      key={student.studentId}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isDefaulter ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* S.No */}
                      <td className="sticky left-0 bg-white z-10 border border-slate-300 px-2 py-1.5 text-center text-slate-500 font-mono text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Roll Number */}
                      <td className="sticky left-12 bg-white z-10 border border-slate-300 px-3 py-1.5 font-mono font-bold text-slate-900 shadow-[1px_0_0_0_#e2e8f0]">
                        <Link
                          href={`/admin/students/${student.studentId}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {student.rollNumber}
                        </Link>
                      </td>

                      {/* Student Name */}
                      <td className="sticky left-44 bg-white z-10 border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 shadow-[2px_0_4px_0_rgba(0,0,0,0.06)]">
                        <Link
                          href={`/admin/students/${student.studentId}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {student.fullName}
                        </Link>
                      </td>

                      {/* Subject Cells */}
                      {subjectColumns.map((col) => {
                        const attended = student.subjectAttendance?.[col.id] ?? 0;
                        const conducted = col.conducted;
                        const pct =
                          conducted > 0
                            ? Math.round((attended / conducted) * 100)
                            : null;

                        return (
                          <td
                            key={col.id}
                            className="border border-slate-300 px-2.5 py-1.5 text-center"
                          >
                            {conducted > 0 ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="font-bold text-slate-900 text-xs">
                                  {attended}
                                </span>
                                <span
                                  className={`text-[9px] font-semibold ${
                                    pct !== null && pct < 75
                                      ? "text-rose-600"
                                      : "text-slate-400"
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

                      {/* Total Held */}
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-bold text-slate-600 bg-slate-50/50">
                        {totalSessionsConducted}
                      </td>

                      {/* Total Attended */}
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-extrabold text-blue-700 bg-blue-50/30">
                        {student.attendedClasses}
                      </td>

                      {/* Attendance Percentage */}
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-black">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            isDefaulter
                              ? "bg-rose-100 text-rose-800 font-black"
                              : "text-emerald-700 font-bold"
                          }`}
                        >
                          {student.percentage !== null
                            ? `${student.percentage}%`
                            : "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="border border-slate-300 px-2.5 py-1.5 text-center no-print">
                        {isDefaulter ? (
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signature Footnote for Printed Register */}
        <div className="pt-8 grid grid-cols-3 gap-8 text-center text-xs font-bold text-slate-700 print-only">
          <div className="border-t border-slate-400 pt-2">Faculty In-Charge</div>
          <div className="border-t border-slate-400 pt-2">Head of Department (HOD)</div>
          <div className="border-t border-slate-400 pt-2">Dean / Director Academic</div>
        </div>
      </div>
    </div>
  );
}
