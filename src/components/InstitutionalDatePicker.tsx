"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface InstitutionalDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string;
  variant?: "light" | "dark";
  className?: string;
  align?: "left" | "right";
}

export default function InstitutionalDatePicker({
  value,
  onChange,
  label,
  variant = "light",
  className = "",
  align = "left",
}: InstitutionalDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value or default to current date
  const selectedDateObj = value ? new Date(`${value}T00:00:00`) : new Date();

  // Internal view year and month for calendar popover
  const [viewDate, setViewDate] = useState<Date>(() => {
    return value ? new Date(`${value}T00:00:00`) : new Date();
  });

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (value) {
      setViewDate(new Date(`${value}T00:00:00`));
    }
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0 to 11
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long" });

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleSelectDay = (dayNum: number) => {
    const yyyy = viewYear;
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(dayNum).padStart(2, "0");
    const iso = `${yyyy}-${mm}-${dd}`;
    onChange(iso);
    setIsOpen(false);
  };

  // Formatted display text (e.g. "22 Sep 2026")
  const formattedDisplay = (() => {
    if (!value) return "Select Date";
    const d = new Date(`${value}T00:00:00`);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  })();

  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <div ref={containerRef} className={`relative ${className.includes("w-full") ? "w-full" : "inline-block"} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-bold text-xs transition border select-none ${
          variant === "dark"
            ? "bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-xs"
            : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {label && (
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider ${
                variant === "dark" ? "text-blue-200" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          )}
          <Calendar
            className={`w-3.5 h-3.5 flex-shrink-0 ${
              variant === "dark" ? "text-blue-200" : "text-blue-600"
            }`}
          />
          <span className="font-extrabold tracking-tight truncate">{formattedDisplay}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${variant === "dark" ? "text-white/70" : "text-slate-400"}`}
        />
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className={`absolute mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Popover Header: Month & Navigation */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-xs font-black text-slate-900 tracking-wide uppercase font-sans">
              {monthName} {viewYear}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName, idx) => (
              <span
                key={idx}
                className="text-[9.5px] font-black text-slate-400 uppercase py-0.5"
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateIso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = dateIso === value;
              const isToday = dateIso === todayIso;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition flex items-center justify-center mx-auto ${
                    isSelected
                      ? "bg-[#0B2545] text-white shadow-xs font-black"
                      : isToday
                      ? "bg-blue-50 text-blue-700 border border-blue-300 font-extrabold"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Popover Footer Shortcuts */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onChange(todayIso);
                setIsOpen(false);
              }}
              className="font-bold text-blue-600 hover:text-blue-800 transition text-[10.5px]"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10.5px] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
