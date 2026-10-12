"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  Mail,
  User,
  GraduationCap,
  Calendar,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Clock,
  ShieldCheck,
  Building,
  MapPin,
  Sparkles,
  Layers,
  FileText,
  BadgePercent,
  Check,
  X,
  ExternalLink,
  Printer,
} from "lucide-react";
import StudentAttendanceLineChart from "@/components/student/StudentAttendanceLineChart";
import StudentAttendanceTranscript from "@/components/student/StudentAttendanceTranscript";

interface StudentProfileProps {
  student: {
    id: string;
    rollNumber: string;
    registerNumber?: string | null;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    bloodGroup?: string | null;
    status: string;
    admissionYear: string;
    parentName?: string | null;
    parentPhone?: string | null;
    parentEmail?: string | null;
    address?: string | null;
    casteCategory?: string | null;
    ews?: string | null;
    specialCategory?: string | null;
    state?: string | null;
    region?: string | null;
    interPercentage?: string | null;
    jeePercentile?: string | null;
    jeeRank?: string | null;
    eapcetRank?: string | null;
    tcVerified?: string | null;
    programName: string;
    programCode: string;
    schoolName: string;
    year: number;
    semester: number;
    sectionName: string;
    sectionDisplayName: string;
    labBatch?: string | null;
  };
  attendance: {
    totalHeld: number;
    totalAttended: number;
    totalAbsent: number;
    overallPercentage: number;
    isDefaulter: boolean;
    subjectBreakdown: Array<{
      subjectId: string;
      code: string;
      name: string;
      shortName: string;
      type: string;
      credits: number;
      facultyName: string;
      held: number;
      attended: number;
      absent: number;
      percentage: number;
    }>;
    attendanceLog: Array<{
      id: string;
      sessionDate: string;
      periodNumber: number;
      timing: string;
      subjectCode: string;
      subjectName: string;
      subjectShortName: string;
      facultyName: string;
      status: "PRESENT" | "ABSENT";
    }>;
  };
  canEdit: boolean;
  canDelete: boolean;
}

export default function StudentProfileClient({
  student,
  attendance,
  canEdit,
  canDelete,
}: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "attendance" | "academics" | "documents">(
    "personal"
  );
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");

  const initials = student.fullName
    ? student.fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  const filteredAttendanceLog = attendance.attendanceLog.filter((log) => {
    const matchesSearch =
      !attendanceSearch ||
      log.subjectName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      log.subjectCode.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      log.facultyName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      log.sessionDate.includes(attendanceSearch);
    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs flex-shrink-0"
            title="Back to Students Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                {student.rollNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  student.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {student.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 uppercase">
              {student.fullName}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {student.programName} • Year {student.year} Sem {student.semester} (Sec {student.sectionName})
            </p>
          </div>
        </div>

        {/* Action Call Buttons: Direct Dialpad Access on Mobile */}
        <div className="flex flex-wrap items-center gap-2">
          {student.phone ? (
            <a
              href={`tel:${student.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition shadow-xs"
              title={`Call student on ${student.phone}`}
            >
              <Phone className="w-4 h-4" />
              <span>Call Student</span>
              <span className="font-mono text-[11px] opacity-80 hidden md:inline">
                ({student.phone})
              </span>
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>No Student Phone</span>
            </button>
          )}

          {student.parentPhone ? (
            <a
              href={`tel:${student.parentPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-xs"
              title={`Call parent on ${student.parentPhone}`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Parent</span>
              <span className="font-mono text-[11px] opacity-80 hidden md:inline">
                ({student.parentPhone})
              </span>
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>No Parent Phone</span>
            </button>
          )}

          {/* Official Attendance Transcript Dossier Button */}
          <button
            type="button"
            onClick={() => setShowTranscriptModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#132E5C] active:scale-95 text-white text-xs font-bold transition shadow-xs"
            title="Open and Print Official Attendance Transcript Dossier"
          >
            <Printer className="w-4 h-4 text-blue-300" />
            <span>Attendance Transcript</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "personal"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal &amp; Admissions</span>
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "attendance"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <BadgePercent className="w-4 h-4 text-emerald-400" />
          <span>Attendance Analytics</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              attendance.overallPercentage >= 75
                ? "bg-emerald-500/20 text-emerald-600"
                : "bg-rose-500/20 text-rose-600"
            }`}
          >
            {attendance.overallPercentage}%
          </span>
        </button>
        <button
          onClick={() => setActiveTab("academics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "academics"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>Academics &amp; Exams</span>
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "documents"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Documents &amp; Fees</span>
        </button>
      </div>

      {/* =======================================================================
          TAB 1: PERSONAL & ADMISSIONS DETAILS
          ======================================================================= */}
      {activeTab === "personal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Big Size Student Photo Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center">
              {/* Big Photo Container */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center group mb-4">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-wider">
                      {initials}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase mt-2 tracking-widest">
                      {student.gender || "Student"}
                    </span>
                  </div>
                )}
              </div>

              <h2 className="text-lg font-black text-slate-900 uppercase">
                {student.fullName}
              </h2>
              <div className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl mt-1">
                PIN: {student.rollNumber}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {student.programName}
              </p>

              {/* Direct Call Pills on Card */}
              <div className="w-full grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-slate-100">
                <a
                  href={student.phone ? `tel:${student.phone}` : "#"}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-800 transition text-center"
                >
                  <Phone className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Student</span>
                  <span className="text-[11px] font-mono font-bold">{student.phone || "N/A"}</span>
                </a>
                <a
                  href={student.parentPhone ? `tel:${student.parentPhone}` : "#"}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 transition text-center"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Parent</span>
                  <span className="text-[11px] font-mono font-bold">{student.parentPhone || "N/A"}</span>
                </a>
              </div>
            </div>

            {/* Quick Summary Pill Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Admissions Summary
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Batch Year</span>
                <span className="font-bold text-slate-800 font-mono">{student.admissionYear}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Section</span>
                <span className="font-bold text-slate-800 font-mono">Sec {student.sectionName}</span>
              </div>
              {student.labBatch && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Lab Batch</span>
                  <span className="font-bold text-purple-700 font-mono">{student.labBatch}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">TC Verification</span>
                <span className="font-bold text-emerald-700">{student.tcVerified || "Verified"}</span>
              </div>
            </div>
          </div>

          {/* Right Columns: Detailed Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Placement Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Academic &amp; Program Enrollment</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Degree Program</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{student.programName}</span>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Program Code</span>
                  <span className="text-xs font-bold text-slate-900 font-mono block mt-0.5">{student.programCode}</span>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Academic Year</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">Year {student.year} • Semester {student.semester}</span>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Class Roster / Section</span>
                  <span className="text-xs font-bold text-blue-700 block mt-0.5">{student.sectionDisplayName}</span>
                </div>
              </div>
            </div>

            {/* Entrance Examinations & Prior Academics */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Entrance Exam Ranks &amp; Prior Merit</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">EAPCET Rank</span>
                  <span className="text-base font-black text-amber-900 font-mono block mt-1">
                    {student.eapcetRank || "—"}
                  </span>
                </div>
                <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-blue-700 block">JEE Main Rank</span>
                  <span className="text-base font-black text-blue-900 font-mono block mt-1">
                    {student.jeeRank || "—"}
                  </span>
                </div>
                <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">JEE Percentile</span>
                  <span className="text-base font-black text-purple-900 font-mono block mt-1">
                    {student.jeePercentile ? `${student.jeePercentile}%` : "—"}
                  </span>
                </div>
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Intermediate %</span>
                  <span className="text-base font-black text-emerald-900 font-mono block mt-1">
                    {student.interPercentage ? `${student.interPercentage}%` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Demographics, Caste & Reservations */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Demographics &amp; Category Reservation</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Caste Category</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{student.casteCategory || "General (OC)"}</span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">EWS Status</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{student.ews === "YES" ? "Eligible (YES)" : "No"}</span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Special Category</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{student.specialCategory || "None"}</span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Gender</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{student.gender || "—"}</span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Blood Group</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{student.bloodGroup || "—"}</span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">State &amp; Region</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{student.state || "Andhra Pradesh"} ({student.region || "AU"})</span>
                </div>
              </div>
            </div>

            {/* Parent & Contact Details */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Contact &amp; Guardian Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Parent / Guardian Phone</span>
                    <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{student.parentPhone || "Not Provided"}</span>
                  </div>
                  {student.parentPhone && (
                    <a
                      href={`tel:${student.parentPhone}`}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                      title="Dial parent"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Personal Phone</span>
                    <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{student.phone || "Not Provided"}</span>
                  </div>
                  {student.phone && (
                    <a
                      href={`tel:${student.phone}`}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                      title="Dial student"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Institutional Email</span>
                  <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{student.email || "—"}</span>
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Parent / Guardian Name</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{student.parentName || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: ATTENDANCE ANALYTICS & LOG
          ======================================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Top Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Conducted</span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {attendance.totalHeld}
                <span className="text-xs font-semibold text-slate-400 ml-1">Classes</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Attended</span>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                {attendance.totalAttended}
                <span className="text-xs font-semibold text-emerald-600/70 ml-1">Present</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Absent</span>
              <div className="text-2xl font-black text-rose-700 mt-1 font-mono">
                {attendance.totalAbsent}
                <span className="text-xs font-semibold text-rose-600/70 ml-1">Classes</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Aggregate Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {attendance.overallPercentage}%
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    attendance.overallPercentage >= 75
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {attendance.overallPercentage >= 75 ? "ELIGIBLE" : "DEFAULTER"}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Minimum Statutory Requirement: 75%</span>
              <span className="font-mono font-bold text-slate-900">{attendance.overallPercentage}% Achieved</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  attendance.overallPercentage >= 75 ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(attendance.overallPercentage, 100)}%` }}
              />
              {/* 75% indicator line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-700/60 z-10"
                style={{ left: "75%" }}
                title="Mandatory 75% norm"
              />
            </div>
          </div>

          {/* Student Daily Cumulative Attendance Line Graph */}
          <StudentAttendanceLineChart
            sessions={attendance.attendanceLog}
            studentName={student.fullName}
            rollNumber={student.rollNumber}
          />

          {/* Subject-Wise Breakdown Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Subject-Wise Attendance Breakdown
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Detailed compliance figures for each course offering in Semester {student.semester}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Faculty In-Charge</th>
                    <th className="py-3 px-3 text-center">Held</th>
                    <th className="py-3 px-3 text-center">Present</th>
                    <th className="py-3 px-3 text-center">Absent</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {attendance.subjectBreakdown.map((sub) => {
                    const isBelow = sub.percentage < 75.0 && sub.held > 0;
                    return (
                      <tr key={sub.subjectId} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{sub.name}</div>
                          <span className="font-mono text-[10px] text-slate-400">{sub.code}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.type === "LAB"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {sub.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {sub.facultyName}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800 font-mono">
                          {sub.held}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700 font-mono">
                          {sub.attended}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-rose-700 font-mono">
                          {sub.absent}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              isBelow
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {sub.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {sub.held === 0 ? (
                            <span className="text-slate-400 text-[10px]">No sessions</span>
                          ) : isBelow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Shortage
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Eligible
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

          {/* Daily Conducted Sessions History Log */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Daily Period Attendance Log
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Complete chronology of all sessions conducted for Section {student.sectionName}.
                </p>
              </div>

              {/* Log Filters */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by subject or date..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PRESENT">Present Only</option>
                  <option value="ABSENT">Absent Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] sticky top-0 border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Faculty</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAttendanceLog.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                        {log.sessionDate}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        Period {log.periodNumber} ({log.timing})
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {log.subjectName}{" "}
                        <span className="font-mono text-slate-400 text-[10px]">({log.subjectCode})</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {log.facultyName}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {log.status === "PRESENT" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            PRESENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <X className="w-3 h-3 text-rose-600" />
                            ABSENT
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: ACADEMICS & EXAMS (EXTENSIBLE PLACEHOLDER)
          ======================================================================= */}
      {activeTab === "academics" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-purple-600 mx-auto opacity-70" />
          <h3 className="text-base font-black text-slate-900">
            Semester 1 Curriculum &amp; Examination Module
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Mid-term examination marks, continuous evaluation assessments, and grade history
            will be configured here once examination schedules are finalized.
          </p>
        </div>
      )}

      {/* =======================================================================
          TAB 4: DOCUMENTS & FEES (EXTENSIBLE PLACEHOLDER)
          ======================================================================= */}
      {activeTab === "documents" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs space-y-3">
          <FileText className="w-12 h-12 text-amber-500 mx-auto opacity-70" />
          <h3 className="text-base font-black text-slate-900">
            Student Documents &amp; Institutional Verification
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Transfer certificates, caste certificates, admission fee vouchers, and
            identity verification documents will appear here.
          </p>
        </div>
      )}

      {/* Official Attendance Transcript Dossier Modal */}
      {showTranscriptModal && (
        <StudentAttendanceTranscript
          student={student}
          attendance={attendance}
          onClose={() => setShowTranscriptModal(false)}
        />
      )}
    </div>
  );
}
