"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Building2,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Filter,
  Layers,
  Sparkles,
  BarChart3,
  CalendarDays,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  DailyAnalyticsResult,
  SectionDayStat,
  HourlySessionStat,
  getDailyAttendanceAnalytics,
} from "@/lib/dailyAnalyticsActions";

interface DailyAnalyticsClientProps {
  initialData: DailyAnalyticsResult;
}

export default function DailyAnalyticsClient({
  initialData,
}: DailyAnalyticsClientProps) {
  const [data, setData] = useState<DailyAnalyticsResult>(initialData);
  const [selectedDate, setSelectedDate] = useState<string>(initialData.selectedDate);
  const [selectedSchool, setSelectedSchool] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "CONDUCTED" | "UNMARKED">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSectionModal, setActiveSectionModal] = useState<SectionDayStat | null>(null);
  const [activeHourIndex, setActiveHourIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle Date Change
  const handleDateChange = (newDateStr: string) => {
    if (!newDateStr || newDateStr === selectedDate) return;
    setSelectedDate(newDateStr);
    startTransition(async () => {
      const res = await getDailyAttendanceAnalytics(newDateStr);
      if (res.success) {
        setData(res);
        // If modal is currently open, refresh its data
        if (activeSectionModal) {
          const updated = res.sections.find((s) => s.sectionId === activeSectionModal.sectionId);
          setActiveSectionModal(updated || null);
        }
      }
    });
  };

  // Filter sections
  const filteredSections = data.sections.filter((s) => {
    // School filter
    if (selectedSchool !== "ALL" && s.schoolCode !== selectedSchool && s.schoolId !== selectedSchool) {
      return false;
    }

    // Status filter
    if (selectedStatus === "CONDUCTED" && !s.isMarked) return false;
    if (selectedStatus === "UNMARKED" && s.isMarked) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.sectionName.toLowerCase().includes(q);
      const matchDisp = s.displayName.toLowerCase().includes(q);
      const matchProg = s.programName.toLowerCase().includes(q);
      const matchSchool = s.schoolName.toLowerCase().includes(q);
      if (!matchName && !matchDisp && !matchProg && !matchSchool) return false;
    }

    return true;
  });

  // Format date display
  const formattedDateTitle = (() => {
    if (!selectedDate) return "Today";
    const d = new Date(`${selectedDate}T00:00:00`);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BANNER: Day-Wise Attendance Analytics
          ========================================================================= */}
      <div className="bg-gradient-to-r from-[#0F2C59] via-[#163A70] to-[#0B2545] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-black tracking-wide border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>DAILY ATTENDANCE COMMAND &amp; DRILLDOWN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Day-Wise Section Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
            Monitor daily present &amp; absent student counts across all sections on any selected date.
            Click any section to inspect period-wise hour-by-hour attendance and absent roll numbers.
          </p>
        </div>

        {/* Date Selector Header Control */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex flex-col gap-2 w-full md:w-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">
            Selected Attendance Date
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-white text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xs cursor-pointer"
            />
            {isPending && (
              <span className="text-xs font-semibold text-amber-300 animate-pulse">
                Loading...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          QUICK DATE JUMP CHIPS (Recent Days with Sessions)
          ========================================================================= */}
      {data.availableDates && data.availableDates.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>Quick Jump to Recent Attendance Dates:</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Showing active session records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {data.availableDates.slice(0, 8).map((d) => {
              const isSelected = d.date === selectedDate;
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => handleDateChange(d.date)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#0F2C59] text-white shadow-xs ring-2 ring-blue-500/30"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{d.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {d.sessionCount} sessions
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          KPI SUMMARY BANNER (Overall Stats for Selected Date)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Sections Monitored */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sections Monitored
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {data.summary.conductedSections} / {data.summary.totalSections}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {data.summary.totalSections} total in scope
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Enrolled Students
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {data.summary.totalEnrolledOverall.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            Across active sections
          </div>
        </div>

        {/* Students Present Today */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Present Today</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {data.summary.totalPresentOverall.toLocaleString()}
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
            {data.summary.overallPercentage}% present rate
          </div>
        </div>

        {/* Students Absent Today */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
            <UserX className="w-3.5 h-3.5 text-rose-600" />
            <span>Absent Today</span>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {data.summary.totalAbsentOverall.toLocaleString()}
          </div>
          <div className="text-[11px] font-bold text-rose-600 mt-0.5">
            {data.summary.totalEnrolledOverall > 0
              ? (
                  (data.summary.totalAbsentOverall /
                    data.summary.totalEnrolledOverall) *
                  100
                ).toFixed(1)
              : 0}
            % absence rate
          </div>
        </div>

        {/* Overall Day Attendance % */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Daily Attendance</span>
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1">
            {data.summary.overallPercentage}%
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, data.summary.overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Sessions Conducted */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Hours Conducted
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {data.summary.totalSessionsOverall}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            Sessions on this date
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILTER & CONTROLS TOOLBAR
          ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* School Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1">School:</span>
          <button
            type="button"
            onClick={() => setSelectedSchool("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedSchool === "ALL"
                ? "bg-[#0F2C59] text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            All Schools ({data.sections.length})
          </button>
          {data.schools.map((sch) => {
            const countInSchool = data.sections.filter(
              (s) => s.schoolId === sch.id || s.schoolCode === sch.code
            ).length;
            return (
              <button
                key={sch.id}
                type="button"
                onClick={() => setSelectedSchool(sch.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedSchool === sch.code
                    ? "bg-[#0F2C59] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {sch.code} ({countInSchool})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search section or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="CONDUCTED">Conducted Only</option>
            <option value="UNMARKED">Unmarked Only</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          ALL SECTIONS OVERVIEW IN ONE PAGE (Cards / Table Layout)
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Section Roster &amp; Day Attendance ({formattedDateTitle})</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Showing <strong>{filteredSections.length}</strong> sections
          </span>
        </div>

        {filteredSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSections.map((sec) => {
              const hasSessions = sec.isMarked && sec.totalPeriodsConducted > 0;
              const isHighAttendance = sec.dayPercentage >= 75;
              const isMidAttendance = sec.dayPercentage >= 65 && sec.dayPercentage < 75;

              return (
                <div
                  key={sec.sectionId}
                  onClick={() => {
                    setActiveSectionModal(sec);
                    setActiveHourIndex(0);
                  }}
                  className="group bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top School Tag & Status */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#0F2C59] text-white text-[10px] font-black uppercase tracking-wider">
                          {sec.schoolCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {sec.programName}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 mt-1 group-hover:text-blue-700 transition-colors">
                        {sec.displayName}
                      </h3>
                    </div>

                    {hasSessions ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{sec.totalPeriodsConducted} Hours</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>No Attendance</span>
                      </span>
                    )}
                  </div>

                  {/* Main Metric Numbers: Present vs Absent */}
                  <div className="py-4 grid grid-cols-3 gap-2 text-center">
                    {/* Enrolled */}
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Enrolled
                      </div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">
                        {sec.totalEnrolled}
                      </div>
                      <div className="text-[10px] text-slate-500">Students</div>
                    </div>

                    {/* Present */}
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase">
                        Present
                      </div>
                      <div className="text-lg font-black text-emerald-700 mt-0.5">
                        {sec.distinctPresentCount}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600">
                        {sec.dayPercentage}%
                      </div>
                    </div>

                    {/* Absent */}
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                      <div className="text-[10px] font-bold text-rose-700 uppercase">
                        Absent
                      </div>
                      <div className="text-lg font-black text-rose-700 mt-0.5">
                        {sec.distinctAbsentCount}
                      </div>
                      <div className="text-[10px] font-bold text-rose-600">
                        {sec.totalEnrolled > 0
                          ? ((sec.distinctAbsentCount / sec.totalEnrolled) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Attendance Percentage Progress Bar */}
                  <div className="space-y-1 pt-1 pb-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Section Day Rate</span>
                      <span
                        className={
                          isHighAttendance
                            ? "text-emerald-700 font-black"
                            : isMidAttendance
                            ? "text-amber-700 font-black"
                            : "text-rose-700 font-black"
                        }
                      >
                        {sec.dayPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isHighAttendance
                            ? "bg-emerald-500"
                            : isMidAttendance
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, sec.dayPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Inspect Hour-Wise Stats</span>
                    </span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No matching sections found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your school filter, search term, or select another date from the picker above.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          HOUR-WISE ATTENDANCE STATS MODAL / DRILLDOWN
          ========================================================================= */}
      {activeSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#0F2C59] to-[#163A70] text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    {activeSectionModal.schoolCode}
                  </span>
                  <span className="text-xs font-bold text-blue-200">
                    {activeSectionModal.programName}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  {activeSectionModal.displayName}
                </h3>
                <p className="text-xs text-slate-200 font-medium flex items-center gap-2 pt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-300" />
                  <span>Date: <strong>{formattedDateTitle}</strong></span>
                  <span>•</span>
                  <span>Enrolled: <strong>{activeSectionModal.totalEnrolled} Students</strong></span>
                  <span>•</span>
                  <span className="text-emerald-300 font-bold">
                    Day Rate: {activeSectionModal.dayPercentage}%
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSectionModal(null);
                  setActiveHourIndex(null);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {activeSectionModal.hourlyStats && activeSectionModal.hourlyStats.length > 0 ? (
                <>
                  {/* Period Switcher Tabs */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Conducted Periods / Hours Timeline
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {activeSectionModal.hourlyStats.map((hour, idx) => {
                        const isSelected = (activeHourIndex ?? 0) === idx;
                        return (
                          <button
                            key={hour.sessionId}
                            type="button"
                            onClick={() => setActiveHourIndex(idx)}
                            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                              isSelected
                                ? "bg-[#0F2C59] text-white border-[#0F2C59] shadow-md ring-2 ring-blue-500/20"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                Period {hour.periodNumber}
                              </span>
                              <span
                                className={`text-xs font-black ${
                                  isSelected
                                    ? "text-emerald-300"
                                    : "text-emerald-700"
                                }`}
                              >
                                {hour.percentage}%
                              </span>
                            </div>
                            <div className="mt-2 truncate text-xs font-bold">
                              {hour.subjectShortName}
                            </div>
                            <div
                              className={`text-[10px] truncate ${
                                isSelected ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              {hour.presentCount}P / {hour.absentCount}A
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Hour Deep-Dive Card */}
                  {(() => {
                    const currentHour =
                      activeSectionModal.hourlyStats[activeHourIndex ?? 0] ||
                      activeSectionModal.hourlyStats[0];

                    return (
                      <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-6 space-y-5">
                        {/* Period Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider mb-1">
                              <Clock className="w-3.5 h-3.5 text-blue-700" />
                              <span>Period {currentHour.periodNumber} Details</span>
                            </div>
                            <h4 className="text-lg font-black text-slate-900">
                              {currentHour.subjectName} ({currentHour.subjectCode})
                            </h4>
                            <p className="text-xs text-slate-600 font-semibold mt-0.5">
                              Faculty In-Charge: <strong>{currentHour.facultyName}</strong> ({currentHour.facultyShortName}) • Type: <strong>{currentHour.sessionType}</strong>
                              {currentHour.labBatchName && ` • Batch: ${currentHour.labBatchName}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-2xl font-black text-emerald-700">
                                {currentHour.percentage}%
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase">
                                Hour Attendance
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Present vs Absent Count Chips */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Total Marked
                            </span>
                            <div className="text-xl font-black text-slate-900 mt-0.5">
                              {currentHour.totalMarked}
                            </div>
                          </div>
                          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">
                              Present in Period
                            </span>
                            <div className="text-xl font-black text-emerald-700 mt-0.5">
                              {currentHour.presentCount}
                            </div>
                          </div>
                          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                            <span className="text-[10px] font-bold text-rose-700 uppercase">
                              Absent in Period
                            </span>
                            <div className="text-xl font-black text-rose-700 mt-0.5">
                              {currentHour.absentCount}
                            </div>
                          </div>
                        </div>

                        {/* List of Absent Students in this Hour */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                              <UserX className="w-4 h-4 text-rose-600" />
                              <span>
                                Absent Students in Period {currentHour.periodNumber} ({currentHour.absentCount}):
                              </span>
                            </span>
                            {currentHour.absentCount === 0 && (
                              <span className="text-xs font-bold text-emerald-600">
                                Full 100% attendance! No absentees in this period.
                              </span>
                            )}
                          </div>

                          {currentHour.absentStudents && currentHour.absentStudents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                              {currentHour.absentStudents.map((st, i) => (
                                <div
                                  key={i}
                                  className="p-2.5 rounded-xl bg-white border border-rose-200 shadow-2xs flex items-center gap-2.5 text-xs"
                                >
                                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                    {i + 1}
                                  </span>
                                  <div className="truncate">
                                    <div className="font-mono font-bold text-slate-900">
                                      {st.rollNumber}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {st.fullName}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs font-bold text-emerald-700">
                              🎉 All enrolled students were present for this session!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">
                    No Attendance Marked for this Section on {formattedDateTitle}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Faculty have not submitted attendance sessions for this section on this specific date.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveSectionModal(null);
                  setActiveHourIndex(null);
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Close Drilldown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
