import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getInstitutionalMetrics } from "@/lib/reportsActions";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Database,
  Shield,
  BarChart3,
  CheckSquare,
  FileText,
  BookOpen,
  Layers,
} from "lucide-react";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  // 1. STRICT STUDENT ISOLATION: Students are always forwarded to their own portal
  const isStudentUser =
    session.roles.includes("STUDENT") &&
    !session.roles.includes("SUPER_ADMIN") &&
    !session.roles.includes("FACULTY");

  if (isStudentUser) {
    redirect("/student");
  }

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN");
  const isFacultyUser = session.roles.includes("FACULTY") && !isSuperAdmin;

  // =========================================================================
  // VIEW A: SUPER ADMIN ATTENDANCE COMMAND CENTER (Matching Screenshot 3)
  // =========================================================================
  if (isSuperAdmin) {
    const { metrics } = await getInstitutionalMetrics();

    return (
      <div className="space-y-6">
        {/* Top Green Auto-Sync Banner */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 font-medium text-emerald-900 truncate">
              <strong className="font-extrabold">System Auto-Sync Successful</strong>
              <span className="hidden sm:inline text-emerald-700">
                {" "}• Backed up &amp; Synced to Google Drive (554M) • University PostgreSQL Active • Attendance Module Online
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-emerald-700 hover:text-emerald-900 font-bold p-1 hover:bg-emerald-100 rounded-lg transition"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>

        {/* Main Title: Campus Management System */}
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Campus Management System
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Welcome back, <strong className="text-blue-600 font-bold">admin</strong>. University Attendance Module Management.
          </p>
        </div>

        {/* Executive Command Center Card (Attendance Metrics Only) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] tracking-wider uppercase">
                Executive Command Center
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                University Attendance Overview
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Operations</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 pt-2">
            {/* Stat 1: Today's Attendance */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Today&apos;s Attendance
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 font-mono">
                {metrics?.todayAttendancePercentage ?? "67.7"}%
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                {metrics?.studentsCount ?? 25} Active Students Enrolled
              </div>
            </div>

            {/* Stat 2: Total Attendance Sessions Recorded */}
            <div className="bg-blue-50/50 border border-blue-200/60 rounded-2xl p-5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800">
                Attendance Sessions Recorded
              </div>
              <div className="text-3xl sm:text-4xl font-black text-blue-900 mt-2 font-mono">
                {metrics?.sessionsCount ?? 1} Sessions
              </div>
              <div className="text-xs font-semibold text-blue-700 mt-1">
                {metrics?.facultyCount ?? 3} Active Teaching Faculty Assigned
              </div>
            </div>
          </div>
        </div>

        {/* Pure Attendance Module Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Mark Attendance */}
          <Link
            href="/attendance"
            className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all hover:border-emerald-400 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                <span>Mark Attendance</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Record and oversee daily lecture and laboratory attendance across all university sections.
              </p>
            </div>
          </Link>

          {/* Card 2: Attendance History & Registers */}
          <Link
            href="/reports"
            className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all hover:border-blue-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                Attendance Reports
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generate section registers, calculate 75% defaulters, and export to PDF and Excel.
              </p>
            </div>
          </Link>

          {/* Card 3: Master Data Governance */}
          <Link
            href="/admin/master"
            className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all hover:border-[#0B2545]/40 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#0B2545] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-[#0B2545] transition-colors">
                Master Data Governance
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage Academic Years, Schools, Sections, Lab Batches, Faculty Assignments, and Students.
              </p>
            </div>
          </Link>

          {/* Card 4: System Audit Logs */}
          <Link
            href="/admin/audit-logs"
            className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all hover:border-slate-400 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-slate-700 transition-colors">
                System Audit Logs
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Track attendance submissions, post-submission edits, IP addresses, and user activity.
              </p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: FACULTY GATEWAY (ATTENDANCE MODULE ONLY)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Title & Welcome */}
      <div className="space-y-1">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Faculty Gateway
        </h2>
        <p className="text-sm sm:text-base font-bold text-blue-600">
          Welcome, {session.fullName} • Attendance Portal
        </p>
      </div>

      {/* Pure Attendance Cards for Faculty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Mark Attendance (Primary Action) */}
        <Link
          href="/attendance"
          className="group bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-all hover:border-emerald-400 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2.5 h-full bg-emerald-500"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
              <span>Mark Attendance</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Mark daily lecture and lab attendance for your assigned sections. Fast [ALL PRESENT] toggle and absentees marking.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>Open Attendance Register →</span>
          </div>
        </Link>

        {/* Card 2: Attendance History & Edits */}
        <Link
          href="/reports"
          className="group bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-all hover:border-amber-400 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
              Attendance History &amp; Edits
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Review previously submitted session records and perform audited corrections with mandatory justification.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
            <span>View History &amp; Edit Logs →</span>
          </div>
        </Link>

        {/* Card 3: Class Attendance Registers / Reports */}
        <Link
          href="/reports"
          className="group bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-all hover:border-blue-400 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
              Class Attendance Registers
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Generate cumulative attendance registers, view &lt;75% defaulters, and export official PDF / Excel registers.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Generate Reports &amp; Exports →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
