"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Shield,
  Activity,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  Laptop,
  Flame,
  AlertOctagon,
  Sparkles,
} from "lucide-react";

interface Topic {
  id: string;
  unitNumber: number;
  topicTitle: string;
  topicSequence: number;
  plannedDate: string;
  actualDate?: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  deliveryMode?: string | null;
  remarks?: string | null;
}

interface Assignment {
  id: string;
  faculty: {
    user: { fullName: string; email?: string | null };
    department?: { id: string; name: string; code: string } | null;
  };
  section: {
    id: string;
    name: string;
    program: { id: string; name: string; school?: { name: string } | null };
    academicYear: { code: string };
  };
  subjectOffering: {
    subject: {
      id: string;
      code: string;
      name: string;
      credits: number;
      department?: { id: string; name: string; code: string } | null;
      questionBankItems: any[];
    };
  };
  lecturePlanTopics: Topic[];
  courseMaterials: any[];
  courseQuizzes: any[];
}

interface TelemetryLog {
  id: string;
  studentId: string;
  category: string;
  action: string;
  metadata?: any;
  deviceType?: string | null;
  deviceSummary?: string | null;
  browser?: string | null;
  os?: string | null;
  ipAddress?: string | null;
  dwellTimeSeconds?: number | null;
  createdAt: string;
  student: {
    rollNumber: string;
    user: { fullName: string };
  };
}

export default function LmsAdminClient({
  assignments,
  telemetryLogs,
}: {
  assignments: Assignment[];
  telemetryLogs: TelemetryLog[];
}) {
  const [activeTab, setActiveTab] = useState<"speedometer" | "telemetry">("speedometer");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  // Telemetry Filters
  const [telemetryCategory, setTelemetryCategory] = useState<string>("ALL");
  const [telemetrySearch, setTelemetrySearch] = useState<string>("");

  // Extract unique departments
  const departments = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of assignments) {
      const dept = a.faculty.department || a.subjectOffering.subject.department;
      if (dept) {
        map.set(dept.name, dept.name);
      }
    }
    return Array.from(map.values());
  }, [assignments]);

  // Aggregate University Metrics
  const stats = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    let totalMaterials = 0;
    let totalQuestions = 0;
    let totalQuizzes = 0;
    let totalQuizAttempts = 0;

    for (const a of assignments) {
      totalTopics += a.lecturePlanTopics.length;
      completedTopics += a.lecturePlanTopics.filter((t) => t.status === "COMPLETED").length;
      totalMaterials += a.courseMaterials.length;
      totalQuestions += a.subjectOffering.subject.questionBankItems.length;
      totalQuizzes += a.courseQuizzes.length;
      for (const q of a.courseQuizzes) {
        totalQuizAttempts += q.attempts?.length || 0;
      }
    }

    const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    let onTrackCount = 0;
    let moderateCount = 0;
    let delayedCount = 0;

    for (const a of assignments) {
      const t = a.lecturePlanTopics.length;
      const c = a.lecturePlanTopics.filter((x) => x.status === "COMPLETED").length;
      const pct = t > 0 ? (c / t) * 100 : 0;
      if (pct >= 75) onTrackCount++;
      else if (pct >= 50) moderateCount++;
      else delayedCount++;
    }

    return {
      totalTopics,
      completedTopics,
      overallPct,
      totalMaterials,
      totalQuestions,
      totalQuizzes,
      totalQuizAttempts,
      onTrackCount,
      moderateCount,
      delayedCount,
    };
  }, [assignments]);

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const dept = a.faculty.department?.name || a.subjectOffering.subject.department?.name || "";
      const matchesDept = selectedDept === "ALL" || dept === selectedDept;

      const sub = a.subjectOffering.subject;
      const matchesSearch =
        searchQuery === "" ||
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.faculty.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.section.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDept && matchesSearch;
    });
  }, [assignments, selectedDept, searchQuery]);

  // Filtered Telemetry Logs
  const filteredTelemetry = useMemo(() => {
    return telemetryLogs.filter((log) => {
      const matchesCat =
        telemetryCategory === "ALL" ||
        log.category === telemetryCategory ||
        (telemetryCategory === "ALERTS" &&
          (log.action.includes("TAKEOVER") ||
            log.action.includes("BLUR") ||
            log.action.includes("TAB_SWITCH") ||
            log.metadata?.tabSwitchesCount > 0));

      const matchesSearch =
        telemetrySearch === "" ||
        log.student.rollNumber.toLowerCase().includes(telemetrySearch.toLowerCase()) ||
        log.student.user.fullName.toLowerCase().includes(telemetrySearch.toLowerCase()) ||
        log.action.toLowerCase().includes(telemetrySearch.toLowerCase()) ||
        (log.deviceSummary && log.deviceSummary.toLowerCase().includes(telemetrySearch.toLowerCase()));

      return matchesCat && matchesSearch;
    });
  }, [telemetryLogs, telemetryCategory, telemetrySearch]);

  // Export Telemetry to CSV
  const handleExportTelemetryCSV = () => {
    const headers = [
      "Timestamp",
      "Roll Number",
      "Student Name",
      "Category",
      "Action",
      "Device Summary",
      "Browser",
      "OS",
      "IP Address",
      "Dwell Seconds",
      "Metadata Details",
    ];

    const rows = filteredTelemetry.map((log) => [
      `"${new Date(log.createdAt).toLocaleString()}"`,
      `"${log.student.rollNumber}"`,
      `"${log.student.user.fullName.replace(/"/g, '""')}"`,
      `"${log.category}"`,
      `"${log.action}"`,
      `"${log.deviceSummary || ""}"`,
      `"${log.browser || ""}"`,
      `"${log.os || ""}"`,
      `"${log.ipAddress || ""}"`,
      log.dwellTimeSeconds || 0,
      `"${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_telemetry_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* =========================================================================
          TOP BANNER
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Academic Governance &amp; Telemetry Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            LMS &amp; Syllabus Speedometer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time syllabus completion analytics, courseware deployment, and student audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Hub</span>
          </Link>
          <Link
            href="/faculty/lms"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Faculty LMS Studio</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          SPEEDOMETER & KPI HIGHLIGHTS
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Speedometer Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
              University Syllabus Speedometer
            </span>
            <div className="text-4xl font-black text-white mt-1">
              {stats.overallPct}%
            </div>
            <p className="text-xs text-slate-300 mt-1">
              <strong className="text-emerald-400">{stats.completedTopics}</strong> of {stats.totalTopics} curriculum topics marked complete across all departments.
            </p>

            <div className="flex items-center gap-4 mt-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {stats.onTrackCount} On Track (&ge;75%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {stats.moderateCount} Moderate
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                {stats.delayedCount} Delayed
              </span>
            </div>
          </div>

          {/* Speedometer Gauge Visual */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                stroke="currentColor"
                strokeWidth="8"
                className={`transition-all duration-1000 ${
                  stats.overallPct >= 75
                    ? "text-emerald-400"
                    : stats.overallPct >= 50
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
                fill="transparent"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * stats.overallPct) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <Flame
                className={`w-5 h-5 ${
                  stats.overallPct >= 75 ? "text-emerald-400" : "text-amber-400"
                }`}
              />
              <span className="text-xs font-extrabold text-white mt-0.5">
                {stats.overallPct >= 75 ? "ON TRACK" : "IN REVIEW"}
              </span>
            </div>
          </div>
        </div>

        {/* Course Materials & Question Bank Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Digital Repository</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{stats.totalMaterials}</div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Course Material PDFs Published
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Question Bank:</span>
            <span className="text-indigo-600 font-extrabold">{stats.totalQuestions} Questions</span>
          </div>
        </div>

        {/* CBT Quizzes & Student Attempts Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Continuous Assessment</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{stats.totalQuizzes}</div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Active CBT Section Quizzes</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Student Attempts:</span>
            <span className="text-purple-600 font-extrabold">{stats.totalQuizAttempts} Evaluated</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW SWITCHER TABS
          ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("speedometer")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "speedometer"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-extrabold"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Syllabus Coverage Speedometer (HOD View)</span>
        </button>

        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "telemetry"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-extrabold"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Student Activity Telemetry ({telemetryLogs.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SYLLABUS SPEEDOMETER & SUBJECT DRILLDOWN
          ========================================================================= */}
      {activeTab === "speedometer" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject, faculty, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Department:
              </span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">Course Coverage Matrix</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Showing {filteredAssignments.length} course offerings
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-6">Course &amp; Code</th>
                    <th className="py-3.5 px-4">Faculty In-Charge</th>
                    <th className="py-3.5 px-4">Class Section</th>
                    <th className="py-3.5 px-4 text-center">Unit Progress (1-5)</th>
                    <th className="py-3.5 px-4 text-center">Coverage %</th>
                    <th className="py-3.5 px-4 text-center">Speedometer</th>
                    <th className="py-3.5 px-6 text-right">Drilldown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredAssignments.map((a) => {
                    const sub = a.subjectOffering.subject;
                    const cTopics = a.lecturePlanTopics.filter(
                      (t) => t.status === "COMPLETED"
                    ).length;
                    const tTopics = a.lecturePlanTopics.length;
                    const pct = tTopics > 0 ? Math.round((cTopics / tTopics) * 100) : 0;
                    const isExpanded = expandedSubjectId === a.id;

                    const statusBadge =
                      pct >= 75 ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                          ON TRACK
                        </span>
                      ) : pct >= 50 ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[10px] border border-amber-200">
                          MODERATE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-extrabold text-[10px] border border-rose-200">
                          ATTENTION
                        </span>
                      );

                    return (
                      <>
                        <tr
                          key={a.id}
                          className="hover:bg-slate-50/70 transition cursor-pointer"
                          onClick={() => setExpandedSubjectId(isExpanded ? null : a.id)}
                        >
                          <td className="py-4 px-6">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px]">
                              {sub.code}
                            </span>
                            <div className="font-bold text-slate-900 mt-1">{sub.name}</div>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {sub.credits} Credits • {a.courseMaterials.length} PDFs • {a.courseQuizzes.length} Quizzes
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-800">{a.faculty.user.fullName}</div>
                            <span className="text-[10px] text-slate-400">
                              {a.faculty.department?.name || "Department"}
                            </span>
                          </td>

                          <td className="py-4 px-4 font-mono font-bold text-slate-800">
                            {a.section.name}
                          </td>

                          {/* Unit 1-5 Mini Bars */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((u) => {
                                const uTopics = a.lecturePlanTopics.filter(
                                  (t) => t.unitNumber === u
                                );
                                const uComp = uTopics.filter(
                                  (t) => t.status === "COMPLETED"
                                ).length;
                                const isFull = uTopics.length > 0 && uComp === uTopics.length;
                                const isPart = uComp > 0 && uComp < uTopics.length;

                                return (
                                  <div
                                    key={u}
                                    title={`Unit ${u}: ${uComp}/${uTopics.length} completed`}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                                      isFull
                                        ? "bg-emerald-500 text-white"
                                        : isPart
                                        ? "bg-amber-400 text-slate-900"
                                        : uTopics.length > 0
                                        ? "bg-slate-200 text-slate-600"
                                        : "bg-slate-100 text-slate-300"
                                    }`}
                                  >
                                    U{u}
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center font-mono font-black text-slate-900">
                            {pct}%
                            <span className="block text-[10px] font-medium text-slate-400">
                              ({cTopics}/{tTopics})
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center">{statusBadge}</td>

                          <td className="py-4 px-6 text-right">
                            <button className="text-slate-400 hover:text-indigo-600 p-1">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Topic-by-Topic Drilldown */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90">
                            <td colSpan={7} className="p-6">
                              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                                    Unit Syllabus Delivery Log • {sub.name} ({a.section.name})
                                  </h4>
                                  <span className="text-xs text-slate-500">
                                    Faculty In-Charge: <strong>{a.faculty.user.fullName}</strong>
                                  </span>
                                </div>

                                {a.lecturePlanTopics.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic py-2">
                                    No lecture plan topics registered for this offering yet.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    {a.lecturePlanTopics.map((topic, idx) => (
                                      <div
                                        key={topic.id}
                                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                                      >
                                        <div>
                                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[9px] font-bold mr-2">
                                            U{topic.unitNumber}
                                          </span>
                                          <span className="font-bold text-slate-800">
                                            {topic.topicTitle}
                                          </span>
                                          <div className="text-[10px] text-slate-400 mt-0.5">
                                            Planned: {new Date(topic.plannedDate).toLocaleDateString()}
                                            {topic.deliveryMode && <span> • {topic.deliveryMode}</span>}
                                            {topic.actualDate && (
                                              <span> • Completed {new Date(topic.actualDate).toLocaleDateString()}</span>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          {topic.status === "COMPLETED" ? (
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                              <CheckCircle2 className="w-3 h-3" /> Done
                                            </span>
                                          ) : topic.status === "IN_PROGRESS" ? (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                              In Progress
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px]">
                                              Planned
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: STUDENT TELEMETRY & AUDIT STREAM
          ========================================================================= */}
      {activeTab === "telemetry" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search roll number, action, device..."
                value={telemetrySearch}
                onChange={(e) => setTelemetrySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">Category:</span>
                <select
                  value={telemetryCategory}
                  onChange={(e) => setTelemetryCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Events</option>
                  <option value="AUTHENTICATION">Authentication &amp; Sessions</option>
                  <option value="MATERIAL_ACCESS">Material Reads &amp; Downloads</option>
                  <option value="ONLINE_QUIZ">Online Quiz Events</option>
                  <option value="QUIZ_PROCTORING">Anti-Cheat Proctor Alerts</option>
                  <option value="ALERTS">Proctor Warnings &amp; Takeovers</option>
                </select>
              </div>

              <button
                onClick={handleExportTelemetryCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Telemetry Log Stream Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">Student Telemetry Feed</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Showing {filteredTelemetry.length} recent granular student events
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Category &amp; Action</th>
                    <th className="py-3.5 px-4">Device &amp; Browser</th>
                    <th className="py-3.5 px-4">IP Address</th>
                    <th className="py-3.5 px-6 text-right">Details &amp; Audit Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredTelemetry.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        No telemetry events matching the current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTelemetry.map((log) => {
                      const isAlert =
                        log.action.includes("TAKEOVER") ||
                        log.action.includes("BLUR") ||
                        log.action.includes("TAB_SWITCH") ||
                        log.metadata?.tabSwitchesCount > 0;

                      return (
                        <tr
                          key={log.id}
                          className={`hover:bg-slate-50/70 transition ${
                            isAlert ? "bg-rose-50/30" : ""
                          }`}
                        >
                          <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900">
                              {log.student.rollNumber}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {log.student.user.fullName}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] block w-fit">
                              {log.category}
                            </span>
                            <span className="font-mono font-extrabold text-xs text-slate-900 mt-1 block">
                              {log.action}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                              {log.deviceType === "MOBILE" ? (
                                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                              ) : log.deviceType === "TABLET" ? (
                                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>{log.deviceSummary || "Browser Session"}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {log.browser || "Browser"} • {log.os || "OS"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {log.ipAddress || "Internal"}
                          </td>

                          <td className="py-3.5 px-6 text-right">
                            {isAlert ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">
                                <AlertOctagon className="w-3 h-3" /> Integrity Alert
                              </span>
                            ) : log.metadata?.title ? (
                              <span className="text-slate-600 text-xs truncate max-w-xs inline-block">
                                {log.metadata.title}
                              </span>
                            ) : log.metadata?.score !== undefined ? (
                              <span className="text-emerald-600 font-bold text-xs">
                                Score: {log.metadata.score}/{log.metadata.totalMarks}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Logged</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
