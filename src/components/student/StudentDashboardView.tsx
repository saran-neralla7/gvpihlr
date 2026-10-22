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
  Printer,
  FileText,
  FileSpreadsheet,
  Lock,
  Unlock,
} from "lucide-react";
import StudentAttendanceLineChart from "./StudentAttendanceLineChart";
import StudentAttendanceTranscript from "./StudentAttendanceTranscript";
import StudentAdmissionProfile from "./StudentAdmissionProfile";

interface SubjectAttendance {
  subjectName: string;
  subjectCode: string;
  conducted: number;
  attended: number;
}

interface SessionLogItem {
  id: string;
  date: string;
  sessionDate?: string;
  period: number;
  periodNumber?: number;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  status: string;
}

interface StudentDashboardViewProps {
  student: {
    id?: string;
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
    isProfileEditAllowed?: boolean;
  };
  admissionData?: any;
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
  admissionData,
  attendanceSummary,
}: StudentDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"attendance" | "overview" | "admission">("attendance");
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  // Map subjects for official transcript
  const transcriptBreakdown = attendanceSummary.subjects.map((sub, idx) => ({
    subjectId: `sub-${idx}`,
    code: sub.subjectCode,
    name: sub.subjectName,
    type: "THEORY",
    facultyName: "Faculty In-Charge",
    held: sub.conducted,
    attended: sub.attended,
    absent: sub.conducted - sub.attended,
    percentage: sub.conducted > 0 ? parseFloat(((sub.attended / sub.conducted) * 100).toFixed(1)) : 0,
  }));

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

          {/* Nav Items */}
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

            <button
              onClick={() => setActiveTab("admission")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                activeTab === "admission"
                  ? "bg-[#dc2626] text-white shadow-md shadow-rose-900/30 font-extrabold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Admission Details</span>
              </div>
              {student.isProfileEditAllowed ? (
                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                  <Unlock className="w-2.5 h-2.5" /> Edit
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 font-medium">
                  <Lock className="w-2.5 h-2.5" /> Lock
                </span>
              )}
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
      <div className="flex-1 w-full space-y-6">
        {/* TAB 1: ATTENDANCE DASHBOARD */}
        {activeTab === "attendance" && (
          <>
            {/* Top Stat Ribbon matching Exact Design */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                    attendanceSummary.isDefaulter
                      ? "bg-rose-500 text-white"
                      : "bg-[#16a34a] text-white"
                  }`}
                >
                  {attendanceSummary.overallPercentage}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Aggregate Attendance
                    </h2>
                    {attendanceSummary.isDefaulter ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        Defaulter (&lt;75%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Eligible
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Academic Year {student.academicYear} • Class {student.sectionName}
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-start">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Total Classes
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {attendanceSummary.totalClasses}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Attended
                  </div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">
                    {attendanceSummary.attendedClasses}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Missed
                  </div>
                  <div className="text-xl font-black text-rose-600 mt-0.5">
                    {attendanceSummary.absentClasses}
                  </div>
                </div>
              </div>

              {/* View/Print Transcript Button */}
              <button
                onClick={() => setShowTranscriptModal(true)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-xl text-xs font-bold transition shadow-xs flex-shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Dossier</span>
              </button>
            </div>

            {/* Attendance Trajectory Graph (Visual Sparkle) */}
            <StudentAttendanceLineChart
              sessions={attendanceSummary.sessions.map((s) => ({
                id: s.id,
                sessionDate: s.sessionDate || s.date,
                periodNumber: s.period || s.periodNumber,
                subjectName: s.subjectName,
                status: s.status,
              }))}
            />

            {/* Subject-Wise Breakdown Table */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Course Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Your attendance percentage across all enrolled subjects
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {attendanceSummary.subjects.length} Subjects Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Course</th>
                      <th className="py-3 px-3 text-center">Conducted</th>
                      <th className="py-3 px-3 text-center">Attended</th>
                      <th className="py-3 px-3 text-center">Missed</th>
                      <th className="py-3 px-3 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {attendanceSummary.subjects.map((sub, idx) => {
                      const pct =
                        sub.conducted > 0
                          ? ((sub.attended / sub.conducted) * 100).toFixed(1)
                          : "0.0";
                      const isLow = parseFloat(pct) < 75.0 && sub.conducted > 0;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 text-xs">
                              {sub.subjectName}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {sub.subjectCode}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {sub.conducted}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-emerald-600">
                            {sub.attended}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-rose-600">
                            {sub.conducted - sub.attended}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <span
                                className={`font-black font-mono ${
                                  isLow ? "text-rose-600" : "text-[#16a34a]"
                                }`}
                              >
                                {pct}%
                              </span>
                              {isLow && (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 inline" />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attendance Activity History */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Attendance History
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Verified session log recordings for your section
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Showing recent {attendanceSummary.sessions.length} periods
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Faculty In-Charge</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {attendanceSummary.sessions.map((sess) => {
                      const isPresent =
                        sess.status === "PRESENT" || sess.status === "ON_DUTY";
                      return (
                        <tr key={sess.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {sess.date}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            Period {sess.period}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900">
                              {sess.subjectName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 ml-1.5">
                              ({sess.subjectCode})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {sess.facultyName}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isPresent ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: GENERAL STUDENT PROFILE */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900">
                Enrollment Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Roll Number
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {student.rollNumber}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Program
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {student.programName}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Class & Section
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    Year {student.year} – Sem {student.semester} ({student.sectionName})
                  </div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Gender
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {student.gender || "Not specified"}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                    Date of Birth
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {student.dateOfBirth || "—"}
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

        {/* TAB 3: ADMISSION DETAILS & SELF-SERVICE FORM */}
        {activeTab === "admission" && (
          <StudentAdmissionProfile
            initialData={admissionData || { rollNumber: student.rollNumber, fullName: student.fullName }}
            isEditable={!!student.isProfileEditAllowed}
          />
        )}
      </div>

      {/* Official Attendance Transcript Dossier Modal */}
      {showTranscriptModal && (
        <StudentAttendanceTranscript
          student={{
            ...student,
            rollNumber: student.rollNumber,
          }}
          attendance={{
            totalHeld: attendanceSummary.totalClasses,
            totalAttended: attendanceSummary.attendedClasses,
            totalAbsent: attendanceSummary.absentClasses,
            overallPercentage: parseFloat(attendanceSummary.overallPercentage) || 0,
            isDefaulter: attendanceSummary.isDefaulter,
            subjectBreakdown: transcriptBreakdown,
          }}
          onClose={() => setShowTranscriptModal(false)}
        />
      )}
    </div>
  );
}
