"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import StudentIdCard, { StudentIdCardData } from "./StudentIdCard";
import {
  CreditCard,
  Printer,
  Search,
  School,
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  Upload,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";

export interface StudentRecord {
  id: string;
  rollNumber: string;
  fullName: string;
  phone?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  dateOfBirth?: string | null;
  programName?: string | null;
  programCode?: string | null;
  schoolName?: string | null;
  schoolId?: string | null;
  programId?: string | null;
  sectionName?: string | null;
  sectionId?: string | null;
}

export interface SchoolOption {
  id: string;
  name: string;
  code: string;
}

export interface ProgramOption {
  id: string;
  name: string;
  code: string;
  schoolId: string;
}

export interface SectionOption {
  id: string;
  name: string;
  programId: string;
}

interface IdCardsClientProps {
  students: StudentRecord[];
  schools: SchoolOption[];
  programs: ProgramOption[];
  sections: SectionOption[];
}

export default function IdCardsClient({
  students,
  schools,
  programs,
  sections,
}: IdCardsClientProps) {
  // Navigation View: "sample" | "single" | "batch"
  const [activeTab, setActiveTab] = useState<"sample" | "single" | "batch">("sample");

  // =========================================================================
  // 1. SAMPLE ID CARD STATE (GENERIC SAMPLE DATA & PLACEHOLDER)
  // =========================================================================
  const sampleStudentData: StudentIdCardData = {
    fullName: "SAMPLE STUDENT NAME",
    rollNumber: "26UCS0001",
    branch: "Computer Science and Engineering",
    parentName: "Sample Parent Name",
    dateOfBirth: "15-08-2008",
    mobile: "9876543210",
    photoUrl: null,
    serialNumber: "GVPIHLR202600001",
    signatureUrl: null,
  };

  const [sampleData, setSampleData] = useState<StudentIdCardData>(sampleStudentData);

  // =========================================================================
  // 2. SINGLE STUDENT SEARCH & GENERATION STATE
  // =========================================================================
  const [searchRoll, setSearchRoll] = useState(() => students[0]?.rollNumber || "");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(() => {
    return students[0] || null;
  });
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [customDob, setCustomDob] = useState<string>("");
  const [customBranch, setCustomBranch] = useState<string>("");

  // Handle single student search/selection
  const handleSelectStudent = (student: StudentRecord) => {
    setSelectedStudent(student);
    setSearchRoll(student.rollNumber);
    setCustomPhotoUrl(null);
    setCustomDob(
      student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString("en-GB").replace(/\//g, "-")
        : "22-11-2008"
    );
    setCustomBranch(student.programName || "Engineering & Technology");
  };

  const handleSearchRollSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = searchRoll.trim().toUpperCase();
    if (!cleanQuery) return;

    const match = students.find(
      (s) =>
        s.rollNumber.toUpperCase() === cleanQuery ||
        s.fullName.toUpperCase().includes(cleanQuery)
    );

    if (match) {
      handleSelectStudent(match);
    } else {
      alert(`No student found with roll number or name: "${cleanQuery}"`);
    }
  };

  // Convert selectedStudent to Card Data
  const singleCardData: StudentIdCardData = useMemo(() => {
    if (!selectedStudent) return sampleStudentData;

    // Format DOB
    let formattedDob = customDob;
    if (!formattedDob && selectedStudent.dateOfBirth) {
      formattedDob = new Date(selectedStudent.dateOfBirth)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");
    }
    if (!formattedDob) formattedDob = "22-11-2008";

    // Branch text
    const branchText =
      customBranch ||
      selectedStudent.programName ||
      selectedStudent.programCode ||
      "B.Tech Engineering";

    // Photo
    const photo = customPhotoUrl || null;

    return {
      fullName: selectedStudent.fullName,
      rollNumber: selectedStudent.rollNumber,
      branch: branchText,
      parentName: selectedStudent.parentName || "—",
      dateOfBirth: formattedDob,
      mobile: selectedStudent.phone || selectedStudent.parentPhone || "—",
      photoUrl: photo,
      serialNumber: `GVPIHLR2026${selectedStudent.rollNumber.replace(/[^0-9]/g, "").padStart(4, "0")}`,
      signatureUrl: null,
    };
  }, [selectedStudent, customPhotoUrl, customDob, customBranch]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // 3. BATCH SCOPE GENERATION STATE (ALL SCHOOLS / ALL PROGRAMS / SECTION)
  // =========================================================================
  const [batchSchoolId, setBatchSchoolId] = useState<string>("");
  const [batchProgramId, setBatchProgramId] = useState<string>("");
  const [batchSectionId, setBatchSectionId] = useState<string>("");
  const [batchGeneratedList, setBatchGeneratedList] = useState<StudentRecord[]>([]);
  const [batchSearchQuery, setBatchSearchQuery] = useState("");

  // Filter programs based on selected school
  const availablePrograms = useMemo(() => {
    if (!batchSchoolId) return programs;
    return programs.filter((p) => p.schoolId === batchSchoolId);
  }, [programs, batchSchoolId]);

  // Filter sections based on selected program
  const availableSections = useMemo(() => {
    if (!batchProgramId) return sections;
    return sections.filter((s) => s.programId === batchProgramId);
  }, [sections, batchProgramId]);

  // Generate for All Schools
  const handleGenerateAllSchools = () => {
    setBatchGeneratedList(students);
    setActiveTab("batch");
  };

  // Generate for All Programs in Selected School
  const handleGenerateSchoolPrograms = () => {
    if (!batchSchoolId) {
      alert("Please select a school first.");
      return;
    }
    const filtered = students.filter((s) => s.schoolId === batchSchoolId);
    setBatchGeneratedList(filtered);
    setActiveTab("batch");
  };

  // Generate for Selected Section
  const handleGenerateSection = () => {
    if (!batchSectionId) {
      alert("Please select a class section first.");
      return;
    }
    const filtered = students.filter((s) => s.sectionId === batchSectionId);
    setBatchGeneratedList(filtered);
    setActiveTab("batch");
  };

  // Filter batch list by search query
  const filteredBatchStudents = useMemo(() => {
    if (!batchSearchQuery.trim()) return batchGeneratedList;
    const q = batchSearchQuery.toLowerCase();
    return batchGeneratedList.filter(
      (s) =>
        s.rollNumber.toLowerCase().includes(q) ||
        s.fullName.toLowerCase().includes(q)
    );
  }, [batchGeneratedList, batchSearchQuery]);

  // Print triggers
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BANNER: Official Student ID Card Generator Hub
          ========================================================================= */}
      <div className="bg-gradient-to-r from-[#0F2C59] via-[#163A70] to-[#0B2545] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 no-print">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-black tracking-wide border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>OFFICIAL STUDENT IDENTIFICATION HUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Student Identity Card Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
            Generate authentic PVC standard student identity cards for Gayatri Vidya Parishad
            Institute of Higher Learning and Research. Preview the official sample, generate by roll number,
            or batch print for schools and programs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Current View</span>
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition"
          >
            <span>Admin Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          TAB NAVIGATION SWITCHER (Sample ID Card | Single Student | Batch Scope)
          ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("sample")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "sample"
                ? "bg-[#0F2C59] text-white shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Sample ID Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "single"
                ? "bg-[#0F2C59] text-white shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Generate by Roll Number</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("batch");
              if (batchGeneratedList.length === 0) {
                setBatchGeneratedList(students.slice(0, 30));
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "batch"
                ? "bg-[#0F2C59] text-white shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Batch Generator (Schools / Programs)</span>
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500 px-3">
          Total Enrolled Database: <strong className="text-slate-900">{students.length} Students</strong>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: SAMPLE ID CARD VIEW
          ========================================================================= */}
      {activeTab === "sample" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Official University Template Replicated</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  Sample Student ID Card Preview
                </h2>
                <p className="text-xs text-slate-500">
                  Exact template matching the physical university ID card design with neutral placeholder data.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("single")}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Generate by Roll No</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#0F2C59] hover:bg-[#163A70] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Sample Card</span>
                </button>
              </div>
            </div>

            {/* Display Generated Sample Card Centered */}
            <div className="flex flex-col items-center justify-center py-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Generated ID Card Preview
              </span>
              <div className="p-3 bg-slate-50/60 rounded-3xl border border-slate-200/70 shadow-xs">
                <StudentIdCard student={sampleData} />
              </div>
            </div>
          </div>

          {/* Printable Container for Sample Card (Only card prints) */}
          <div className="hidden print:flex print:items-center print:justify-center min-h-screen">
            <StudentIdCard student={sampleData} />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GENERATE BY ROLL NUMBER
          ========================================================================= */}
      {activeTab === "single" && (
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Generate Single Student ID Card
                </h2>
                <p className="text-xs text-slate-500">
                  Search any student by roll number or name to instantly generate their official ID card.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-[#0F2C59] hover:bg-[#163A70] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Student Card</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchRollSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Student Roll Number (e.g., 26UEECE0053, 26UECHE0021)..."
                  value={searchRoll}
                  onChange={(e) => setSearchRoll(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex-shrink-0"
              >
                Generate ID Card
              </button>
            </form>

            {/* Quick Roll Suggestions / Recent Enrolled */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Samples:</span>
              {students.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStudent(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    selectedStudent?.id === s.id
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {s.rollNumber} ({s.fullName.split(" ")[0]})
                </button>
              ))}
            </div>

            {/* Customizable Card Attributes (Photo, DOB, Branch) */}
            {selectedStudent && (
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Upload Student Photo
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition text-slate-700 font-semibold">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span className="truncate">
                      {customPhotoUrl ? "Change Photo" : "Choose Photo (Passport)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Date of Birth (D.O.B)
                  </label>
                  <input
                    type="text"
                    placeholder="DD-MM-YYYY (e.g., 22-11-2008)"
                    value={customDob}
                    onChange={(e) => setCustomDob(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Branch / Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., ECE (VLSI Design and Technology)"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Render Generated Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-3xl border border-slate-200 no-print">
            <StudentIdCard student={singleCardData} />
            <div className="mt-4 text-center">
              <span className="text-xs font-semibold text-slate-500">
                Ready for high-resolution PVC or Paper ID card print.
              </span>
            </div>
          </div>

          {/* Printable View (Single Card Centered on Paper) */}
          <div className="hidden print:flex print:items-center print:justify-center min-h-screen">
            <StudentIdCard student={singleCardData} />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BATCH GENERATOR (ALL SCHOOLS / ALL PROGRAMS / SECTION)
          ========================================================================= */}
      {activeTab === "batch" && (
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Batch ID Card Generator
                </h2>
                <p className="text-xs text-slate-500">
                  Bulk generate and print ID cards for an entire school, degree program, or class section.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={batchGeneratedList.length === 0}
                  className="px-4 py-2 bg-[#0F2C59] hover:bg-[#163A70] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Batch ({batchGeneratedList.length} Cards)</span>
                </button>
              </div>
            </div>

            {/* Hierarchical Filters: School -> Program -> Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  1. Academic School
                </label>
                <select
                  value={batchSchoolId}
                  onChange={(e) => {
                    setBatchSchoolId(e.target.value);
                    setBatchProgramId("");
                    setBatchSectionId("");
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Schools</option>
                  {schools.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} ({sch.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  2. Degree Program
                </label>
                <select
                  value={batchProgramId}
                  onChange={(e) => {
                    setBatchProgramId(e.target.value);
                    setBatchSectionId("");
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Programs in School</option>
                  {availablePrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  3. Class Section
                </label>
                <select
                  value={batchSectionId}
                  onChange={(e) => setBatchSectionId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sections</option>
                  {availableSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      Section {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generation Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateAllSchools}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
              >
                Generate for All Schools ({students.length} Students)
              </button>

              <button
                type="button"
                onClick={handleGenerateSchoolPrograms}
                disabled={!batchSchoolId}
                className="px-4 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#163A70] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition shadow-xs"
              >
                Generate for Selected School
              </button>

              <button
                type="button"
                onClick={handleGenerateSection}
                disabled={!batchSectionId}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition shadow-xs"
              >
                Generate for Selected Section
              </button>
            </div>

            {/* Search Filter within loaded batch */}
            {batchGeneratedList.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search inside batch list (roll number or name)..."
                    value={batchSearchQuery}
                    onChange={(e) => setBatchSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <span className="text-xs font-bold text-slate-500">
                  Showing <strong>{filteredBatchStudents.length}</strong> of{" "}
                  <strong>{batchGeneratedList.length}</strong> loaded cards
                </span>
              </div>
            )}
          </div>

          {/* Batch ID Cards Grid (Screen View) */}
          {filteredBatchStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-slate-100 rounded-3xl border border-slate-200 no-print">
              {filteredBatchStudents.map((st) => {
                const cardData: StudentIdCardData = {
                  fullName: st.fullName,
                  rollNumber: st.rollNumber,
                  branch: st.programName || "B.Tech Engineering",
                  parentName: st.parentName || "—",
                  dateOfBirth: st.dateOfBirth
                    ? new Date(st.dateOfBirth).toLocaleDateString("en-GB").replace(/\//g, "-")
                    : "22-11-2008",
                  mobile: st.phone || st.parentPhone || "—",
                  photoUrl: null,
                  serialNumber: `GVPIHLR2026${st.rollNumber.replace(/[^0-9]/g, "").padStart(4, "0")}`,
                  signatureUrl: null,
                };

                return (
                  <div key={st.id} className="flex flex-col items-center gap-2">
                    <StudentIdCard student={cardData} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-400 font-medium">
              Click &quot;Generate for All Schools&quot; or select a School/Program to generate batch ID cards.
            </div>
          )}

          {/* =========================================================================
              PRINT-ONLY BATCH CONTAINER (A4 Layout with 4 or 8 Cards Per Page)
              ========================================================================= */}
          <div className="hidden print:block space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {batchGeneratedList.map((st) => {
                const cardData: StudentIdCardData = {
                  fullName: st.fullName,
                  rollNumber: st.rollNumber,
                  branch: st.programName || "B.Tech Engineering",
                  parentName: st.parentName || "—",
                  dateOfBirth: st.dateOfBirth
                    ? new Date(st.dateOfBirth).toLocaleDateString("en-GB").replace(/\//g, "-")
                    : "22-11-2008",
                  mobile: st.phone || st.parentPhone || "—",
                  photoUrl: null,
                  serialNumber: `GVPIHLR2026${st.rollNumber.replace(/[^0-9]/g, "").padStart(4, "0")}`,
                  signatureUrl: null,
                };

                return (
                  <div
                    key={st.id}
                    className="flex items-center justify-center p-2 break-inside-avoid"
                  >
                    <StudentIdCard student={cardData} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
