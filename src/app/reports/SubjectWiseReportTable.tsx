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
  // Only display subjects that were actually conducted for this particular section
  const visibleSubjects = subjectColumns.filter((col) => col.conducted > 0);

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
      <div className="bg-white border border-slate-300/80 rounded-3xl p-3 sm:p-5 shadow-xs print-container space-y-5 max-w-full overflow-hidden">
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

          {/* Balancing element so header text stays centered */}
          <div className="w-16 sm:w-20 flex-shrink-0 hidden sm:block print:block" />
        </div>

        {/* Contained Table - Fit all subjects in single screen without horizontal scroll */}
        <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-300/90 shadow-2xs">
          <table className="w-full border-collapse border-slate-300 text-[11px] print-table">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-300 print:bg-slate-100">
                {/* S.No */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-1 py-1.5 text-center font-bold text-slate-800 w-8 print:w-8 print:px-1 print:py-1 print:text-[10px]"
                >
                  #
                </th>

                {/* Roll Number */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-1.5 py-1.5 text-left font-bold text-slate-800 w-28 whitespace-nowrap print:w-24 print:px-1.5 print:py-1 print:text-[10px]"
                >
                  Roll Number
                </th>

                {/* Student Name */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-1.5 py-1.5 text-left font-bold text-slate-800 print:w-36 print:px-1.5 print:py-1 print:text-[10px]"
                >
                  Student Name
                </th>

                {/* Subject Columns */}
                {visibleSubjects.map((col) => (
                  <th
                    key={col.id}
                    className="border border-slate-300 px-1 py-1 text-center bg-blue-50/50 print:px-1 print:py-1 print:bg-slate-50"
                  >
                    <div className="font-extrabold text-slate-900 tracking-tight text-[11px] sm:text-xs leading-tight print:text-[10px] print:leading-tight">
                      {col.shortName || col.code}
                    </div>
                    <div className="text-[9px] font-bold text-blue-700 mt-0.5 print:text-[10px] print:text-slate-700">
                      ({col.conducted})
                    </div>
                  </th>
                ))}

                {/* Total Conducted - Visible on screen, HIDDEN in print */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-1 py-1 text-center font-bold text-slate-700 bg-slate-100 w-14 print:hidden"
                >
                  <div className="text-[10px] sm:text-[11px]">Held</div>
                  <div className="text-[9px] text-slate-500 font-semibold">({totalSessionsConducted})</div>
                </th>

                {/* Total Attended - ALWAYS Visible in print and screen */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-1 py-1 text-center font-bold text-blue-900 bg-blue-100/60 w-14 print:w-14 print:px-1 print:py-1 print:bg-slate-100 print:text-black print:text-[11px]"
                >
                  <div className="text-[10px] sm:text-[11px]">Attended</div>
                </th>

                {/* Overall Attendance Percentage - ALWAYS Visible in print and screen */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-1 py-1 text-center font-bold text-slate-900 bg-slate-100 w-14 print:w-14 print:px-1 print:py-1 print:text-[11px]"
                >
                  <div className="text-[10px] sm:text-[11px]">%</div>
                </th>

                {/* Defaulter Status - Visible on screen, HIDDEN in print */}
                <th
                  rowSpan={2}
                  className="border border-slate-300 px-1 py-1 text-center font-bold text-slate-800 bg-slate-100 w-16 no-print print:hidden"
                >
                  <div className="text-[10px] sm:text-[11px]">Status</div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleSubjects.length + 7}
                    className="px-4 py-8 text-center text-slate-400 font-medium"
                  >
                    {totalSessionsConducted === 0
                      ? "No attendance is marked for this section."
                      : "No students matching the selected criteria."}
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
                      <td className="border border-slate-300 px-1 py-1 text-center text-slate-500 font-mono text-[10px] print:w-8 print:px-1 print:py-1 print:text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Roll Number */}
                      <td className="border border-slate-300 px-1.5 py-1 font-mono font-bold text-slate-900 whitespace-nowrap text-[11px] print:w-24 print:px-1.5 print:py-1 print:text-[10px]">
                        <Link
                          href={`/admin/students/${student.studentId}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {student.rollNumber}
                        </Link>
                      </td>

                      {/* Student Name */}
                      <td className="border border-slate-300 px-1.5 py-1 font-semibold text-slate-800 text-[11px] print:min-w-0 print:w-36 print:px-1.5 print:py-1 print:text-[10px]">
                        <Link
                          href={`/admin/students/${student.studentId}`}
                          className="block truncate max-w-[120px] sm:max-w-[150px] hover:text-blue-600 hover:underline"
                          title={student.fullName}
                        >
                          {student.fullName}
                        </Link>
                      </td>

                      {/* Subject Cells */}
                      {visibleSubjects.map((col) => {
                        const attended = student.subjectAttendance?.[col.id] ?? 0;
                        const conducted = col.conducted;
                        const pct =
                          conducted > 0
                            ? Math.round((attended / conducted) * 100)
                            : null;

                        return (
                          <td
                            key={col.id}
                            className="border border-slate-300 px-1 py-1 text-center print:px-1 print:py-1 print:text-[10px]"
                          >
                            {conducted > 0 ? (
                              <div className="flex flex-col items-center justify-center leading-tight">
                                <span className="font-bold text-slate-900 text-[11px] print:text-[11px]">
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

                      {/* Total Held - Visible on screen, HIDDEN in print */}
                      <td className="border border-slate-300 px-1 py-1 text-center font-mono font-bold text-slate-600 bg-slate-50/50 print:hidden text-[11px]">
                        {totalSessionsConducted}
                      </td>

                      {/* Total Attended - ALWAYS Visible in print and screen */}
                      <td className="border border-slate-300 px-1 py-1 text-center font-mono font-extrabold text-blue-700 bg-blue-50/30 text-[11px] print:w-14 print:px-1 print:py-1 print:text-black print:text-[11px] print:bg-slate-50">
                        {student.attendedClasses}
                      </td>

                      {/* Attendance Percentage - ALWAYS Visible in print and screen */}
                      <td className="border border-slate-300 px-1 py-1 text-center font-mono font-black text-[11px] print:w-14 print:px-1 print:py-1 print:text-[11px]">
                        <span
                          className={`px-1 py-0.5 rounded text-[10px] sm:text-[11px] print:p-0 print:text-[11px] ${
                            isDefaulter
                              ? "bg-rose-100 text-rose-800 font-black print:text-rose-700"
                              : "text-emerald-700 font-bold print:text-emerald-800"
                          }`}
                        >
                          {student.percentage !== null
                            ? `${student.percentage}%`
                            : "—"}
                        </span>
                      </td>

                      {/* Status - Visible on screen, HIDDEN in print */}
                      <td className="border border-slate-300 px-1 py-1 text-center no-print print:hidden">
                        {isDefaulter ? (
                          <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700">
                            Defaulter
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-700">
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

        {/* Official Signature Footnote for Printed Register (Strict Single Row in Print) */}
        <table className="w-full border-none mt-10 print-signatures-table print-only">
          <tbody>
            <tr>
              <td className="w-1/3 text-center border-none px-4">
                <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                  Class In-Charge / Mentor
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
