"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  Printer,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Users,
  Percent,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface SectionOption {
  id: string;
  name: string;
  displayName?: string | null;
  programName: string;
  year: number;
  semester: number;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
  shortName?: string;
  count?: number;
}

interface SessionItem {
  id: string;
  sessionDate: string;
  formattedDate: string;
  periodNumber: number;
  periodTiming: string;
  subjectName: string;
  subjectCode: string;
  subjectShortName: string;
}

interface StudentReportItem {
  studentId: string;
  rollNumber: string;
  fullName: string;
  phone?: string | null;
  attendanceMap?: Record<string, "P" | "A" | "-">;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  percentage: number | null;
  isDefaulter: boolean;
}

const COLLEGE_NAME = "GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH";
const COLLEGE_SUBTITLE = "(Deemed to be University under Section 3 of the UGC Act, 1956) • Visakhapatnam";

export default function ReportsClient({
  sections,
  subjects,
  initialSectionId,
  initialReport,
}: {
  sections: SectionOption[];
  subjects: SubjectOption[];
  initialSectionId: string;
  initialReport: {
    sectionName: string;
    displayName?: string;
    programName: string;
    year?: number;
    semester?: number;
    totalSessionsConducted: number;
    sessions?: SessionItem[];
    availableSubjects?: SubjectOption[];
    students: StudentReportItem[];
    defaultersCount: number;
    startDate?: string;
    endDate?: string;
  };
}) {
  // Top Active Tab: "consolidated" (Roster Summary) or "matrix" (Daily Period-Wise Register)
  const [activeTab, setActiveTab] = useState<"consolidated" | "matrix">("consolidated");

  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>(
    initialReport.availableSubjects || []
  );

  const [startDate, setStartDate] = useState(initialReport.startDate || "2026-09-22");
  const [endDate, setEndDate] = useState(initialReport.endDate || "2026-10-07");

  const [reportData, setReportData] = useState(initialReport);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyDefaulters, setOnlyDefaulters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch report when section, subject, or dates change
  const fetchReport = async (secId: string, subId: string, sDate: string, eDate: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ sectionId: secId });
      if (subId && subId.trim() !== "") params.append("subjectId", subId);
      if (sDate && sDate.trim() !== "") params.append("startDate", sDate);
      if (eDate && eDate.trim() !== "") params.append("endDate", eDate);

      const res = await fetch(`/api/reports/section?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReportData({
          sectionName: data.section.name,
          displayName: data.section.displayName,
          programName: data.section.program?.name || "Degree Program",
          year: data.section.year || 1,
          semester: data.section.semester || 1,
          totalSessionsConducted: data.totalSessionsConducted,
          sessions: data.sessions || [],
          availableSubjects: data.availableSubjects || [],
          students: data.students || [],
          defaultersCount: data.defaultersCount || 0,
          startDate: data.startDate || sDate,
          endDate: data.endDate || eDate,
        });
        if (data.availableSubjects) {
          setAvailableSubjects(data.availableSubjects);
        }
      }
    } catch (e) {
      console.error("Error loading report:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (newSecId: string) => {
    setSelectedSectionId(newSecId);
    // Reset subject filter to all on section change to prevent mismatched subject 0-sessions
    setSelectedSubjectId("");
    fetchReport(newSecId, "", startDate, endDate);
  };

  const handleSubjectChange = (newSubId: string) => {
    setSelectedSubjectId(newSubId);
    fetchReport(selectedSectionId, newSubId, startDate, endDate);
  };

  const handleApplyDates = () => {
    fetchReport(selectedSectionId, selectedSubjectId, startDate, endDate);
  };

  const handleResetDates = () => {
    setStartDate("2026-09-22");
    setEndDate("2026-10-07");
    fetchReport(selectedSectionId, selectedSubjectId, "2026-09-22", "2026-10-07");
  };

  const filteredStudents = useMemo(() => {
    return reportData.students.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDefaulter = !onlyDefaulters || s.isDefaulter;
      return matchesSearch && matchesDefaulter;
    });
  }, [reportData.students, searchQuery, onlyDefaulters]);

  const sessions = reportData.sessions || [];

  // Calculate overall average attendance
  const validPercentages = useMemo(() => {
    return filteredStudents
      .map((s) => s.percentage)
      .filter((p): p is number => p !== null);
  }, [filteredStudents]);

  const averageAttendanceRate = useMemo(() => {
    if (validPercentages.length === 0) return "—";
    const sum = validPercentages.reduce((a, b) => a + b, 0);
    return (sum / validPercentages.length).toFixed(1) + "%";
  }, [validPercentages]);

  // Selected subject label
  const selectedSubjectObj = useMemo(() => {
    return availableSubjects.find((s) => s.id === selectedSubjectId);
  }, [availableSubjects, selectedSubjectId]);

  // =========================================================================
  // EXPORT: CONSOLIDATED PDF (Portrait Roster Table with Official Header)
  // =========================================================================
  const handleExportConsolidatedPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Institutional Header Banner
    doc.setFillColor(11, 37, 69); // #0B2545 Deep Navy
    doc.rect(0, 0, 210, 24, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.text(COLLEGE_NAME, 105, 9, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(COLLEGE_SUBTITLE, 105, 15, { align: "center" });
    doc.setFontSize(7.5);
    doc.text("School of Engineering and Technology • Academic Year 2026-2027", 105, 20, {
      align: "center",
    });

    // Report Title & Context Metadata
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CONSOLIDATED ATTENDANCE REPORT", 14, 32);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Department: ${reportData.programName}`, 14, 38);
    doc.text(
      `Section: ${reportData.sectionName} | Year: ${reportData.year || 1} | Sem: ${
        reportData.semester || 1
      }`,
      14,
      43
    );
    const subTitle = selectedSubjectObj
      ? `${selectedSubjectObj.name} (${selectedSubjectObj.code})`
      : "All Subjects (Consolidated)";
    doc.text(`Subject: ${subTitle}`, 14, 48);

    doc.text(`Total Sessions Conducted: ${reportData.totalSessionsConducted}`, 130, 38);
    doc.text(
      `Enrolled Students: ${filteredStudents.length} | Defaulters (<75%): ${reportData.defaultersCount}`,
      130,
      43
    );
    doc.text(
      `Generated On: ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`,
      130,
      48
    );

    const tableRows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.rollNumber,
      s.fullName,
      s.phone || "—",
      s.totalClasses,
      s.attendedClasses,
      s.absentClasses,
      s.percentage !== null ? `${s.percentage.toFixed(1)}%` : "—",
      s.totalClasses === 0 ? "NOT STARTED" : s.isDefaulter ? "DEFAULTER (<75%)" : "ELIGIBLE",
    ]);

    autoTable(doc, {
      startY: 53,
      head: [
        [
          "S.No",
          "Roll Number",
          "Student Name",
          "Contact",
          "Total",
          "Present",
          "Absent",
          "%",
          "Eligibility Status",
        ],
      ],
      body: tableRows,
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        halign: "center",
        valign: "middle",
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [11, 37, 69],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { halign: "left", cellWidth: 26, fontStyle: "bold" },
        2: { halign: "left", cellWidth: 50, fontStyle: "bold" },
        3: { halign: "center", cellWidth: 24 },
        4: { halign: "center", cellWidth: 14 },
        5: { halign: "center", cellWidth: 14 },
        6: { halign: "center", cellWidth: 14 },
        7: { halign: "center", cellWidth: 16, fontStyle: "bold" },
        8: { halign: "center", cellWidth: 22, fontStyle: "bold" },
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 8) {
          if (data.cell.raw === "ELIGIBLE") {
            data.cell.styles.textColor = [5, 150, 105]; // emerald
          } else if (data.cell.raw === "DEFAULTER (<75%)") {
            data.cell.styles.textColor = [225, 29, 72]; // rose
          }
        }
      },
    });

    doc.save(
      `Consolidated_Attendance_${reportData.sectionName}_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  // =========================================================================
  // EXPORT: CONSOLIDATED EXCEL (.xlsx)
  // =========================================================================
  const handleExportConsolidatedExcel = () => {
    const subTitle = selectedSubjectObj
      ? `${selectedSubjectObj.name} (${selectedSubjectObj.code})`
      : "All Subjects (Consolidated)";

    const worksheetData = [
      [COLLEGE_NAME],
      [COLLEGE_SUBTITLE],
      [`CONSOLIDATED ATTENDANCE REPORT - ${reportData.programName} (Section ${reportData.sectionName})`],
      [
        `Subject: ${subTitle} | Total Conducted Sessions: ${reportData.totalSessionsConducted} | Date: ${new Date().toLocaleDateString(
          "en-IN"
        )}`,
      ],
      [],
      [
        "S.No",
        "Roll Number",
        "Student Name",
        "Contact",
        "Conducted",
        "Attended",
        "Absent",
        "Percentage (%)",
        "Eligibility Status",
      ],
      ...filteredStudents.map((st, idx) => [
        idx + 1,
        st.rollNumber,
        st.fullName,
        st.phone || "—",
        st.totalClasses,
        st.attendedClasses,
        st.absentClasses,
        st.percentage !== null ? `${st.percentage.toFixed(2)}%` : "—",
        st.totalClasses === 0 ? "NOT STARTED" : st.isDefaulter ? "DEFAULTER (<75%)" : "ELIGIBLE",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidated Report");
    XLSX.writeFile(
      workbook,
      `Consolidated_Attendance_${reportData.sectionName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // =========================================================================
  // EXPORT: DAILY MATRIX PDF (Multi-part Landscape Table with Official Header)
  // =========================================================================
  const handleExportDailyMatrixPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const sessionsPerPage = 12; // Maximum sessions per chunk for clean landscape readability
    const totalParts = Math.max(1, Math.ceil(sessions.length / sessionsPerPage));

    for (let part = 0; part < totalParts; part++) {
      if (part > 0) doc.addPage("a4", "landscape");

      const partSessions = sessions.slice(part * sessionsPerPage, (part + 1) * sessionsPerPage);
      const isLastPart = part === totalParts - 1;

      // 1. Institution Title Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(COLLEGE_NAME, 148.5, 9, { align: "center" });

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(COLLEGE_SUBTITLE, 148.5, 14, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const titleMode = selectedSubjectId
        ? "Subject-Wise Class Daily Attendance Register"
        : "Consolidated Class Daily Attendance Register";
      doc.text(
        `${titleMode} ${totalParts > 1 ? `(Part ${part + 1} of ${totalParts})` : ""}`,
        148.5,
        19.5,
        { align: "center" }
      );

      // Metadata line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const metaPartDates =
        partSessions.length > 0
          ? `${partSessions[0].formattedDate} - ${partSessions[partSessions.length - 1].formattedDate}`
          : "";
      doc.text(
        `Department: ${reportData.programName} | Academic Year: 2026-2027 | Batch: 2026-2030 Batch`,
        148.5,
        24,
        { align: "center" }
      );
      doc.text(
        `Year: ${reportData.year || 1} | Sem: ${reportData.semester || 1} | Section: ${
          reportData.sectionName
        } | Dates: ${startDate} to ${endDate} ${
          totalParts > 1 ? `(Part ${part + 1}: ${metaPartDates})` : ""
        }`,
        148.5,
        28,
        { align: "center" }
      );

      // 2. Build multi-tier column headers
      const colHeaders: any[] = ["Roll No", "Name"];
      partSessions.forEach((s) => {
        colHeaders.push(`${s.formattedDate}\n${s.periodTiming}\n${s.subjectShortName}`);
      });

      if (isLastPart) {
        colHeaders.push("Total", "P", "A", "%");
      }

      // 3. Build student rows
      const tableRows = filteredStudents.map((st) => {
        const row: any[] = [st.rollNumber, st.fullName];

        partSessions.forEach((sess) => {
          const val = st.attendanceMap?.[sess.id] || "-";
          row.push(val);
        });

        if (isLastPart) {
          row.push(
            st.totalClasses,
            st.attendedClasses,
            st.absentClasses,
            st.percentage !== null ? `${st.percentage.toFixed(1)}%` : "—"
          );
        }

        return row;
      });

      // 4. Render Table via autotable
      autoTable(doc, {
        head: [colHeaders],
        body: tableRows,
        startY: 31,
        styles: {
          fontSize: 6,
          cellPadding: 1,
          halign: "center",
          valign: "middle",
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          textColor: [30, 30, 30],
        },
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 5.5,
          lineColor: [180, 180, 180],
          lineWidth: 0.15,
        },
        columnStyles: {
          0: { halign: "left", cellWidth: 22, fontStyle: "bold" },
          1: { halign: "left", cellWidth: 38, fontStyle: "bold" },
        },
        didParseCell: function (data) {
          if (data.section === "body" && data.column.index >= 2) {
            const rawVal = data.cell.raw;
            if (rawVal === "P") {
              data.cell.styles.fillColor = [236, 253, 245]; // light emerald
              data.cell.styles.textColor = [5, 150, 105];
              data.cell.styles.fontStyle = "bold";
            } else if (rawVal === "A") {
              data.cell.styles.fillColor = [255, 241, 242]; // light rose
              data.cell.styles.textColor = [225, 29, 72];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });
    }

    doc.save(
      `Daily_Attendance_Register_${reportData.sectionName}_${startDate}_to_${endDate}.pdf`
    );
  };

  // =========================================================================
  // EXPORT: DAILY MATRIX EXCEL (.xlsx)
  // =========================================================================
  const handleExportDailyMatrixExcel = () => {
    const headers1 = ["Roll No", "Name"];
    const headers2 = ["", ""];
    const headers3 = ["", ""];

    sessions.forEach((s) => {
      headers1.push(s.formattedDate);
      headers2.push(s.periodTiming);
      headers3.push(s.subjectShortName);
    });

    headers1.push("Total", "Present", "Absent", "Percentage");
    headers2.push("", "", "", "");
    headers3.push("", "", "", "");

    const dataRows = filteredStudents.map((st) => {
      const row = [st.rollNumber, st.fullName];
      sessions.forEach((s) => {
        row.push(st.attendanceMap?.[s.id] || "-");
      });
      row.push(
        st.totalClasses.toString(),
        st.attendedClasses.toString(),
        st.absentClasses.toString(),
        st.percentage !== null ? `${st.percentage.toFixed(2)}%` : "—"
      );
      return row;
    });

    const worksheetData = [
      [COLLEGE_NAME],
      [COLLEGE_SUBTITLE],
      [`Daily Attendance Register - ${reportData.programName} (Section ${reportData.sectionName})`],
      [`Dates: ${startDate} to ${endDate} | Total Conducted Sessions: ${sessions.length}`],
      [],
      headers1,
      headers2,
      headers3,
      ...dataRows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Register");
    XLSX.writeFile(
      workbook,
      `Attendance_Register_${reportData.sectionName}_${startDate}_to_${endDate}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PRINT STYLES FOR NATIVE PRINT DIALOG
          ========================================================================= */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 6mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          header,
          footer,
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-table {
            border-collapse: collapse !important;
            width: 100% !important;
            font-size: 8px !important;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #666 !important;
            padding: 2px 3px !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Top Banner (Hidden in Print) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B2545]">
            Attendance Governance &amp; Examination Verification
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            Attendance Reports &amp; Registers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Institutional consolidated student roster summaries &amp; official multi-period daily registers.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("consolidated")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "consolidated"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Consolidated Report</span>
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "matrix"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Daily Matrix Register</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: CONSOLIDATED REPORT (PREVIOUS ROSTER VIEW)
          ========================================================================= */}
      {activeTab === "consolidated" && (
        <div className="space-y-6">
          {/* KPI Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
            {/* Total Sessions Conducted */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Conducted
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {reportData.totalSessionsConducted}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">Sessions</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Conducted in selected criteria</p>
            </div>

            {/* Total Students Enrolled */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Enrolled Students
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {filteredStudents.length}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">Students</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Active class section roster</p>
            </div>

            {/* Defaulters (< 75%) */}
            <div className="bg-white border border-rose-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  Defaulters (&lt; 75%)
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600 mt-2">
                {reportData.defaultersCount}
                <span className="text-xs font-semibold text-rose-400 ml-1.5">Students</span>
              </div>
              <p className="text-[11px] text-rose-500/80 mt-1">Below mandatory 75% threshold</p>
            </div>

            {/* Average Attendance */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Average Attendance
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {averageAttendanceRate}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Overall section average</p>
            </div>
          </div>

          {/* Consolidated Controls Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 no-print">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Section Select */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Class Section *
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.programName} - Sec {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Select */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Subject Filter
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    All Subjects (Consolidated - {reportData.totalSessionsConducted} sessions)
                  </option>
                  {availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code}) {sub.count !== undefined ? `— ${sub.count} sessions` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleExportConsolidatedPDF}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8B1528] hover:bg-[#6D1020] text-white text-xs font-bold transition shadow-xs"
                  title="Download Consolidated PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleExportConsolidatedExcel}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-xs"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* Search & Defaulter Checkbox */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student roll number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                </input>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyDefaulters}
                    onChange={(e) => setOnlyDefaulters(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-rose-700 font-bold">Show &lt; 75% Defaulters Only</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
                    {reportData.defaultersCount}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Warning Banner when 0 sessions are conducted */}
          {reportData.totalSessionsConducted === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <strong>No sessions recorded for this selection yet.</strong> Attendance has not been
                entered or conducted for the chosen subject or date range. All records remain safely
                preserved in the database.
              </div>
            </div>
          )}

          {/* Consolidated Roster Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 print-container">
            {/* Table Institutional Header */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-200">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                {COLLEGE_NAME}
              </h1>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-600">
                {COLLEGE_SUBTITLE}
              </h2>
              <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                CONSOLIDATED STUDENT ATTENDANCE REPORT
              </h3>
              <div className="text-[11px] text-slate-600 font-semibold space-y-0.5 pt-1">
                <div>
                  Department: <strong>{reportData.programName}</strong> | Year:{" "}
                  <strong>{reportData.year || 1}</strong> | Sem:{" "}
                  <strong>{reportData.semester || 1}</strong> | Section:{" "}
                  <strong>{reportData.sectionName}</strong>
                </div>
                <div>
                  Subject:{" "}
                  <strong>
                    {selectedSubjectObj
                      ? `${selectedSubjectObj.name} (${selectedSubjectObj.code})`
                      : "All Subjects (Consolidated)"}
                  </strong>{" "}
                  | Total Sessions Conducted: <strong>{reportData.totalSessionsConducted}</strong>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-bold w-12">
                      S.No
                    </th>
                    <th className="border border-slate-200 px-4 py-2.5 text-left font-bold w-36">
                      Roll Number
                    </th>
                    <th className="border border-slate-200 px-4 py-2.5 text-left font-bold">
                      Student Name
                    </th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-bold w-32">
                      Contact
                    </th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-bold w-24">
                      Conducted
                    </th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-bold text-emerald-800 bg-emerald-50/50 w-24">
                      Attended
                    </th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-bold text-rose-800 bg-rose-50/50 w-24">
                      Absent
                    </th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-bold w-28">
                      Percentage
                    </th>
                    <th className="border border-slate-200 px-4 py-2.5 text-center font-bold w-36">
                      Eligibility Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => {
                      const isZeroConducted = st.totalClasses === 0;
                      return (
                        <tr
                          key={st.studentId}
                          className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-200 px-4 py-2 font-mono font-bold text-slate-800 whitespace-nowrap">
                            {st.rollNumber}
                          </td>
                          <td className="border border-slate-200 px-4 py-2 font-bold text-slate-900 uppercase">
                            {st.fullName}
                          </td>
                          <td className="border border-slate-200 px-3 py-2 text-center text-slate-600 font-mono">
                            {st.phone || "—"}
                          </td>
                          <td className="border border-slate-200 px-3 py-2 text-center font-bold text-slate-800">
                            {st.totalClasses}
                          </td>
                          <td className="border border-slate-200 px-3 py-2 text-center font-bold text-emerald-700 bg-emerald-50/30">
                            {st.attendedClasses}
                          </td>
                          <td className="border border-slate-200 px-3 py-2 text-center font-bold text-rose-700 bg-rose-50/30">
                            {st.absentClasses}
                          </td>
                          <td className="border border-slate-200 px-3 py-2 text-center font-mono font-bold">
                            {isZeroConducted ? (
                              <span className="text-slate-400">—</span>
                            ) : st.percentage !== null ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  st.percentage >= 75.0
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {st.percentage.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="border border-slate-200 px-4 py-2 text-center">
                            {isZeroConducted ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                Not Started
                              </span>
                            ) : st.isDefaulter ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                DEFAULTER (&lt;75%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ELIGIBLE
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-12 text-slate-400 font-medium border border-slate-200"
                      >
                        No students found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold pt-2 border-t border-slate-200">
              <div>
                Showing <strong>{filteredStudents.length}</strong> students across{" "}
                <strong>{reportData.totalSessionsConducted}</strong> conducted sessions.
              </div>
              <div>
                Eligibility Threshold: <strong>&ge; 75.00%</strong> | Defaulters in View:{" "}
                <strong className="text-rose-600">{reportData.defaultersCount}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: DAILY MATRIX REGISTER (PERIOD-WISE REGISTER VIEW)
          ========================================================================= */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 no-print">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              {/* Quick Date Presets */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Quick Dates:</span>
                <button
                  onClick={() => {
                    setStartDate("2026-09-22");
                    setEndDate("2026-10-07");
                    fetchReport(selectedSectionId, selectedSubjectId, "2026-09-22", "2026-10-07");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold"
                >
                  All Ingested (22 Sep - 07 Oct)
                </button>
                <button
                  onClick={() => {
                    setStartDate("2026-10-01");
                    setEndDate("2026-10-07");
                    fetchReport(selectedSectionId, selectedSubjectId, "2026-10-01", "2026-10-07");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                >
                  Oct 01 - Oct 07
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                  title="Open native browser print layout"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Register</span>
                </button>
                <button
                  onClick={handleExportDailyMatrixPDF}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B1528] hover:bg-[#6D1020] text-white text-xs font-bold transition shadow-xs"
                  title="Download Daily Register PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleExportDailyMatrixExcel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-xs"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* Selectors Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Section Dropdown */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Class Section *
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.programName} - Sec {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Dropdown */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Subject (Optional Filter)
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">
                    All Subjects (Consolidated - {reportData.totalSessionsConducted} sessions)
                  </option>
                  {availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code}) {sub.count !== undefined ? `— ${sub.count} sessions` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Start Date (From)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  End Date (To)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyDates}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Defaulter Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student roll number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyDefaulters}
                    onChange={(e) => setOnlyDefaulters(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-rose-700 font-bold">Show &lt; 75% Defaulters Only</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
                    {reportData.defaultersCount}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Warning Banner when 0 sessions conducted in Date Range */}
          {sessions.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <strong>No sessions conducted in the selected date range ({startDate} to {endDate}).</strong> Try
                clicking <strong>&quot;All Ingested (22 Sep - 07 Oct)&quot;</strong> above to view conducted classes.
              </div>
            </div>
          )}

          {/* Printable Daily Attendance Register */}
          <div className="bg-white border border-slate-300/80 rounded-3xl p-6 sm:p-8 shadow-xs print-container space-y-4">
            {/* Institutional Header */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-200">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                {COLLEGE_NAME}
              </h1>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-600">
                {COLLEGE_SUBTITLE}
              </h2>
              <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                {selectedSubjectId
                  ? "Subject-Wise Class Daily Attendance Register"
                  : "Consolidated Class Daily Attendance Register"}
              </h3>
              <div className="text-[11px] text-slate-600 font-semibold space-y-0.5 pt-1">
                <div>
                  Department: <strong>{reportData.programName}</strong> | Academic Year:{" "}
                  <strong>2026-2027</strong> | Batch: <strong>2026-2030 Batch</strong>
                </div>
                <div>
                  Year: <strong>{reportData.year || 1}</strong> | Sem:{" "}
                  <strong>{reportData.semester || 1}</strong> | Section:{" "}
                  <strong>{reportData.sectionName}</strong> | Dates: <strong>{startDate}</strong> to{" "}
                  <strong>{endDate}</strong> ({sessions.length} Sessions)
                </div>
              </div>
            </div>

            {/* Matrix Register Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-[11px] print-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    {/* Fixed Columns */}
                    <th
                      rowSpan={3}
                      className="border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 w-28 bg-slate-50"
                    >
                      Roll No
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 min-w-[200px] bg-slate-50"
                    >
                      Name
                    </th>

                    {/* Session Columns */}
                    {sessions.map((s) => (
                      <th
                        key={`d-${s.id}`}
                        className="border border-slate-300 px-2 py-1 text-center font-bold text-slate-800 min-w-[65px] bg-slate-100/70"
                      >
                        {s.formattedDate}
                      </th>
                    ))}

                    {/* Summary Header Columns */}
                    <th
                      rowSpan={3}
                      className="border border-slate-300 px-2.5 py-2 text-center font-bold text-slate-900 bg-slate-100 w-12"
                    >
                      Total
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-300 px-2.5 py-2 text-center font-bold text-emerald-800 bg-emerald-50/80 w-12"
                    >
                      P
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-300 px-2.5 py-2 text-center font-bold text-rose-800 bg-rose-50/80 w-12"
                    >
                      A
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-300 px-2.5 py-2 text-center font-bold text-slate-900 bg-slate-100 w-16"
                    >
                      %
                    </th>
                  </tr>

                  {/* Tier 2: Period Timings */}
                  <tr className="bg-slate-50 border-b border-slate-300">
                    {sessions.map((s) => (
                      <th
                        key={`t-${s.id}`}
                        className="border border-slate-300 px-1 py-1 text-center font-semibold text-[10px] text-slate-600 bg-slate-50 leading-tight"
                      >
                        {s.periodTiming}
                      </th>
                    ))}
                  </tr>

                  {/* Tier 3: Subject Short Code */}
                  <tr className="bg-slate-50 border-b border-slate-300">
                    {sessions.map((s) => (
                      <th
                        key={`s-${s.id}`}
                        className="border border-slate-300 px-1 py-1 text-center font-bold text-[10px] text-blue-900 bg-blue-50/50 leading-tight truncate max-w-[75px]"
                        title={s.subjectName}
                      >
                        {s.subjectShortName}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => (
                      <tr
                        key={st.studentId}
                        className={`border-b border-slate-200 hover:bg-slate-50/80 transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        {/* Roll No */}
                        <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {st.rollNumber}
                        </td>

                        {/* Student Full Name */}
                        <td className="border border-slate-300 px-3 py-1.5 font-bold text-slate-900 uppercase whitespace-nowrap">
                          {st.fullName}
                        </td>

                        {/* Session P / A Cells */}
                        {sessions.map((sess) => {
                          const status = st.attendanceMap?.[sess.id] || "-";
                          const isPresent = status === "P";
                          const isAbsent = status === "A";

                          return (
                            <td
                              key={sess.id}
                              className={`border border-slate-300 px-1 py-1 text-center font-bold text-[11px] ${
                                isPresent
                                  ? "bg-emerald-50 text-emerald-700"
                                  : isAbsent
                                  ? "bg-rose-50 text-rose-700"
                                  : "text-slate-400 bg-slate-50/50"
                              }`}
                            >
                              {status}
                            </td>
                          );
                        })}

                        {/* Summary: Total Conducted */}
                        <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-800">
                          {st.totalClasses}
                        </td>

                        {/* Summary: Attended P */}
                        <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-emerald-700 bg-emerald-50/30">
                          {st.attendedClasses}
                        </td>

                        {/* Summary: Absent A */}
                        <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-rose-700 bg-rose-50/30">
                          {st.absentClasses}
                        </td>

                        {/* Summary: Percentage % */}
                        <td
                          className={`border border-slate-300 px-2 py-1.5 text-center font-mono font-bold ${
                            st.totalClasses === 0
                              ? "text-slate-400"
                              : st.percentage !== null && st.percentage >= 75.0
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-rose-100 text-rose-900"
                          }`}
                        >
                          {st.totalClasses === 0
                            ? "—"
                            : st.percentage !== null
                            ? `${st.percentage.toFixed(2)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={sessions.length + 6}
                        className="text-center py-12 text-slate-400 font-medium border border-slate-300"
                      >
                        No students or sessions found for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Register Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold pt-2 border-t border-slate-200">
              <div>
                Showing <strong>{filteredStudents.length}</strong> students across{" "}
                <strong>{sessions.length}</strong> conducted sessions.
              </div>
              <div>
                Eligibility Threshold: <strong>&ge; 75.00%</strong> | Defaulters in View:{" "}
                <strong className="text-rose-600">{reportData.defaultersCount}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
