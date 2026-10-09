"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import CustomSelect from "@/components/ui/CustomSelect";

interface SectionOption {
  id: string;
  name: string;
  programName: string;
  year: number;
  semester: number;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

interface StudentReportItem {
  studentId: string;
  rollNumber: string;
  fullName: string;
  phone?: string | null;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  percentage: number;
  isDefaulter: boolean;
}

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
    programName: string;
    totalSessionsConducted: number;
    students: StudentReportItem[];
    defaultersCount: number;
  };
}) {
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [reportData, setReportData] = useState(initialReport);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyDefaulters, setOnlyDefaulters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch report when section or subject changes
  const handleFilter = async (sectionId: string, subjectId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/reports/section?sectionId=${sectionId}&subjectId=${subjectId}`
      );
      const data = await res.json();
      if (data.success) {
        setReportData({
          sectionName: data.section.name,
          programName: data.section.program.name,
          totalSessionsConducted: data.totalSessionsConducted,
          students: data.students,
          defaultersCount: data.defaultersCount,
        });
      }
    } catch (e) {
      console.error("Error loading report:", e);
    } finally {
      setIsLoading(false);
    }
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

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Institutional Header
    doc.setFillColor(11, 37, 69); // #0B2545
    doc.rect(0, 0, 210, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      "GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH",
      105,
      10,
      { align: "center" }
    );
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "(Deemed to be University under Section 3 of the UGC Act, 1956) • Visakhapatnam",
      105,
      16,
      { align: "center" }
    );

    // Title & Context
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("CONSOLIDATED ATTENDANCE REGISTER", 14, 32);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Program: ${reportData.programName}`, 14, 38);
    doc.text(`Section: ${reportData.sectionName}`, 14, 43);
    doc.text(`Total Sessions Conducted: ${reportData.totalSessionsConducted}`, 130, 38);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 130, 43);

    // Table Content
    const tableRows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.rollNumber,
      s.fullName,
      s.totalClasses,
      s.attendedClasses,
      s.absentClasses,
      `${s.percentage.toFixed(1)}%`,
      s.isDefaulter ? "DEF (<75%)" : "ELIGIBLE",
    ]);

    autoTable(doc, {
      startY: 48,
      head: [
        [
          "S.No",
          "Roll Number",
          "Student Name",
          "Total",
          "Attended",
          "Absent",
          "Percentage",
          "Status",
        ],
      ],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [11, 37, 69], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 28, fontStyle: "bold" },
        2: { cellWidth: 55 },
        6: { fontStyle: "bold" },
        7: { fontStyle: "bold" },
      },
    });

    doc.save(`GVPIHLR_Attendance_${reportData.sectionName}.pdf`);
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map((s, idx) => ({
      "S.No": idx + 1,
      "Roll Number": s.rollNumber,
      "Student Name": s.fullName,
      "Program": reportData.programName,
      "Section": reportData.sectionName,
      "Total Classes": s.totalClasses,
      "Attended Classes": s.attendedClasses,
      "Absent Classes": s.absentClasses,
      "Attendance %": `${s.percentage.toFixed(1)}%`,
      "Defaulter Status": s.isDefaulter ? "BELOW 75% (DEFAULTER)" : "ELIGIBLE",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `GVPIHLR_Attendance_${reportData.sectionName}.xlsx`);
  };

  // Prepare custom select options
  const sectionSelectOptions = sections.map((sec) => ({
    value: sec.id,
    label: `${sec.programName} — Sec ${sec.name} (Yr ${sec.year}/Sem ${sec.semester})`,
  }));

  const subjectSelectOptions = [
    { value: "", label: "All Subjects (Consolidated)" },
    ...subjects.map((subj) => ({
      value: subj.id,
      label: `${subj.code} — ${subj.name}`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
            Academic Analytics & Compliance
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Attendance Registers & Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official institutional register with 75% attendance threshold monitoring.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Bar with Custom Select Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <CustomSelect
            label="Select Section"
            options={sectionSelectOptions}
            value={selectedSectionId}
            onChange={(val) => {
              setSelectedSectionId(val);
              handleFilter(val, selectedSubjectId);
            }}
          />

          <CustomSelect
            label="Filter by Subject"
            options={subjectSelectOptions}
            value={selectedSubjectId}
            onChange={(val) => {
              setSelectedSubjectId(val);
              handleFilter(selectedSectionId, val);
            }}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Search Student</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Roll No or Name..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filter Chips & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnlyDefaulters(!onlyDefaulters)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 ${
                onlyDefaulters
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Show Defaulters Only (&lt;75%)</span>
            </button>

            <span className="text-slate-500 font-medium">
              Showing <strong>{filteredStudents.length}</strong> of{" "}
              {reportData.students.length} students
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-slate-600">
              Total Sessions: <strong className="text-slate-900">{reportData.totalSessionsConducted}</strong>
            </span>
            <span className="text-rose-600 font-bold">
              Defaulters: <strong>{reportData.defaultersCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Conducted</th>
                <th className="py-3 px-4 text-center">Attended</th>
                <th className="py-3 px-4 text-center">Absent</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredStudents.map((s, idx) => (
                <tr
                  key={s.studentId}
                  className={`hover:bg-slate-50/80 transition ${
                    s.isDefaulter ? "bg-rose-50/30" : ""
                  }`}
                >
                  <td className="py-3 px-4 text-slate-400 font-semibold">{idx + 1}</td>
                  <td className="py-3 px-4 font-black text-slate-900">{s.rollNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{s.fullName}</td>
                  <td className="py-3 px-4 text-center">{s.totalClasses}</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    {s.attendedClasses}
                  </td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold">
                    {s.absentClasses}
                  </td>
                  <td className="py-3 px-4 text-center font-black">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                        s.percentage >= 75
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-100 text-rose-800 border border-rose-300 font-black"
                      }`}
                    >
                      {s.percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {s.isDefaulter ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 uppercase bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Defaulter</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Eligible</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No students found matching current report criteria.
          </div>
        )}
      </div>
    </div>
  );
}
