"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
  LayoutGrid,
  Phone,
  CalendarX,
  AlertCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import SubjectWiseReportTable, {
  SubjectColumnItem,
} from "./SubjectWiseReportTable";
import MonthlyAttendanceView from "./MonthlyAttendanceView";
import AllSectionsPrintReports from "./AllSectionsPrintReports";
import type { AllSectionsReportResponse } from "@/lib/reportsActions";
import InstitutionalDatePicker from "@/components/InstitutionalDatePicker";

interface SchoolOption {
  id: string;
  name: string;
  code?: string;
}

interface ProgramOption {
  id: string;
  name: string;
  code?: string;
  schoolId?: string;
}

interface SectionOption {
  id: string;
  name: string;
  displayName?: string | null;
  programId?: string;
  programName: string;
  programCode?: string;
  schoolId?: string;
  schoolName?: string;
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
  subjectId?: string;
}

interface StudentReportItem {
  studentId: string;
  rollNumber: string;
  fullName: string;
  phone?: string | null;
  attendanceMap?: Record<string, "P" | "A" | "-">;
  subjectAttendance?: Record<string, number>;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  percentage: number | null;
  isDefaulter: boolean;
}

const COLLEGE_NAME = "GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH";
const COLLEGE_SUBTITLE = "(Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956) • Visakhapatnam";

export default function ReportsClient({
  sections,
  subjects,
  schools = [],
  programs = [],
  initialSectionId,
  initialReport,
}: {
  sections: SectionOption[];
  subjects: SubjectOption[];
  schools?: SchoolOption[];
  programs?: ProgramOption[];
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
    subjectColumns?: SubjectColumnItem[];
    students: StudentReportItem[];
    defaultersCount: number;
    startDate?: string;
    endDate?: string;
  };
}) {
  // Top Active Tab: "subject_wise" | "monthly" | "consolidated" | "matrix" | "defaulters" | "classes_held"
  const [activeTab, setActiveTab] = useState<
    "subject_wise" | "monthly" | "consolidated" | "matrix" | "defaulters" | "classes_held"
  >("subject_wise");

  // Academic Hierarchy States: School -> Program -> Year -> Semester -> Section
  const initialSectionObj = sections.find((s) => s.id === initialSectionId) || sections[0];
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    initialSectionObj?.schoolId || ""
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialSectionObj?.programId || ""
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    initialSectionObj?.year || initialReport.year || 1
  );
  const [selectedSemester, setSelectedSemester] = useState<number>(
    initialSectionObj?.semester || initialReport.semester || 1
  );
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>(
    initialReport.availableSubjects || []
  );

  const [startDate, setStartDate] = useState(initialReport.startDate || "2026-09-22");
  const [endDate, setEndDate] = useState(initialReport.endDate || "2026-10-13");

  const [reportData, setReportData] = useState(initialReport);
  const [searchQuery, setSearchQuery] = useState("");
  const [thresholdMode, setThresholdMode] = useState<
    "ALL" | "75" | "BETWEEN_65_75" | "65" | "60" | "50" | "30" | "CUSTOM" | "RANGE"
  >("ALL");
  const [customThreshold, setCustomThreshold] = useState<number>(60);
  const [rangeMin, setRangeMin] = useState<number>(65);
  const [rangeMax, setRangeMax] = useState<number>(75);
  const [isLoading, setIsLoading] = useState(false);

  // One-Click All Sections Consolidated Report States
  const [allSectionsModalOpen, setAllSectionsModalOpen] = useState(false);
  const [allSectionsData, setAllSectionsData] = useState<AllSectionsReportResponse | null>(null);
  const [allSectionsMode, setAllSectionsMode] = useState<"consolidated" | "subject_wise" | "classes_held">("consolidated");
  const [isLoadingAllSections, setIsLoadingAllSections] = useState(false);

  // Section Classes & Labs Held Dedicated State
  const [classesHeldData, setClassesHeldData] = useState<AllSectionsReportResponse | null>(null);
  const [isLoadingClassesHeld, setIsLoadingClassesHeld] = useState(false);

  const fetchClassesHeldData = async (sDate = startDate, eDate = endDate) => {
    setIsLoadingClassesHeld(true);
    try {
      const params = new URLSearchParams();
      if (sDate) params.append("startDate", sDate);
      if (eDate) params.append("endDate", eDate);
      const res = await fetch(`/api/reports/all-sections?${params.toString()}`);
      const data = await res.json();
      if (data && data.success) {
        setClassesHeldData(data);
      }
    } catch (e) {
      console.error("Error fetching classes held data:", e);
    } finally {
      setIsLoadingClassesHeld(false);
    }
  };

  useEffect(() => {
    if (activeTab === "classes_held" && !classesHeldData && !isLoadingClassesHeld) {
      fetchClassesHeldData(startDate, endDate);
    }
  }, [activeTab]);

  const handleOpenAllSectionsPrint = async (mode: "consolidated" | "subject_wise" | "classes_held") => {
    setIsLoadingAllSections(true);
    setAllSectionsMode(mode);
    try {
      const params = new URLSearchParams();
      if (startDate && startDate.trim()) params.append("startDate", startDate.trim());
      if (endDate && endDate.trim()) params.append("endDate", endDate.trim());

      const res = await fetch(`/api/reports/all-sections?${params.toString()}`);
      const data = await res.json();
      if (data && data.success) {
        setAllSectionsData(data);
        setAllSectionsModalOpen(true);
      } else {
        alert("Unable to compile all sections report: " + (data?.error || data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to load all sections report", err);
      alert("Error fetching all sections report data.");
    } finally {
      setIsLoadingAllSections(false);
    }
  };

  // 1. Available Schools (all schools or derived from sections)
  const availableSchools = useMemo(() => {
    if (schools && schools.length > 0) return schools;
    const sMap = new Map<string, string>();
    sections.forEach((sec) => {
      if (sec.schoolId && sec.schoolName) {
        sMap.set(sec.schoolId, sec.schoolName);
      }
    });
    return Array.from(sMap.entries()).map(([id, name]) => ({ id, name, code: "" }));
  }, [schools, sections]);

  // 2. Available Programs (cascaded by selected school)
  const availablePrograms = useMemo(() => {
    let progs = programs || [];
    if (progs.length === 0) {
      const pMap = new Map<string, { id: string; name: string; schoolId: string }>();
      sections.forEach((sec) => {
        if (sec.programId) {
          pMap.set(sec.programId, {
            id: sec.programId,
            name: sec.programName,
            schoolId: sec.schoolId || "",
          });
        }
      });
      progs = Array.from(pMap.values()).map((p) => ({ ...p, code: "" }));
    }
    if (selectedSchoolId) {
      return progs.filter((p) => p.schoolId === selectedSchoolId);
    }
    return progs;
  }, [programs, sections, selectedSchoolId]);

  // 3. Available Sections (filtered by selected school, program, year, semester)
  const availableSections = useMemo(() => {
    return sections.filter((sec) => {
      if (selectedSchoolId && sec.schoolId && sec.schoolId !== selectedSchoolId) return false;
      if (selectedProgramId && sec.programId && sec.programId !== selectedProgramId) return false;
      if (selectedYear && sec.year !== selectedYear) return false;
      if (selectedSemester && sec.semester !== selectedSemester) return false;
      return true;
    });
  }, [sections, selectedSchoolId, selectedProgramId, selectedYear, selectedSemester]);

  // Active attendance percentage cutoff
  const activeThresholdCutoff = useMemo(() => {
    if (thresholdMode === "ALL" || thresholdMode === "BETWEEN_65_75" || thresholdMode === "RANGE") return null;
    if (thresholdMode === "CUSTOM") return Number.isFinite(customThreshold) ? customThreshold : 0;
    return parseFloat(thresholdMode);
  }, [thresholdMode, customThreshold]);

  // Count of students matching active threshold or range
  const countMatchingThreshold = useMemo(() => {
    if (thresholdMode === "ALL") return 0;
    return reportData.students.filter((s) => {
      if (s.totalClasses === 0 || s.percentage === null) return false;
      if (thresholdMode === "BETWEEN_65_75") {
        return s.percentage >= 65.0 && s.percentage < 75.0;
      }
      if (thresholdMode === "RANGE") {
        const minVal = Number.isFinite(rangeMin) ? rangeMin : 0;
        const maxVal = Number.isFinite(rangeMax) ? rangeMax : 100;
        return s.percentage >= minVal && s.percentage <= maxVal;
      }
      if (thresholdMode === "CUSTOM") {
        const cutoff = Number.isFinite(customThreshold) ? customThreshold : 0;
        return s.percentage < cutoff;
      }
      const cutoff = parseFloat(thresholdMode);
      return !isNaN(cutoff) ? s.percentage < cutoff : false;
    }).length;
  }, [reportData.students, thresholdMode, customThreshold, rangeMin, rangeMax]);

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
          subjectColumns: data.subjectColumns || [],
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

  // 1. School Cascade Handler
  const handleSchoolChange = (newSchoolId: string) => {
    setSelectedSchoolId(newSchoolId);
    // Find programs matching newSchoolId
    const matchingProgs = (programs || []).filter((p) => !newSchoolId || p.schoolId === newSchoolId);
    const nextProgId = matchingProgs.length > 0 ? matchingProgs[0].id : "";
    setSelectedProgramId(nextProgId);

    // Find sections matching
    const matchingSecs = sections.filter((s) => {
      if (newSchoolId && s.schoolId && s.schoolId !== newSchoolId) return false;
      if (nextProgId && s.programId && s.programId !== nextProgId) return false;
      return true;
    });

    if (matchingSecs.length > 0) {
      const nextSec = matchingSecs[0];
      setSelectedYear(nextSec.year || 1);
      setSelectedSemester(nextSec.semester || 1);
      setSelectedSectionId(nextSec.id);
      setSelectedSubjectId("");
      fetchReport(nextSec.id, "", startDate, endDate);
    } else {
      setSelectedSectionId("");
      setSelectedSubjectId("");
      setReportData({
        sectionName: "",
        displayName: "",
        programName: matchingProgs[0]?.name || "Selected Program",
        year: 1,
        semester: 1,
        totalSessionsConducted: 0,
        sessions: [],
        availableSubjects: [],
        subjectColumns: [],
        students: [],
        defaultersCount: 0,
        startDate: startDate,
        endDate: endDate,
      });
    }
  };

  // 2. Program Cascade Handler
  const handleProgramChange = (newProgId: string) => {
    setSelectedProgramId(newProgId);
    const progObj = (programs || []).find((p) => p.id === newProgId);
    if (progObj && progObj.schoolId) {
      setSelectedSchoolId(progObj.schoolId);
    }

    const matchingSecs = sections.filter((s) => {
      if (newProgId && s.programId && s.programId !== newProgId) return false;
      return true;
    });

    if (matchingSecs.length > 0) {
      const nextSec = matchingSecs[0];
      setSelectedYear(nextSec.year || 1);
      setSelectedSemester(nextSec.semester || 1);
      setSelectedSectionId(nextSec.id);
      setSelectedSubjectId("");
      fetchReport(nextSec.id, "", startDate, endDate);
    } else {
      setSelectedSectionId("");
      setSelectedSubjectId("");
      setReportData({
        sectionName: "",
        displayName: "",
        programName: progObj?.name || "Selected Program",
        year: selectedYear,
        semester: selectedSemester,
        totalSessionsConducted: 0,
        sessions: [],
        availableSubjects: [],
        subjectColumns: [],
        students: [],
        defaultersCount: 0,
        startDate: startDate,
        endDate: endDate,
      });
    }
  };

  // 3. Year Cascade Handler
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    const matchingSecs = sections.filter((s) => {
      if (selectedSchoolId && s.schoolId && s.schoolId !== selectedSchoolId) return false;
      if (selectedProgramId && s.programId && s.programId !== selectedProgramId) return false;
      if (newYear && s.year !== newYear) return false;
      return true;
    });

    if (matchingSecs.length > 0) {
      const nextSec = matchingSecs[0];
      setSelectedSemester(nextSec.semester || 1);
      setSelectedSectionId(nextSec.id);
      setSelectedSubjectId("");
      fetchReport(nextSec.id, "", startDate, endDate);
    } else {
      setSelectedSectionId("");
      setSelectedSubjectId("");
      const progObj = (programs || []).find((p) => p.id === selectedProgramId);
      setReportData({
        sectionName: "",
        displayName: "",
        programName: progObj?.name || reportData.programName,
        year: newYear,
        semester: selectedSemester,
        totalSessionsConducted: 0,
        sessions: [],
        availableSubjects: [],
        subjectColumns: [],
        students: [],
        defaultersCount: 0,
        startDate: startDate,
        endDate: endDate,
      });
    }
  };

  // 4. Semester Cascade Handler
  const handleSemesterChange = (newSem: number) => {
    setSelectedSemester(newSem);
    const matchingSecs = sections.filter((s) => {
      if (selectedSchoolId && s.schoolId && s.schoolId !== selectedSchoolId) return false;
      if (selectedProgramId && s.programId && s.programId !== selectedProgramId) return false;
      if (selectedYear && s.year !== selectedYear) return false;
      if (newSem && s.semester !== newSem) return false;
      return true;
    });

    if (matchingSecs.length > 0) {
      const nextSec = matchingSecs[0];
      setSelectedSectionId(nextSec.id);
      setSelectedSubjectId("");
      fetchReport(nextSec.id, "", startDate, endDate);
    } else {
      setSelectedSectionId("");
      setSelectedSubjectId("");
      const progObj = (programs || []).find((p) => p.id === selectedProgramId);
      setReportData({
        sectionName: "",
        displayName: "",
        programName: progObj?.name || reportData.programName,
        year: selectedYear,
        semester: newSem,
        totalSessionsConducted: 0,
        sessions: [],
        availableSubjects: [],
        subjectColumns: [],
        students: [],
        defaultersCount: 0,
        startDate: startDate,
        endDate: endDate,
      });
    }
  };

  // 5. Section Direct Handler
  const handleSectionChange = (newSecId: string) => {
    setSelectedSectionId(newSecId);
    if (!newSecId) {
      setSelectedSubjectId("");
      const progObj = (programs || []).find((p) => p.id === selectedProgramId);
      setReportData({
        sectionName: "",
        displayName: "",
        programName: progObj?.name || reportData.programName,
        year: selectedYear,
        semester: selectedSemester,
        totalSessionsConducted: 0,
        sessions: [],
        availableSubjects: [],
        subjectColumns: [],
        students: [],
        defaultersCount: 0,
        startDate: startDate,
        endDate: endDate,
      });
      return;
    }
    const secObj = sections.find((s) => s.id === newSecId);
    if (secObj) {
      if (secObj.schoolId) setSelectedSchoolId(secObj.schoolId);
      if (secObj.programId) setSelectedProgramId(secObj.programId);
      if (secObj.year) setSelectedYear(secObj.year);
      if (secObj.semester) setSelectedSemester(secObj.semester);
    }
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
    if (activeTab === "classes_held") {
      fetchClassesHeldData(startDate, endDate);
    }
  };

  const handleResetDates = () => {
    setStartDate("2026-09-22");
    setEndDate("2026-10-13");
    fetchReport(selectedSectionId, selectedSubjectId, "2026-09-22", "2026-10-13");
    if (activeTab === "classes_held") {
      fetchClassesHeldData("2026-09-22", "2026-10-13");
    }
  };

  const handleExportClassesHeldExcel = () => {
    if (!classesHeldData) return;
    const worksheetData = [
      [COLLEGE_NAME],
      [COLLEGE_SUBTITLE],
      ["SECTION-WISE NUMBER OF CLASSES & LABS HELD REPORT"],
      [`Attendance Window: ${startDate} to ${endDate} | Generated: ${new Date().toLocaleDateString("en-GB")}`],
      [],
      [
        "S.No",
        "Name of the Course",
        "No. of Classes Held",
        "No. of Labs Held (2 hrs = 1 lab session)",
        "Total Periods Conducted",
      ],
      ...classesHeldData.sections.map((sec, idx) => [
        idx + 1,
        sec.courseDisplayName || sec.displayName,
        sec.theoryClassesHeld ?? 0,
        sec.labsHeld ?? 0,
        sec.totalSessionsConducted,
      ]),
      [
        "",
        `Grand Total (${classesHeldData.sections.length} Sections)`,
        classesHeldData.sections.reduce((acc, s) => acc + (s.theoryClassesHeld ?? 0), 0),
        classesHeldData.sections.reduce((acc, s) => acc + (s.labsHeld ?? 0), 0),
        classesHeldData.sections.reduce((acc, s) => acc + s.totalSessionsConducted, 0),
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classes & Labs Held");
    XLSX.writeFile(
      workbook,
      `Section_Classes_and_Labs_Held_${startDate}_to_${endDate}.xlsx`
    );
  };

  const filteredStudents = useMemo(() => {
    return reportData.students.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (thresholdMode === "ALL") return true;

      if (s.totalClasses === 0 || s.percentage === null) return false;

      if (thresholdMode === "BETWEEN_65_75") {
        return s.percentage >= 65.0 && s.percentage < 75.0;
      }

      if (thresholdMode === "RANGE") {
        const minVal = Number.isFinite(rangeMin) ? rangeMin : 0;
        const maxVal = Number.isFinite(rangeMax) ? rangeMax : 100;
        return s.percentage >= minVal && s.percentage <= maxVal;
      }

      if (thresholdMode === "CUSTOM") {
        const cutoff = Number.isFinite(customThreshold) ? customThreshold : 0;
        return s.percentage < cutoff;
      }

      const cutoff = parseFloat(thresholdMode);
      if (!isNaN(cutoff)) {
        return s.percentage < cutoff;
      }

      return true;
    });
  }, [reportData.students, searchQuery, thresholdMode, customThreshold, rangeMin, rangeMax]);

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

  // Group sessions into 2 days per sheet for print pagination
  const printDayBatches = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    const dateMap = new Map<string, SessionItem[]>();
    sessions.forEach((s) => {
      const key = s.sessionDate || s.formattedDate;
      if (!dateMap.has(key)) {
        dateMap.set(key, []);
      }
      dateMap.get(key)!.push(s);
    });

    const uniqueDateEntries = Array.from(dateMap.entries());
    const DAYS_PER_SHEET = 2;
    const batches: {
      batchNum: number;
      totalBatches: number;
      dateRangeLabel: string;
      days: { dateKey: string; formattedDate: string; sessions: SessionItem[] }[];
      allSessionsInBatch: SessionItem[];
    }[] = [];

    const total = Math.ceil(uniqueDateEntries.length / DAYS_PER_SHEET);

    for (let i = 0; i < uniqueDateEntries.length; i += DAYS_PER_SHEET) {
      const chunk = uniqueDateEntries.slice(i, i + DAYS_PER_SHEET);
      const days = chunk.map(([dateKey, sessList]) => ({
        dateKey,
        formattedDate: sessList[0]?.formattedDate || dateKey,
        sessions: sessList,
      }));
      const allSessionsInBatch = days.flatMap((d) => d.sessions);
      const dateRangeLabel = days.map((d) => d.formattedDate).join(" & ");

      batches.push({
        batchNum: Math.floor(i / DAYS_PER_SHEET) + 1,
        totalBatches: total,
        dateRangeLabel,
        days,
        allSessionsInBatch,
      });
    }

    return batches;
  }, [sessions]);

  // =========================================================================
  // EXPORT: SUBJECT-WISE CONSOLIDATED CSV
  // =========================================================================
  const handleExportSubjectWiseCSV = () => {
    const cols = (reportData.subjectColumns || []).filter((c) => c.conducted > 0);
    const headers = [
      "S.No",
      "Roll Number",
      "Student Name",
      ...cols.map(
        (c) => `"${c.shortName || c.code} (${c.conducted} Conducted)"`
      ),
      `"Total Classes (${reportData.totalSessionsConducted})"`,
      "Total Attended",
      "Attendance %",
      "Defaulter Status",
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.rollNumber}"`,
      `"${s.fullName}"`,
      ...cols.map((c) => s.subjectAttendance?.[c.id] ?? 0),
      reportData.totalSessionsConducted,
      s.attendedClasses,
      s.percentage !== null ? `"${s.percentage}%"` : `"N/A"`,
      s.isDefaulter ? `"DEFAULTER (<75%)"` : `"ELIGIBLE"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `GVPIHLR_Subject_Wise_Attendance_${reportData.sectionName}_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            font-size: 10.5px !important;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #475569 !important;
            padding: 3px 4px !important;
            text-align: center !important;
            font-size: 10px !important;
          }
          .daily-matrix-page,
          .print-page-break {
            break-after: page !important;
            page-break-after: always !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
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

        {/* View Switcher Tabs - Modern Institutional Report Catalog */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab("classes_held");
              if (!classesHeldData) {
                fetchClassesHeldData(startDate, endDate);
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "classes_held"
                ? "bg-white text-emerald-900 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Classes &amp; Labs Held</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 font-black">
              NEW
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("subject_wise")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "subject_wise"
                ? "bg-white text-blue-900 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-blue-600" />
            <span>Subject-Wise Consolidated</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "monthly"
                ? "bg-white text-indigo-900 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Monthly Attendance</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-700 font-black">
              NEW
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("consolidated")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "consolidated"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Section Consolidated</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "matrix"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-emerald-600" />
            <span>Daily Matrix Register</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("defaulters");
              if (thresholdMode === "ALL") setThresholdMode("75");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "defaulters"
                ? "bg-white text-rose-900 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Defaulter Analytics</span>
            {reportData.defaultersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-rose-100 text-rose-700 font-black">
                {reportData.defaultersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          ONE-CLICK ALL SECTIONS PRINT COMPILATION BANNER (Portrait A4)
          ========================================================================= */}
      <div className="relative z-20 bg-gradient-to-r from-[#0B2545] via-[#12335E] to-[#1D4ED8] text-white rounded-3xl p-5 sm:p-6 shadow-md no-print border border-blue-900/40 space-y-4">
        {/* Top Row: Title, Badge and Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-wider text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Official University Examination &amp; Executive Registers (Portrait A4)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Consolidated Attendance for All Sections in 1 Click
            </h3>
            <p className="text-xs text-blue-100 max-w-3xl font-medium leading-relaxed">
              Instantly compile, view, and print institutional attendance across all sections in crisp Portrait A4 format with high-clarity typography (numbers &ge; 10pt) and official university signature blocks.
            </p>
          </div>
        </div>

        {/* Bottom Row: Website Institutional Date Pickers + Action Buttons (No Overflow) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Custom Website Institutional Date Pickers */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200 mr-1">
              Attendance Window:
            </span>
            <InstitutionalDatePicker
              label="From:"
              value={startDate}
              onChange={(d) => setStartDate(d)}
              variant="dark"
            />
            <span className="text-blue-200 text-xs font-bold px-1">to</span>
            <InstitutionalDatePicker
              label="To:"
              value={endDate}
              onChange={(d) => setEndDate(d)}
              variant="dark"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Button 1: Classes & Labs Held All Sections */}
            <button
              type="button"
              disabled={isLoadingAllSections}
              onClick={() => handleOpenAllSectionsPrint("classes_held")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 border border-emerald-500/40"
              title="Generate &amp; Print Section-Wise Classes &amp; Labs Held Report (Portrait A4)"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>
                {isLoadingAllSections && allSectionsMode === "classes_held"
                  ? "Compiling Classes Held..."
                  : "Print Classes & Labs Held"}
              </span>
            </button>

            {/* Button 2: Consolidated All Sections */}
            <button
              type="button"
              disabled={isLoadingAllSections}
              onClick={() => handleOpenAllSectionsPrint("consolidated")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-blue-50 text-xs font-black transition shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50"
              title="Generate &amp; Print Consolidated Attendance of All Sections in 1 Click (Portrait A4)"
            >
              <Printer className="w-4 h-4 text-blue-800" />
              <span>
                {isLoadingAllSections && allSectionsMode === "consolidated"
                  ? "Compiling All Sections..."
                  : "Print All Sections Consolidated"}
              </span>
            </button>

            {/* Button 3: Subject-Wise All Sections */}
            <button
              type="button"
              disabled={isLoadingAllSections}
              onClick={() => handleOpenAllSectionsPrint("subject_wise")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black transition shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 border border-blue-400/40"
              title="Generate &amp; Print Subject-Wise Consolidated Attendance of All Sections in 1 Click (Portrait A4)"
            >
              <LayoutGrid className="w-4 h-4 text-white" />
              <span>
                {isLoadingAllSections && allSectionsMode === "subject_wise"
                  ? "Compiling All Sections..."
                  : "Print All Sections Subject-Wise"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          UNIVERSAL ACADEMIC SELECTOR (School -> Program -> Year -> Semester -> Section)
          Visible across all report tabs, hidden in print
          ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Academic Program &amp; Section Hierarchy
            </h3>
            {isLoading && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">
                Loading Data...
              </span>
            )}
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            {selectedSectionId && reportData.sectionName ? (
              <>
                Active: <span className="font-bold text-blue-900">{reportData.programName}</span> • Year {reportData.year || selectedYear} Sem {reportData.semester || selectedSemester} • <span className="font-bold text-slate-900">Sec {reportData.sectionName}</span>
              </>
            ) : (
              <span className="text-amber-700 font-bold">
                No attendance is marked for this section.
              </span>
            )}
          </div>
        </div>

        {/* 5-Dropdown Hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. School */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              1. School
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="">All Schools</option>
              {availableSchools.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Program */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              2. Program
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => handleProgramChange(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="">All Programs</option>
              {availablePrograms.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Year */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              3. Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Semester */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              4. Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => handleSemesterChange(Number(e.target.value))}
              className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sm) => (
                <option key={sm} value={sm}>
                  Semester {sm}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Section */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              5. Section *
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              className="w-full text-xs font-bold bg-blue-50/70 border border-blue-200 rounded-xl px-3 py-2.5 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableSections.length > 0 ? (
                availableSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Sec {sec.name} ({sec.programName})
                  </option>
                ))
              ) : (
                <option value="">No attendance is marked for this section</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: SUBJECT-WISE CONSOLIDATED REPORT (NEW REQUESTED REGISTER)
          ========================================================================= */}
      {activeTab === "subject_wise" && (
        <div className="space-y-6">
          {/* KPI Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
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
              <p className="text-[11px] text-slate-500 mt-1">Conducted across all subjects</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Section Subjects
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {(reportData.subjectColumns || []).filter((c) => c.conducted > 0).length}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">Subjects</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Conducted for this section</p>
            </div>

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

          {/* Controls Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 no-print">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Date Window
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <InstitutionalDatePicker
                    label="From:"
                    value={startDate}
                    onChange={(d) => setStartDate(d)}
                    variant="light"
                  />
                  <span className="text-slate-400 text-xs font-bold">to</span>
                  <InstitutionalDatePicker
                    label="To:"
                    value={endDate}
                    onChange={(d) => setEndDate(d)}
                    variant="light"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDates}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleExportSubjectWiseCSV}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-bold transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Register</span>
                </button>
                <button
                  type="button"
                  disabled={isLoadingAllSections}
                  onClick={() => handleOpenAllSectionsPrint("subject_wise")}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 flex-shrink-0"
                  title="Print Subject-Wise Consolidated Attendance for All Sections in 1 Click (Portrait A4)"
                >
                  <Printer className="w-4 h-4 text-blue-200" />
                  <span>All Sections (1-Click)</span>
                </button>
              </div>
            </div>

            {/* Search and Defaulter threshold */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
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

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Attendance Filter:
                </span>
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setThresholdMode("ALL")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "ALL"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("75")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "75"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("BETWEEN_65_75")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "BETWEEN_65_75"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                    title="Between 65% and 75% Attendance (Condonable Range)"
                  >
                    65% – 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("65")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "65"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 65%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("60")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "60"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 60%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("50")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "50"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("30")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "30"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 30%
                  </button>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                      thresholdMode === "CUSTOM"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">&lt;</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={thresholdMode === "CUSTOM" ? customThreshold : ""}
                      placeholder="Custom"
                      onFocus={() => setThresholdMode("CUSTOM")}
                      onChange={(e) => {
                        setThresholdMode("CUSTOM");
                        const val = Number(e.target.value);
                        setCustomThreshold(isNaN(val) ? 0 : val);
                      }}
                      className={`w-12 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "CUSTOM"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>

                  {/* Range Input: Admin specifies Min % to Max % */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                      thresholdMode === "RANGE"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">Range:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={thresholdMode === "RANGE" ? rangeMin : ""}
                      placeholder="Min"
                      onFocus={() => setThresholdMode("RANGE")}
                      onChange={(e) => {
                        setThresholdMode("RANGE");
                        const val = Number(e.target.value);
                        setRangeMin(isNaN(val) ? 0 : val);
                      }}
                      className={`w-11 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "RANGE"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                      title="Minimum Percentage"
                    />
                    <span className="text-xs font-bold">%–</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={thresholdMode === "RANGE" ? rangeMax : ""}
                      placeholder="Max"
                      onFocus={() => setThresholdMode("RANGE")}
                      onChange={(e) => {
                        setThresholdMode("RANGE");
                        const val = Number(e.target.value);
                        setRangeMax(isNaN(val) ? 100 : val);
                      }}
                      className={`w-11 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "RANGE"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                      title="Maximum Percentage"
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>
                </div>

                {thresholdMode !== "ALL" && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-rose-100 text-rose-800 font-bold">
                    {countMatchingThreshold} students
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Conditional: Placeholder if No Attendance is Marked, else render SubjectWiseReportTable */}
          {reportData.totalSessionsConducted === 0 || !selectedSectionId ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <CalendarX className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  No attendance is marked for this section.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Attendance records or class sessions have not been recorded for this section yet.
                  Records will automatically populate once faculty post session attendance.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  0 Sessions Conducted • All Database Records Preserved
                </span>
              </div>
            </div>
          ) : (
            <SubjectWiseReportTable
              students={filteredStudents}
              subjectColumns={reportData.subjectColumns || []}
              totalSessionsConducted={reportData.totalSessionsConducted}
              sectionName={reportData.sectionName}
              programName={reportData.programName}
              year={reportData.year}
              semester={reportData.semester}
              startDate={startDate}
              endDate={endDate}
              onExportCSV={handleExportSubjectWiseCSV}
            />
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW: MONTHLY ATTENDANCE (MONTHLY CONSOLIDATED & MONTHLY SUBJECT-WISE)
          ========================================================================= */}
      {activeTab === "monthly" && (
        <MonthlyAttendanceView
          students={filteredStudents}
          sessions={reportData.sessions || []}
          sectionName={reportData.sectionName}
          programName={reportData.programName}
          year={reportData.year}
          semester={reportData.semester}
        />
      )}

      {/* =========================================================================
          VIEW 2: CONSOLIDATED REPORT (PREVIOUS ROSTER VIEW)
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
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#8B1528] hover:bg-[#6D1020] text-white text-xs font-bold transition shadow-xs"
                  title="Download Consolidated PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleExportConsolidatedExcel}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-xs"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Excel</span>
                </button>
                <button
                  type="button"
                  disabled={isLoadingAllSections}
                  onClick={() => handleOpenAllSectionsPrint("consolidated")}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 flex-shrink-0"
                  title="Print All Sections Consolidated Attendance in 1 Click (Portrait A4)"
                >
                  <Printer className="w-4 h-4 text-blue-200" />
                  <span>All Sections (1-Click)</span>
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

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Attendance:
                </span>
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setThresholdMode("ALL")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "ALL"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("75")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "75"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("BETWEEN_65_75")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "BETWEEN_65_75"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                    title="Between 65% and 75% Attendance (Condonable Range)"
                  >
                    65% – 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("65")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "65"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 65%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("60")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "60"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 60%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("50")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "50"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("30")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "30"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 30%
                  </button>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                      thresholdMode === "CUSTOM"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">&lt;</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={thresholdMode === "CUSTOM" ? customThreshold : ""}
                      placeholder="Custom"
                      onFocus={() => setThresholdMode("CUSTOM")}
                      onChange={(e) => {
                        setThresholdMode("CUSTOM");
                        const val = Number(e.target.value);
                        setCustomThreshold(isNaN(val) ? 0 : val);
                      }}
                      className={`w-12 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "CUSTOM"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>

                  {/* Range Input: Admin specifies Min % to Max % */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                      thresholdMode === "RANGE"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">Range:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={thresholdMode === "RANGE" ? rangeMin : ""}
                      placeholder="Min"
                      onFocus={() => setThresholdMode("RANGE")}
                      onChange={(e) => {
                        setThresholdMode("RANGE");
                        const val = Number(e.target.value);
                        setRangeMin(isNaN(val) ? 0 : val);
                      }}
                      className={`w-11 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "RANGE"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                      title="Minimum Percentage"
                    />
                    <span className="text-xs font-bold">%–</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={thresholdMode === "RANGE" ? rangeMax : ""}
                      placeholder="Max"
                      onFocus={() => setThresholdMode("RANGE")}
                      onChange={(e) => {
                        setThresholdMode("RANGE");
                        const val = Number(e.target.value);
                        setRangeMax(isNaN(val) ? 100 : val);
                      }}
                      className={`w-11 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "RANGE"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                      title="Maximum Percentage"
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>
                </div>

                {thresholdMode !== "ALL" && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-rose-100 text-rose-800 font-bold">
                    {countMatchingThreshold} students
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Conditional: Placeholder if No Attendance is Marked, else render Consolidated Table */}
          {reportData.totalSessionsConducted === 0 || !selectedSectionId ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <CalendarX className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  No attendance is marked for this section.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Attendance records or class sessions have not been recorded for this section yet.
                  Records will automatically populate once faculty post session attendance.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  0 Sessions Conducted • All Database Records Preserved
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 print-container">
            {/* Table Institutional Header with Logo in Same Row */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                <img
                  src="/gvpihlr.png"
                  alt="GVPIHLR University Crest"
                  className="max-h-16 max-w-16 sm:max-h-20 sm:max-w-20 object-contain"
                />
              </div>

              <div className="text-center flex-1 space-y-1">
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

              <div className="w-16 sm:w-20 flex-shrink-0 hidden sm:block print:block" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-xs print-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-bold w-12 print:w-8 print:p-1 print:text-[10px]">
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
                    <th className="border border-slate-200 px-4 py-2.5 text-center font-bold w-36 print:hidden">
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
                          <td className="border border-slate-200 px-4 py-2 text-center print:hidden">
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

            {/* Official Signature Footnote for Printed Register (Strict Single Row in Print) */}
            <table className="w-full border-none mt-10 print-signatures-table print-only">
              <tbody>
                <tr>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Class Coordinator / Mentor
                    </div>
                  </td>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Head of Department (HOD)
                    </div>
                  </td>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Dean of Academic Affairs
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          )}
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Daily Attendance Matrix Register
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  (Multi-period daily matrix with totals)
                </span>
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
                <InstitutionalDatePicker
                  value={startDate}
                  onChange={(d) => setStartDate(d)}
                  variant="light"
                  className="w-full"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  End Date (To)
                </label>
                <div className="flex items-center gap-2">
                  <InstitutionalDatePicker
                    value={endDate}
                    onChange={(d) => setEndDate(d)}
                    variant="light"
                    className="w-full"
                  />
                  <button
                    type="button"
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

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Attendance:
                </span>
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setThresholdMode("ALL")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "ALL"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("75")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "75"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("BETWEEN_65_75")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "BETWEEN_65_75"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                    title="Between 65% and 75% Attendance (Condonable Range)"
                  >
                    65% – 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("65")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "65"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 65%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("60")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "60"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 60%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("50")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "50"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("30")}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                      thresholdMode === "30"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    &lt; 30%
                  </button>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                      thresholdMode === "CUSTOM"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">&lt;</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={thresholdMode === "CUSTOM" ? customThreshold : ""}
                      placeholder="Custom"
                      onFocus={() => setThresholdMode("CUSTOM")}
                      onChange={(e) => {
                        setThresholdMode("CUSTOM");
                        const val = Number(e.target.value);
                        setCustomThreshold(isNaN(val) ? 0 : val);
                      }}
                      className={`w-12 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "CUSTOM"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>

                  {/* Range Input: Admin specifies Min % to Max % */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                      thresholdMode === "RANGE"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">Range:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={thresholdMode === "RANGE" ? rangeMin : ""}
                      placeholder="Min"
                      onFocus={() => setThresholdMode("RANGE")}
                      onChange={(e) => {
                        setThresholdMode("RANGE");
                        const val = Number(e.target.value);
                        setRangeMin(isNaN(val) ? 0 : val);
                      }}
                      className={`w-11 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "RANGE"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                      title="Minimum Percentage"
                    />
                    <span className="text-xs font-bold">%–</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={thresholdMode === "RANGE" ? rangeMax : ""}
                      placeholder="Max"
                      onFocus={() => setThresholdMode("RANGE")}
                      onChange={(e) => {
                        setThresholdMode("RANGE");
                        const val = Number(e.target.value);
                        setRangeMax(isNaN(val) ? 100 : val);
                      }}
                      className={`w-11 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "RANGE"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                      title="Maximum Percentage"
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>
                </div>

                {thresholdMode !== "ALL" && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-rose-100 text-rose-800 font-bold">
                    {countMatchingThreshold} students
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Conditional: Placeholder if No Attendance is Marked, else render Daily Matrix Register */}
          {sessions.length === 0 || reportData.totalSessionsConducted === 0 || !selectedSectionId ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <CalendarX className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  No attendance is marked for this section.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Attendance records or class sessions have not been recorded for this section yet.
                  Records will automatically populate once faculty post session attendance.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  0 Sessions Conducted • All Database Records Preserved
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Live Daily Attendance Register (Screen Only) */}
              <div className="bg-white border border-slate-300/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4 max-w-full overflow-hidden no-print">
            {/* Table Institutional Header with Logo in Same Row */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                <img
                  src="/gvpihlr.png"
                  alt="GVPIHLR University Crest"
                  className="max-h-16 max-w-16 sm:max-h-20 sm:max-w-20 object-contain"
                />
              </div>

              <div className="text-center flex-1 space-y-1">
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

              <div className="w-16 sm:w-20 flex-shrink-0 hidden sm:block print:block" />
            </div>

            {/* Matrix Register Table - Contained Scroll with Freeze Panes */}
            <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-300/90 shadow-2xs">
              <table className="w-full min-w-max border-collapse border-slate-300 text-[11px] print-table">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    {/* Fixed Freeze Columns */}
                    <th
                      rowSpan={3}
                      className="sticky left-0 bg-slate-100 z-20 border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 w-28 shadow-[1px_0_0_0_#cbd5e1]"
                    >
                      Roll No
                    </th>
                    <th
                      rowSpan={3}
                      className="sticky left-28 bg-slate-100 z-20 border border-slate-300 px-3 py-2 text-left font-bold text-slate-800 min-w-[190px] shadow-[2px_0_4px_0_rgba(0,0,0,0.06)]"
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
                        {/* Roll No (Sticky Freeze) */}
                        <td className="sticky left-0 bg-white z-10 border border-slate-300 px-3 py-1.5 font-mono font-bold text-slate-900 whitespace-nowrap shadow-[1px_0_0_0_#e2e8f0]">
                          <Link
                            href={`/admin/students/${st.studentId}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {st.rollNumber}
                          </Link>
                        </td>

                        {/* Student Full Name (Sticky Freeze) */}
                        <td className="sticky left-28 bg-white z-10 border border-slate-300 px-3 py-1.5 font-bold text-slate-900 uppercase whitespace-nowrap shadow-[2px_0_4px_0_rgba(0,0,0,0.06)]">
                          <Link
                            href={`/admin/students/${st.studentId}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {st.fullName}
                          </Link>
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

            {/* Official Signature Footnote for Printed Register (Strict Single Row in Print) */}
            <table className="w-full border-none mt-10 print-signatures-table print-only">
              <tbody>
                <tr>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Class Coordinator / Mentor
                    </div>
                  </td>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Head of Department (HOD)
                    </div>
                  </td>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Dean of Academic Affairs
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* =========================================================================
              PRINT-ONLY PAGINATED DAILY ATTENDANCE REGISTER
              2 Days per page + Final Summary Page (Total Held, Attended, %, Signatures)
              All numbers formatted >= 10px
              ========================================================================= */}
          <div className="hidden print:block space-y-8">
            {printDayBatches.map((batch) => (
              <div
                key={`matrix-batch-${batch.batchNum}`}
                className="daily-matrix-page print-page-break bg-white p-2 space-y-3"
              >
                {/* Institutional Header with Logo in Same Row */}
                <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-slate-400">
                  <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                    <img
                      src="/gvpihlr.png"
                      alt="GVPIHLR University Crest"
                      className="max-h-16 max-w-16 object-contain"
                    />
                  </div>

                  <div className="text-center flex-1 space-y-0.5">
                    <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                      {COLLEGE_NAME}
                    </h1>
                    <h2 className="text-[11px] font-semibold text-slate-700">
                      {COLLEGE_SUBTITLE}
                    </h2>
                    <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300">
                      <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase">
                        Daily Attendance Register • Sheet {batch.batchNum} of {batch.totalBatches + 1}
                      </h3>
                    </div>
                    <div className="text-[10px] text-slate-600 font-semibold space-y-0.5 pt-1">
                      <div>
                        Department: <strong>{reportData.programName}</strong> | Year:{" "}
                        <strong>{reportData.year || 1}</strong> | Semester:{" "}
                        <strong>{reportData.semester || 1}</strong> | Section:{" "}
                        <strong>{reportData.sectionName}</strong>
                      </div>
                      <div>
                        Sessions Recorded: <strong>{batch.dateRangeLabel}</strong> ({batch.allSessionsInBatch.length} Periods)
                      </div>
                    </div>
                  </div>

                  <div className="w-16 flex-shrink-0 text-right text-[10px] text-slate-600 font-bold">
                    Sheet {batch.batchNum}/{batch.totalBatches + 1}
                  </div>
                </div>

                {/* 2-Day Session Matrix Table */}
                <table className="w-full border-collapse border border-slate-400 text-[10.5px] print-table">
                  <thead>
                    {/* Row 1: Roll No, Name, and Date Blocks */}
                    <tr className="bg-slate-100 border-b border-slate-400">
                      <th
                        rowSpan={3}
                        className="border border-slate-400 px-1 py-1 text-center font-bold text-slate-900 w-8 text-[10px]"
                      >
                        #
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-400 px-2 py-1 text-left font-bold text-slate-900 w-24 text-[10.5px]"
                      >
                        Roll No
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-400 px-2 py-1 text-left font-bold text-slate-900 min-w-[140px] text-[10.5px]"
                      >
                        Student Name
                      </th>
                      {batch.days.map((day) => (
                        <th
                          key={day.dateKey}
                          colSpan={day.sessions.length}
                          className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-900 bg-slate-200/90 text-[11px]"
                        >
                          {day.formattedDate} ({day.sessions.length} {day.sessions.length === 1 ? "Period" : "Periods"})
                        </th>
                      ))}
                    </tr>

                    {/* Row 2: Period Timings */}
                    <tr className="bg-slate-50 border-b border-slate-400">
                      {batch.allSessionsInBatch.map((s) => (
                        <th
                          key={`pt-${s.id}`}
                          className="border border-slate-400 px-1 py-0.5 text-center font-semibold text-[10px] text-slate-700 bg-slate-50"
                        >
                          {s.periodTiming}
                        </th>
                      ))}
                    </tr>

                    {/* Row 3: Subject Short Code */}
                    <tr className="bg-slate-50 border-b border-slate-400">
                      {batch.allSessionsInBatch.map((s) => (
                        <th
                          key={`sc-${s.id}`}
                          className="border border-slate-400 px-1 py-0.5 text-center font-bold text-[10px] text-blue-900 bg-blue-50/50"
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
                          className={`border-b border-slate-400 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                          }`}
                        >
                          <td className="border border-slate-400 px-1 py-1 text-center font-mono font-semibold text-slate-600 text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-400 px-2 py-1 font-mono font-bold text-slate-900 whitespace-nowrap text-[10.5px]">
                            {st.rollNumber}
                          </td>
                          <td className="border border-slate-400 px-2 py-1 font-bold text-slate-900 uppercase truncate max-w-[170px] text-[10.5px]">
                            {st.fullName}
                          </td>
                          {batch.allSessionsInBatch.map((sess) => {
                            const status = st.attendanceMap?.[sess.id] || "-";
                            const isPresent = status === "P";
                            const isAbsent = status === "A";

                            return (
                              <td
                                key={sess.id}
                                className={`border border-slate-400 px-1 py-1 text-center font-bold text-[10.5px] ${
                                  isPresent
                                    ? "text-emerald-800 bg-emerald-50/60"
                                    : isAbsent
                                    ? "text-rose-800 bg-rose-50/60"
                                    : "text-slate-400"
                                }`}
                              >
                                {status}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={batch.allSessionsInBatch.length + 3}
                          className="text-center py-6 text-slate-400 font-medium border border-slate-400"
                        >
                          No student records available for printing.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Footer on Sheet */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200">
                  <span>Gayatri Vidya Parishad Institute of Higher Learning and Research</span>
                  <span>Daily Matrix Register • Sheet {batch.batchNum} of {batch.totalBatches + 1}</span>
                </div>
              </div>
            ))}

            {/* Final Page: Cumulative Totals & Signatures */}
            <div className="daily-matrix-page print-page-break bg-white p-2 space-y-4">
              {/* Institutional Header with Logo in Same Row */}
              <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-slate-400">
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <img
                    src="/gvpihlr.png"
                    alt="GVPIHLR University Crest"
                    className="max-h-16 max-w-16 object-contain"
                  />
                </div>

                <div className="text-center flex-1 space-y-0.5">
                  <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                    {COLLEGE_NAME}
                  </h1>
                  <h2 className="text-[11px] font-semibold text-slate-700">
                    {COLLEGE_SUBTITLE}
                  </h2>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300">
                    <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase">
                      Cumulative Attendance Summary &amp; Eligibility Register (Final Sheet)
                    </h3>
                  </div>
                  <div className="text-[10px] text-slate-600 font-semibold space-y-0.5 pt-1">
                    <div>
                      Department: <strong>{reportData.programName}</strong> | Year:{" "}
                      <strong>{reportData.year || 1}</strong> | Semester:{" "}
                      <strong>{reportData.semester || 1}</strong> | Section:{" "}
                      <strong>{reportData.sectionName}</strong>
                    </div>
                    <div>
                      Cumulative Window: <strong>{startDate}</strong> to <strong>{endDate}</strong> ({sessions.length} Total Conducted Sessions)
                    </div>
                  </div>
                </div>

                <div className="w-16 flex-shrink-0 text-right text-[10px] text-slate-600 font-bold">
                  Final Sheet ({printDayBatches.length + 1}/{printDayBatches.length + 1})
                </div>
              </div>

              {/* Cumulative Summary Table */}
              <table className="w-full border-collapse border border-slate-400 text-[10.5px] print-table">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 text-[10.5px]">
                    <th className="border border-slate-400 px-1 py-1.5 text-center font-bold w-10 text-[10px]">
                      #
                    </th>
                    <th className="border border-slate-400 px-3 py-1.5 text-left font-bold w-28 text-[10.5px]">
                      Roll Number
                    </th>
                    <th className="border border-slate-400 px-3 py-1.5 text-left font-bold text-[10.5px]">
                      Student Name
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center font-bold w-24 text-[10.5px]">
                      Total Held
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center font-bold text-emerald-900 bg-emerald-50/70 w-28 text-[10.5px]">
                      Total Attended
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center font-bold text-rose-900 bg-rose-50/70 w-24 text-[10.5px]">
                      Total Absent
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center font-bold w-28 text-[10.5px]">
                      Percentage (%)
                    </th>
                    <th className="border border-slate-400 px-3 py-1.5 text-center font-bold w-36 text-[10px]">
                      Eligibility Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => {
                      const isEligible = st.percentage !== null && st.percentage >= 75.0;
                      return (
                        <tr
                          key={st.studentId}
                          className={`border-b border-slate-400 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                          }`}
                        >
                          <td className="border border-slate-400 px-1 py-1 text-center font-mono font-semibold text-slate-600 text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-400 px-3 py-1 font-mono font-bold text-slate-900 whitespace-nowrap text-[10.5px]">
                            {st.rollNumber}
                          </td>
                          <td className="border border-slate-400 px-3 py-1 font-bold text-slate-900 uppercase text-[10.5px]">
                            {st.fullName}
                          </td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-800 text-[10.5px]">
                            {st.totalClasses}
                          </td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-bold text-emerald-800 bg-emerald-50/30 text-[10.5px]">
                            {st.attendedClasses}
                          </td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-bold text-rose-800 bg-rose-50/30 text-[10.5px]">
                            {st.absentClasses}
                          </td>
                          <td
                            className={`border border-slate-400 px-2 py-1 text-center font-mono font-bold text-[10.5px] ${
                              st.totalClasses === 0
                                ? "text-slate-400"
                                : isEligible
                                ? "text-emerald-800 bg-emerald-50/50"
                                : "text-rose-800 bg-rose-50/50"
                            }`}
                          >
                            {st.totalClasses === 0
                              ? "—"
                              : st.percentage !== null
                              ? `${st.percentage.toFixed(2)}%`
                              : "—"}
                          </td>
                          <td className="border border-slate-400 px-3 py-1 text-center font-bold text-[10px]">
                            {st.totalClasses === 0 ? (
                              <span className="text-slate-400">Not Started</span>
                            ) : isEligible ? (
                              <span className="text-emerald-700">ELIGIBLE</span>
                            ) : (
                              <span className="text-rose-700">DEFAULTER (&lt;75%)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-400 font-medium border border-slate-400">
                        No student records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Official Signatures Row */}
              <table className="w-full border-none mt-10 print-signatures-table">
                <tbody>
                  <tr>
                    <td className="w-1/3 text-center border-none px-4">
                      <div className="border-t-2 border-slate-700 pt-2 text-[11px] font-bold text-slate-900">
                        Class Coordinator / Mentor
                      </div>
                    </td>
                    <td className="w-1/3 text-center border-none px-4">
                      <div className="border-t-2 border-slate-700 pt-2 text-[11px] font-bold text-slate-900">
                        Head of Department (HOD)
                      </div>
                    </td>
                    <td className="w-1/3 text-center border-none px-4">
                      <div className="border-t-2 border-slate-700 pt-2 text-[11px] font-bold text-slate-900">
                        Dean of Academic Affairs
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 4: DEFAULTER ANALYTICS & INTERVENTION LIST
          ========================================================================= */}
      {activeTab === "defaulters" && (
        <div className="space-y-6">
          {/* Defaulter Action Header */}
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>MANDATORY ATTENDANCE DEFICIT ALERT</span>
              </div>
              <h3 className="text-xl font-black text-rose-950">
                Attendance Defaulters &amp; Direct Parent Communication
              </h3>
              <p className="text-xs text-rose-800/80 max-w-2xl">
                Students below statutory university attendance guidelines. Use the direct dial buttons to contact parents or students directly from mobile.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#8B1528] hover:bg-[#6D1020] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Defaulter Notice</span>
              </button>
            </div>
          </div>

          {/* Defaulters Filter Controls */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Threshold:</span>
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setThresholdMode("75")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      thresholdMode === "75"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    &lt; 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("BETWEEN_65_75")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      thresholdMode === "BETWEEN_65_75"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Between 65% and 75% Attendance (Condonable Range)"
                  >
                    65% – 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("65")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      thresholdMode === "65"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    &lt; 65%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("60")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      thresholdMode === "60"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    &lt; 60%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("50")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      thresholdMode === "50"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    &lt; 50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdMode("30")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      thresholdMode === "30"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    &lt; 30%
                  </button>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                      thresholdMode === "CUSTOM"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">&lt;</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={thresholdMode === "CUSTOM" ? customThreshold : ""}
                      placeholder="Custom"
                      onFocus={() => setThresholdMode("CUSTOM")}
                      onChange={(e) => {
                        setThresholdMode("CUSTOM");
                        const val = Number(e.target.value);
                        setCustomThreshold(isNaN(val) ? 0 : val);
                      }}
                      className={`w-14 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "CUSTOM"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>

                  {/* Range Input: Admin specifies Min % to Max % */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                      thresholdMode === "RANGE"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">Range:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={thresholdMode === "RANGE" ? rangeMin : ""}
                      placeholder="Min"
                      onFocus={() => setThresholdMode("RANGE")}
                      onChange={(e) => {
                        setThresholdMode("RANGE");
                        const val = Number(e.target.value);
                        setRangeMin(isNaN(val) ? 0 : val);
                      }}
                      className={`w-11 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "RANGE"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                      title="Minimum Percentage"
                    />
                    <span className="text-xs font-bold">%–</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={thresholdMode === "RANGE" ? rangeMax : ""}
                      placeholder="Max"
                      onFocus={() => setThresholdMode("RANGE")}
                      onChange={(e) => {
                        setThresholdMode("RANGE");
                        const val = Number(e.target.value);
                        setRangeMax(isNaN(val) ? 100 : val);
                      }}
                      className={`w-11 px-1 py-0.5 text-xs font-bold rounded text-center focus:outline-none ${
                        thresholdMode === "RANGE"
                          ? "bg-white text-rose-900"
                          : "bg-transparent text-slate-900 placeholder-slate-400"
                      }`}
                      title="Maximum Percentage"
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] bg-rose-100 text-rose-800 font-bold">
                  {filteredStudents.length} students
                </span>
              </div>

              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search defaulter roll number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Conditional: Placeholder if No Attendance is Marked, else render Defaulter Table */}
          {reportData.totalSessionsConducted === 0 || !selectedSectionId ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <CalendarX className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  No attendance is marked for this section.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Attendance records or class sessions have not been recorded for this section yet.
                  Records will automatically populate once faculty post session attendance.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  0 Sessions Conducted • All Database Records Preserved
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-300/80 rounded-3xl p-6 shadow-xs max-w-full overflow-hidden">
            <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-max border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-left font-bold text-slate-700">
                    <th className="px-3 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3 min-w-[200px]">Student Name</th>
                    <th className="px-3 py-3 text-center">Classes Held</th>
                    <th className="px-3 py-3 text-center">Attended</th>
                    <th className="px-3 py-3 text-center">Absent</th>
                    <th className="px-3 py-3 text-center">Percentage</th>
                    <th className="px-3 py-3 text-center">Classes to 75%</th>
                    <th className="px-4 py-3 text-center no-print">Direct Call Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, idx) => {
                      // Calculate shortfall classes needed to reach 75%
                      const needed = Math.max(
                        0,
                        Math.ceil((0.75 * student.totalClasses - student.attendedClasses) / 0.25)
                      );

                      return (
                        <tr key={student.studentId} className="hover:bg-rose-50/30 transition">
                          <td className="px-3 py-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            <Link
                              href={`/admin/students/${student.studentId}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {student.rollNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            <Link
                              href={`/admin/students/${student.studentId}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {student.fullName}
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-semibold text-slate-600">
                            {student.totalClasses}
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">
                            {student.attendedClasses}
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-bold text-rose-600">
                            {student.absentClasses}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="px-2 py-1 rounded-lg text-xs font-black bg-rose-100 text-rose-700">
                              {student.percentage}%
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-bold text-amber-700">
                            +{needed} consecutive
                          </td>
                          <td className="px-4 py-3 text-center no-print">
                            <div className="flex items-center justify-center gap-1.5">
                              {student.phone ? (
                                <a
                                  href={`tel:${student.phone}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold transition"
                                  title="Call Student"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>Student</span>
                                </a>
                              ) : null}
                              <Link
                                href={`/admin/students/${student.studentId}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold transition"
                                title="Open Profile to Call Parent"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Parent</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signature Footnote for Printed Register (Strict Single Row in Print) */}
            <table className="w-full border-none mt-10 print-signatures-table print-only">
              <tbody>
                <tr>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Class Coordinator / Mentor
                    </div>
                  </td>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Head of Department (HOD)
                    </div>
                  </td>
                  <td className="w-1/3 text-center border-none px-4">
                    <div className="border-t border-slate-600 pt-2 text-xs font-bold text-slate-800">
                      Dean of Academic Affairs
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
      {/* =========================================================================
          VIEW 6: SECTION CLASSES & LABS HELD REPORT (ON-SCREEN VIEW)
          ========================================================================= */}
      {activeTab === "classes_held" && (
        <div className="space-y-6">
          {/* Header Controls Banner */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 text-[10px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Section-Wise Academic Delivery Compilation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Section-Wise Number of Classes &amp; Labs Held
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Displays theory classes and lab sessions held for all sections (2 hours of lab counted as 1 lab session).
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportClassesHeldExcel}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Export Excel</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAllSectionsPrint("classes_held")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Portrait A4</span>
              </button>
            </div>
          </div>

          {/* Date Picker Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attendance Period:
              </span>
              <InstitutionalDatePicker
                label="From:"
                value={startDate}
                onChange={(d) => setStartDate(d)}
                variant="light"
              />
              <span className="text-slate-400 font-bold text-xs">—</span>
              <InstitutionalDatePicker
                label="To:"
                value={endDate}
                onChange={(d) => setEndDate(d)}
                variant="light"
              />
              <button
                type="button"
                disabled={isLoadingClassesHeld}
                onClick={() => fetchClassesHeldData(startDate, endDate)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoadingClassesHeld ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Apply Dates</span>
                )}
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Active Window: <strong className="text-slate-800">{startDate} to {endDate}</strong>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Sections
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {classesHeldData?.sections.length ?? 0}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">Sections</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Active sections across programs</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Theory Classes Held
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {classesHeldData?.sections.reduce((acc, s) => acc + (s.theoryClassesHeld ?? 0), 0) ?? 0}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">Classes</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Conducted lecture periods</p>
            </div>

            <div className="bg-white border border-emerald-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Labs Held (2 hrs = 1)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                {classesHeldData?.sections.reduce((acc, s) => acc + (s.labsHeld ?? 0), 0) ?? 0}
                <span className="text-xs font-semibold text-emerald-500 ml-1.5">Lab Sessions</span>
              </div>
              <p className="text-[11px] text-emerald-600/80 mt-1">2 periods counted as 1 lab session</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Periods Conducted
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {classesHeldData?.sections.reduce((acc, s) => acc + s.totalSessionsConducted, 0) ?? 0}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">Periods</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total teaching hours in timetable</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs overflow-hidden">
            {isLoadingClassesHeld && !classesHeldData ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="font-semibold text-sm">Compiling section classes &amp; labs held data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-black">
                      <th className="p-3 text-center w-14">S.No</th>
                      <th className="p-3">Name of the Course</th>
                      <th className="p-3 text-center w-40">No. of Classes Held</th>
                      <th className="p-3 text-center w-52">
                        No. of Labs Held
                        <span className="block text-[10px] font-normal text-slate-500">
                          (2 hrs = 1 lab session)
                        </span>
                      </th>
                      <th className="p-3 text-center w-44">Total Periods Conducted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(classesHeldData?.sections || []).map((sec, idx) => (
                      <tr key={sec.sectionId} className="hover:bg-blue-50/40 transition">
                        <td className="p-3 text-center font-bold text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 text-sm">
                          {sec.courseDisplayName || sec.displayName}
                          <span className="block text-[11px] font-normal text-slate-400">
                            {sec.programName}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800 font-mono text-sm">
                          {sec.theoryClassesHeld ?? 0}
                        </td>
                        <td className="p-3 text-center font-black text-emerald-700 font-mono text-sm">
                          {sec.labsHeld ?? 0}
                        </td>
                        <td className="p-3 text-center font-black text-blue-900 font-mono text-sm">
                          {sec.totalSessionsConducted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={2} className="p-3 text-right uppercase tracking-wider text-xs">
                        Grand Total ({(classesHeldData?.sections || []).length} Sections)
                      </td>
                      <td className="p-3 text-center font-mono text-sm">
                        {(classesHeldData?.sections || []).reduce((acc, s) => acc + (s.theoryClassesHeld ?? 0), 0)}
                      </td>
                      <td className="p-3 text-center font-mono text-sm text-emerald-800">
                        {(classesHeldData?.sections || []).reduce((acc, s) => acc + (s.labsHeld ?? 0), 0)}
                      </td>
                      <td className="p-3 text-center font-mono text-sm text-blue-950">
                        {(classesHeldData?.sections || []).reduce((acc, s) => acc + s.totalSessionsConducted, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ONE-CLICK ALL SECTIONS PRINT MODAL (Portrait A4)
          ========================================================================= */}
      {allSectionsModalOpen && allSectionsData && (
        <AllSectionsPrintReports
          data={allSectionsData}
          initialMode={allSectionsMode}
          onClose={() => setAllSectionsModalOpen(false)}
        />
      )}
    </div>
  );
}
