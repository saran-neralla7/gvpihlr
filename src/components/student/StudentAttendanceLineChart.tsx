"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";

export interface SessionDataPoint {
  id?: string;
  sessionDate: string; // ISO date string (YYYY-MM-DD) or parsable date
  periodNumber?: number;
  subjectName?: string;
  status: "PRESENT" | "ABSENT" | string;
}

interface StudentAttendanceLineChartProps {
  sessions: SessionDataPoint[];
  studentName?: string;
  rollNumber?: string;
}

interface DailyAggregatedPoint {
  dateKey: string;
  formattedDate: string;
  dayHeld: number;
  dayAttended: number;
  cumulativeHeld: number;
  cumulativeAttended: number;
  cumulativePercentage: number;
  tier: "GREEN" | "ORANGE" | "RED";
  tierColor: string;
}

export default function StudentAttendanceLineChart({
  sessions,
  studentName,
  rollNumber,
}: StudentAttendanceLineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute chronological day-by-day attendance trajectory
  const dailyProgression: DailyAggregatedPoint[] = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    // 1. Group sessions by date
    const dayMap = new Map<string, { held: number; attended: number; rawDate: Date }>();

    sessions.forEach((s) => {
      // Normalize date to YYYY-MM-DD
      let raw: Date;
      if (typeof s.sessionDate === "string" && s.sessionDate.includes("/")) {
        const parts = s.sessionDate.split("/");
        if (parts.length === 3) {
          raw = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          raw = new Date(s.sessionDate);
        }
      } else {
        raw = new Date(s.sessionDate);
      }
      if (isNaN(raw.getTime())) return;

      const yyyy = raw.getFullYear();
      const mm = String(raw.getMonth() + 1).padStart(2, "0");
      const dd = String(raw.getDate()).padStart(2, "0");
      const dateKey = `${yyyy}-${mm}-${dd}`;

      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, { held: 0, attended: 0, rawDate: raw });
      }

      const item = dayMap.get(dateKey)!;
      item.held += 1;
      const isPresent = s.status === "PRESENT" || s.status === "ON_DUTY" || s.status === "P";
      if (isPresent) {
        item.attended += 1;
      }
    });

    // 2. Sort dates chronologically ascending
    const sortedDateKeys = Array.from(dayMap.keys()).sort((a, b) => a.localeCompare(b));

    // 3. Compute running cumulative metrics
    let runningHeld = 0;
    let runningAttended = 0;

    return sortedDateKeys.map((dateKey) => {
      const dayData = dayMap.get(dateKey)!;
      runningHeld += dayData.held;
      runningAttended += dayData.attended;

      const pct = runningHeld > 0 ? (runningAttended / runningHeld) * 100 : 0;
      const roundedPct = Math.round(pct * 10) / 10;

      let tier: "GREEN" | "ORANGE" | "RED" = "RED";
      let tierColor = "#EF4444"; // Red (< 60%)

      if (roundedPct >= 75) {
        tier = "GREEN";
        tierColor = "#10B981"; // Green (>= 75%)
      } else if (roundedPct >= 60) {
        tier = "ORANGE";
        tierColor = "#F59E0B"; // Orange (60% to 74%)
      }

      const d = dayData.rawDate;
      const formattedDate = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      return {
        dateKey,
        formattedDate,
        dayHeld: dayData.held,
        dayAttended: dayData.attended,
        cumulativeHeld: runningHeld,
        cumulativeAttended: runningAttended,
        cumulativePercentage: roundedPct,
        tier,
        tierColor,
      };
    });
  }, [sessions]);

  if (dailyProgression.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-center text-slate-400">
        <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        <p className="text-xs font-semibold">No attendance sessions recorded yet for progression plotting.</p>
      </div>
    );
  }

  // Dimensions for SVG Graph
  const svgWidth = 860;
  const svgHeight = 280;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const count = dailyProgression.length;
  const minPct = 0;
  const maxPct = 100;

  const getX = (index: number) => {
    if (count <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (count - 1)) * chartWidth;
  };

  const getY = (pct: number) => {
    const clamped = Math.max(minPct, Math.min(maxPct, pct));
    return paddingTop + chartHeight - ((clamped - minPct) / (maxPct - minPct)) * chartHeight;
  };

  const y75 = getY(75);
  const y60 = getY(60);

  const latestPoint = dailyProgression[dailyProgression.length - 1];
  const activeHoverPoint = hoveredIdx !== null ? dailyProgression[hoveredIdx] : null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header and Trajectory Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Daily Cumulative Attendance Trajectory
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Day-by-day progression tracked from Day 1 ({dailyProgression[0].formattedDate}) to Date ({latestPoint.formattedDate}).
              </p>
            </div>
          </div>
        </div>

        {/* Legend Pills with strict color coding */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            &ge; 75% Safe
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            60% - 74% Warning
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            &lt; 60% Critical
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-x-auto bg-slate-50/50 rounded-2xl border border-slate-200/80 p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px] select-none"
        >
          {/* Subtle Horizontal Grid lines at 25%, 50%, 75%, 100% */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={level === 75 || level === 60 ? "0" : "3,3"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono font-bold"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* 60% Warning Threshold Line */}
          <line
            x1={paddingLeft}
            y1={y60}
            x2={svgWidth - paddingRight}
            y2={y60}
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.75"
          />
          <text
            x={svgWidth - paddingRight + 4}
            y={y60 + 3}
            textAnchor="start"
            className="text-[8px] fill-amber-600 font-mono font-extrabold"
          >
            60%
          </text>

          {/* 75% Statutory Cutoff Line */}
          <line
            x1={paddingLeft}
            y1={y75}
            x2={svgWidth - paddingRight}
            y2={y75}
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="5,4"
            opacity="0.9"
          />
          <text
            x={svgWidth - paddingRight + 4}
            y={y75 + 3}
            textAnchor="start"
            className="text-[8.5px] fill-emerald-700 font-mono font-black"
          >
            75%
          </text>

          {/* Area Fill Under Curve with soft opacity */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background area polygon */}
          {count > 1 && (
            <polygon
              points={`
                ${getX(0)},${getY(0)}
                ${dailyProgression.map((p, i) => `${getX(i)},${getY(p.cumulativePercentage)}`).join(" ")}
                ${getX(count - 1)},${getY(0)}
              `}
              fill="url(#areaGradient)"
            />
          )}

          {/* Colored Line Segments connecting each day */}
          {dailyProgression.map((point, i) => {
            if (i === 0) return null;
            const prev = dailyProgression[i - 1];
            const x1 = getX(i - 1);
            const y1 = getY(prev.cumulativePercentage);
            const x2 = getX(i);
            const y2 = getY(point.cumulativePercentage);

            return (
              <line
                key={`seg-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={point.tierColor}
                strokeWidth="3.2"
                strokeLinecap="round"
                className="transition-all duration-200"
              />
            );
          })}

          {/* Interactive Data Points (Circles) */}
          {dailyProgression.map((point, i) => {
            const cx = getX(i);
            const cy = getY(point.cumulativePercentage);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={`pt-${i}`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Invisible hover trigger hotspot */}
                <circle cx={cx} cy={cy} r="14" fill="transparent" />

                {/* Outer halo when active or hovered */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill={point.tierColor}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? "5.5" : "4"}
                  fill={point.tierColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150 drop-shadow-xs"
                />

                {/* Date Label on X Axis */}
                <text
                  x={cx}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className={`text-[8.5px] font-mono transition-colors ${
                    isHovered
                      ? "fill-slate-900 font-extrabold"
                      : "fill-slate-500 font-semibold"
                  }`}
                >
                  {point.formattedDate}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activeHoverPoint && hoveredIdx !== null && (
          <div
            className="absolute pointer-events-none transition-all duration-150 z-20 bg-slate-900 text-white rounded-2xl p-3 shadow-xl border border-slate-700 text-xs space-y-1.5"
            style={{
              left: `${Math.min(
                Math.max((getX(hoveredIdx) / svgWidth) * 100, 14),
                86
              )}%`,
              top: "16px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-700/80 pb-1 font-bold">
              <span className="text-slate-300 font-mono text-[11px]">
                {activeHoverPoint.formattedDate} ({activeHoverPoint.dateKey})
              </span>
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    activeHoverPoint.tier === "GREEN"
                      ? "rgba(16, 185, 129, 0.2)"
                      : activeHoverPoint.tier === "ORANGE"
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(239, 68, 68, 0.2)",
                  color: activeHoverPoint.tierColor,
                }}
              >
                {activeHoverPoint.tier === "GREEN"
                  ? "SAFE (>=75%)"
                  : activeHoverPoint.tier === "ORANGE"
                  ? "WARNING (60-74%)"
                  : "CRITICAL (<60%)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] pt-0.5">
              <div>
                <span className="text-slate-400 block text-[10px]">On this day</span>
                <span className="font-mono font-bold text-slate-100">
                  {activeHoverPoint.dayAttended} / {activeHoverPoint.dayHeld} classes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cumulative %</span>
                <span
                  className="font-mono font-black text-sm"
                  style={{ color: activeHoverPoint.tierColor }}
                >
                  {activeHoverPoint.cumulativePercentage}%
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono border-t border-slate-800 pt-1">
              Cumulative: {activeHoverPoint.cumulativeAttended} attended of {activeHoverPoint.cumulativeHeld} held
            </div>
          </div>
        )}
      </div>

      {/* Summary Trajectory Insights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">First Marked Day</span>
          <span className="font-mono font-bold text-slate-900 block mt-0.5">
            {dailyProgression[0].formattedDate}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {dailyProgression[0].dayAttended}/{dailyProgression[0].dayHeld} classes
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Latest Marked Day</span>
          <span className="font-mono font-bold text-slate-900 block mt-0.5">
            {latestPoint.formattedDate}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {latestPoint.dayAttended}/{latestPoint.dayHeld} classes
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Cumulative %</span>
          <span
            className="font-mono font-black text-base block mt-0.5"
            style={{ color: latestPoint.tierColor }}
          >
            {latestPoint.cumulativePercentage}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {latestPoint.cumulativeAttended} of {latestPoint.cumulativeHeld} held
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Statutory Clearance</span>
          <div className="mt-1">
            {latestPoint.cumulativePercentage >= 75 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Eligible
              </span>
            ) : latestPoint.cumulativePercentage >= 60 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Warning (Condonable)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Critical Defaulter
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
