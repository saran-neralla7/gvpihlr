"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Building,
  ArrowLeft,
  Printer,
  ChevronRight,
  Filter,
  CheckCircle2,
  Layers,
} from "lucide-react";

interface SectionOption {
  id: string;
  name: string;
  displayName: string;
  programName: string;
  programCode: string;
  year: number;
  semester: number;
}

interface TimetableItem {
  id: string;
  sectionId: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber?: string | null;
  subjectCode: string;
  subjectName: string;
  subjectShortName: string;
  subjectType: string;
  facultyName: string;
  facultyShortName: string;
  labBatchName?: string | null;
}

interface TimetableManagerProps {
  sections: SectionOption[];
  entries: TimetableItem[];
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const PERIODS = [
  { num: 1, timing: "09:00 - 10:00 AM" },
  { num: 2, timing: "10:00 - 11:00 AM" },
  { num: 3, timing: "11:15 - 12:15 PM" },
  { num: 4, timing: "12:15 - 01:15 PM" },
  { num: 5, timing: "02:15 - 03:15 PM" },
  { num: 6, timing: "03:15 - 04:15 PM" },
  { num: 7, timing: "04:15 - 05:15 PM" },
];

export default function TimetableManagerClient({
  sections,
  entries,
}: TimetableManagerProps) {
  const [selectedSectionId, setSelectedSectionId] = useState(
    sections[0]?.id || ""
  );
  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("weekly");

  const currentSection = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId) || sections[0];
  }, [sections, selectedSectionId]);

  // Filter entries for the selected section
  const sectionEntries = useMemo(() => {
    return entries.filter((e) => e.sectionId === selectedSectionId);
  }, [entries, selectedSectionId]);

  // Lookup map: `${day}_${periodNumber}` -> TimetableItem[]
  const slotMap = useMemo(() => {
    const map = new Map<string, TimetableItem[]>();
    sectionEntries.forEach((e) => {
      const key = `${e.dayOfWeek}_${e.periodNumber}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(e);
    });
    return map;
  }, [sectionEntries]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition shadow-xs flex-shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B2545]">
              Master Academic Schedule (Semester 1)
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Class Timetables
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Official institutional lecture and laboratory period allocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === "weekly"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === "daily"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Day View
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Section Selector Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
              Select Branch Section *
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.programName} — Section {s.name}
                </option>
              ))}
            </select>
          </div>

          {viewMode === "daily" && (
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                Day of Week
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col justify-end">
            <div className="text-xs text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              Active: <span className="font-bold text-slate-900">{currentSection?.displayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          VIEW 1: MASTER WEEKLY GRID TABLE
          ======================================================================= */}
      {viewMode === "weekly" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 print-container">
          <div className="text-center space-y-1 pb-4 border-b border-slate-200">
            <h2 className="text-base font-black text-slate-900 uppercase">
              Gayatri Vidya Parishad Institute of Higher Learning &amp; Research
            </h2>
            <h3 className="text-xs font-semibold text-slate-600">
              Department of {currentSection?.programName} • 1st Year Sem 1 (Section {currentSection?.name})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B2545] text-white font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 border border-slate-700 w-28 text-center">Day</th>
                  {PERIODS.map((p) => (
                    <th
                      key={p.num}
                      className="py-3 px-3 border border-slate-700 text-center font-bold"
                    >
                      <div>Period {p.num}</div>
                      <div className="text-[9px] font-normal opacity-80 font-mono">
                        {p.timing}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {DAYS.map((day, idx) => (
                  <tr
                    key={day}
                    className={`border-b border-slate-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <td className="py-4 px-4 font-black text-slate-900 uppercase font-mono text-center border border-slate-200 bg-slate-50/60">
                      {day.slice(0, 3)}
                    </td>
                    {PERIODS.map((p) => {
                      const slots = slotMap.get(`${day}_${p.num}`) || [];
                      return (
                        <td
                          key={p.num}
                          className="py-3 px-2 text-center border border-slate-200 min-w-[120px]"
                        >
                          {slots.length > 0 ? (
                            <div className="space-y-1.5">
                              {slots.map((s) => (
                                <div
                                  key={s.id}
                                  className={`p-2 rounded-xl text-left border ${
                                    s.subjectType === "LAB"
                                      ? "bg-purple-50/80 border-purple-200 text-purple-900"
                                      : "bg-blue-50/80 border-blue-200 text-blue-900"
                                  }`}
                                >
                                  <div className="font-bold text-xs flex items-center justify-between">
                                    <span className="font-mono">{s.subjectShortName}</span>
                                    {s.labBatchName && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-200/80 text-purple-800">
                                        {s.labBatchName}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-600 truncate" title={s.subjectName}>
                                    {s.subjectName}
                                  </div>
                                  <div className="text-[10px] font-semibold text-slate-500 font-mono mt-0.5">
                                    Faculty: {s.facultyShortName}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono text-[11px]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =======================================================================
          VIEW 2: DAY VIEW PERIOD CARDS
          ======================================================================= */}
      {viewMode === "daily" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">
              Schedule for {selectedDay}
            </h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
              {currentSection?.displayName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERIODS.map((p) => {
              const slots = slotMap.get(`${selectedDay}_${p.num}`) || [];
              return (
                <div
                  key={p.num}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      Period {p.num}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.timing}
                    </span>
                  </div>

                  {slots.length > 0 ? (
                    slots.map((s) => (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border ${
                          s.subjectType === "LAB"
                            ? "bg-purple-50 border-purple-200 text-purple-900"
                            : "bg-white border-slate-200 text-slate-900 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm">{s.subjectShortName}</span>
                          <span className="text-[10px] font-mono text-slate-500">{s.subjectCode}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mt-1">
                          {s.subjectName}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <span>Faculty: <strong>{s.facultyName}</strong> ({s.facultyShortName})</span>
                          {s.labBatchName && (
                            <span className="font-bold text-purple-700">{s.labBatchName}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs font-medium">
                      No scheduled class for this period.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
