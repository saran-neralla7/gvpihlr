"use client";

import { useState } from "react";
import {
  User,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Layers,
  Bookmark,
  CalendarCheck,
  Clock,
} from "lucide-react";

interface SubjectAttendance {
  subjectName: string;
  subjectCode: string;
  conducted: number;
  attended: number;
}

interface SessionLogItem {
  id: string;
  date: string;
  period: number;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  status: string;
}

interface StudentDashboardViewProps {
  student: {
    fullName: string;
    rollNumber: string;
    programName: string;
    sectionName: string;
    year: number;
    semester: number;
    academicYear: string;
    email?: string;
    phone?: string;
    parentPhone?: string;
    parentName?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    labBatchName?: string;
  };
  attendanceSummary: {
    overallPercentage: string;
    isDefaulter: boolean;
    totalClasses: number;
    attendedClasses: number;
    absentClasses: number;
    subjects: SubjectAttendance[];
    sessions: SessionLogItem[];
  };
}

export default function StudentDashboardView({
  student,
  attendanceSummary,
}: StudentDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"attendance" | "overview">("attendance");

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* =========================================================================
          LEFT SIDEBAR (Attendance & Profile Only)
          ========================================================================= */}
      <aside className="w-full lg:w-72 bg-[#111827] text-white rounded-3xl p-5 shadow-xl flex-shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* User Identifier */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Logged in as
            </span>
            <div className="text-xl font-black text-white mt-0.5 tracking-wider font-mono">
              {student.rollNumber}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-semibold truncate">
              {student.fullName}
            </div>
          </div>

          {/* Nav Items (Attendance Focused Only) */}
          <nav className="space-y-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "attendance"
                  ? "bg-[#dc2626] text-white shadow-md shadow-rose-900/30 font-extrabold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Attendance Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "overview"
                  ? "bg-[#dc2626] text-white shadow-md shadow-rose-900/30 font-extrabold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Profile</span>
            </button>
          </nav>
        </div>

        {/* Bottom Lab Batch Section (Relevant to Attendance) */}
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Assigned Lab Batch</span>
          </div>
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
            <div className="text-[11px] text-slate-400 font-semibold">
              Year {student.year} – Semester {student.semester}
            </div>
            <div className="text-white font-bold mt-1 text-sm">
              {student.labBatchName || "Batch 1 (CSE-A)"}
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div className="flex-1 w-full space-y-6 min-w-0">
        {/* Top Profile Header Card */}
        <div className="bg-gradient-to-r from-rose-50/50 via-white to-white border border-rose-100 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Student Avatar + Identity Details */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white shadow-md flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden select-none">
                👨‍🎓
              </div>

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight truncate">
                  {student.fullName}
                </h2>
                <div className="text-base sm:text-lg font-black text-[#dc2626] font-mono mt-0.5">
                  {student.rollNumber}
                </div>

                {/* Badges Row */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 font-bold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Year {student.year}-{student.semester}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 font-bold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Section {student.sectionName}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold">
                    <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{student.programName}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Pill Action Buttons (Attendance Focused Only) */}
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab("attendance")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-xs text-center whitespace-nowrap ${
                  activeTab === "attendance"
                    ? "bg-[#dc2626] text-white shadow-rose-900/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Attendance Details
              </button>

              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-xs text-center whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-[#dc2626] text-white shadow-rose-900/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Profile Overview
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: ATTENDANCE DETAILS (Primary Focus)
            ========================================================================= */}
        {activeTab === "attendance" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Overall Attendance Metric Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Overall Attendance Health
                  </div>
                  <div className="text-5xl font-black text-slate-900 mt-2 font-mono">
                    {attendanceSummary.totalClasses > 0 ? `${attendanceSummary.overallPercentage}%` : "—"}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  {attendanceSummary.totalClasses === 0 ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>No attendance sessions recorded yet</span>
                    </div>
                  ) : attendanceSummary.isDefaulter ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>Below 75% — Attendance Condonation Warning</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Eligible for Examinations (≥ 75%)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Statistics Counter Cards */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Conducted Classes
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                    {attendanceSummary.totalClasses}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">Total Sessions</div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                    Attended Classes
                  </div>
                  <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">
                    {attendanceSummary.attendedClasses}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">Present</div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
                    Absent Classes
                  </div>
                  <div className="text-3xl font-black text-rose-600 mt-2 font-mono">
                    {attendanceSummary.absentClasses}
                  </div>
                  <div className="text-[11px] text-rose-700 font-medium mt-1">Leaves &amp; Absences</div>
                </div>
              </div>
            </div>

            {/* Subject-Wise Attendance Breakdown Table */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
                <span>Subject-Wise Attendance Breakdown</span>
                <span className="text-xs text-slate-400 font-medium">Academic Year {student.academicYear}</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3">Subject</th>
                      <th className="py-3 px-3 text-center">Conducted</th>
                      <th className="py-3 px-3 text-center">Attended</th>
                      <th className="py-3 px-3 text-center">Percentage</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceSummary.subjects.map((sub, idx) => {
                      const pct =
                        sub.conducted > 0
                          ? ((sub.attended / sub.conducted) * 100).toFixed(1)
                          : "-";
                      const isLow = pct !== "-" && parseFloat(pct) < 75.0;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{sub.subjectName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{sub.subjectCode}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {sub.conducted}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-600">
                            {sub.attended}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                            {pct !== "-" ? `${pct}%` : "—"}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                pct === "-"
                                  ? "bg-slate-100 text-slate-600 border border-slate-200"
                                  : isLow
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {pct === "-" ? "Not Started" : isLow ? "Shortage" : "Good"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session History Log */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900">
                Personal Session Attendance Log
              </h3>

              <div className="space-y-2">
                {attendanceSummary.sessions.length > 0 ? (
                  attendanceSummary.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {sess.subjectName} ({sess.subjectCode})
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                          <span>{sess.date}</span>
                          <span>•</span>
                          <span>Period {sess.period}</span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                          sess.status === "PRESENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : sess.status === "ON_DUTY"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {sess.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium">
                    No session logs found for this student.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PROFILE OVERVIEW
            ========================================================================= */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Card 1: Personal Details */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
              <h3 className="text-base font-black text-slate-900">
                Personal Details
              </h3>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Date of Birth
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {student.dateOfBirth || "15-08-2005"}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Gender
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {student.gender || "Male"}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Address
                  </div>
                  <div className="text-slate-700 font-medium mt-0.5">
                    {student.address || "Visakhapatnam, Andhra Pradesh – 530048"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Information */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900">
                Contact Information
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Domain Mail ID
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {student.rollNumber}@gvpihlr.edu.in
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                      Student Mobile
                    </div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {student.phone || "+91 9848011014"}
                    </div>
                  </div>

                  <div>
                    <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                      Parent Mobile
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {student.parentPhone || "9246678968"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
