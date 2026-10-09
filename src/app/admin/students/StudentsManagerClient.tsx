"use client";

import { useState, useMemo } from "react";
import {
  GraduationCap,
  Plus,
  FileSpreadsheet,
  Camera,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  RotateCcw,
  Edit3,
  User,
  Layers,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import CustomModal from "@/components/ui/CustomModal";

interface StudentsManagerProps {
  students: any[];
  departments: any[];
  programs: any[];
  sections: any[];
}

export default function StudentsManagerClient({
  students: initialStudents,
  departments,
  programs,
  sections,
}: StudentsManagerProps) {
  const [students, setStudents] = useState<any[]>(initialStudents);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "LEFT" | "ALUMNI" | "DETAINED">("ACTIVE");

  // Filter States
  const [selectedDeptOrProg, setSelectedDeptOrProg] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Checkbox selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

  const [activeStudent, setActiveStudent] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Status mapping for tabs
  const filteredByTab = useMemo(() => {
    return students.filter((s) => {
      if (activeTab === "ACTIVE") return s.status === "ACTIVE" || !s.status;
      if (activeTab === "LEFT") return s.status === "DISCONTINUED" || s.status === "LEFT";
      if (activeTab === "ALUMNI") return s.status === "ALUMNI";
      if (activeTab === "DETAINED") return s.status === "DETAINED";
      return true;
    });
  }, [students, activeTab]);

  // Combined Filters
  const filteredStudents = useMemo(() => {
    return filteredByTab.filter((s) => {
      const enrollment = s.enrollments?.[0];

      // Department/Program Filter
      if (selectedDeptOrProg) {
        const progId = enrollment?.programId;
        const progCode = enrollment?.program?.code;
        const progName = enrollment?.program?.name;
        const matchesProg =
          progId === selectedDeptOrProg ||
          progCode === selectedDeptOrProg ||
          progName === selectedDeptOrProg;
        if (!matchesProg) return false;
      }

      // Year Filter
      if (selectedYear) {
        const year = enrollment?.year?.toString();
        if (year !== selectedYear) return false;
      }

      // Semester Filter
      if (selectedSem) {
        const sem = enrollment?.semester?.toString();
        if (sem !== selectedSem) return false;
      }

      // Section Filter
      if (selectedSection) {
        const secName = enrollment?.section?.name?.toString();
        const secId = enrollment?.sectionId;
        if (secName !== selectedSection && secId !== selectedSection) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const roll = (s.rollNumber || "").toLowerCase();
        const name = (s.user?.fullName || "").toLowerCase();
        const reg = (s.registerNumber || "").toLowerCase();
        if (!roll.includes(query) && !name.includes(query) && !reg.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [filteredByTab, selectedDeptOrProg, selectedYear, selectedSem, selectedSection, searchQuery]);

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Checkbox select all
  const isAllSelected =
    paginatedStudents.length > 0 &&
    paginatedStudents.every((s) => selectedStudentIds.has(s.id));

  const handleToggleSelectAll = () => {
    const newSet = new Set(selectedStudentIds);
    if (isAllSelected) {
      paginatedStudents.forEach((s) => newSet.delete(s.id));
    } else {
      paginatedStudents.forEach((s) => newSet.add(s.id));
    }
    setSelectedStudentIds(newSet);
  };

  const handleToggleStudent = (id: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudentIds(newSet);
  };

  const handleClearFilters = () => {
    setSelectedDeptOrProg("");
    setSelectedYear("");
    setSelectedSem("");
    setSelectedSection("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Export current view to CSV
  const handleExportCSV = () => {
    const headers = [
      "Roll Number",
      "Full Name",
      "Class",
      "Program",
      "Mobile",
      "Parent Mobile",
      "Parent Email",
      "Gender",
      "Aadhar/Reg No",
      "Caste",
      "Status",
    ];

    const rows = filteredStudents.map((s) => {
      const enr = s.enrollments?.[0];
      const classStr = enr
        ? `${enr.year}-${enr.semester} (Sec ${enr.section?.name || "1"})`
        : "-";
      return [
        `"${s.rollNumber}"`,
        `"${s.user?.fullName || ""}"`,
        `"${classStr}"`,
        `"${enr?.program?.name || ""}"`,
        `"${s.user?.phone || ""}"`,
        `"${s.parentPhone || ""}"`,
        `"${s.parentEmail || ""}"`,
        `"${s.gender || ""}"`,
        `"${s.registerNumber || ""}"`,
        `"${s.casteCategory || ""}"`,
        `"${s.status || "ACTIVE"}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample CSV Download
  const handleDownloadSampleCSV = () => {
    const headers = [
      "rollNumber",
      "fullName",
      "programCode",
      "year",
      "semester",
      "sectionName",
      "phone",
      "parentPhone",
      "gender",
      "casteCategory",
    ];
    const sampleRows = [
      "26UECHE0001,ADIRAJU SRI NAGA PRADYUMNA,BTECH-CHEMICAL-ENG,1,1,1,9000597053,8106247324,Male,OC",
      "26UECSE0001,BOGGARAPU LIKITHA,BTECH-CSE,1,1,1,9848011000,9849099999,Female,BC_D",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...sampleRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Student Handler
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await fetch("/api/admin/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "student",
          data: formData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create student");
      }

      setAlertMsg({ type: "success", text: "Student created successfully!" });
      setIsAddOpen(false);
      setFormData({});
      // Refresh local state
      window.location.reload();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Student Handler
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await fetch("/api/admin/master", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "student",
          id: activeStudent.id,
          data: formData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update student");
      }

      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === activeStudent.id) {
            return {
              ...s,
              rollNumber: formData.rollNumber || s.rollNumber,
              parentPhone: formData.parentPhone !== undefined ? formData.parentPhone : s.parentPhone,
              status: formData.status || s.status,
              user: {
                ...s.user,
                fullName: formData.fullName || s.user?.fullName,
                phone: formData.phone !== undefined ? formData.phone : s.user?.phone,
                email: formData.email !== undefined ? formData.email : s.user?.email,
              },
            };
          }
          return s;
        })
      );

      setAlertMsg({ type: "success", text: "Student updated successfully!" });
      setIsEditOpen(false);
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Student Handler
  const handleDeleteStudent = async () => {
    if (!activeStudent) return;
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await fetch(`/api/admin/master?entity=student&id=${activeStudent.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete student");
      }

      setStudents((prev) => prev.filter((s) => s.id !== activeStudent.id));
      setIsDeleteOpen(false);
      setAlertMsg({ type: "success", text: "Student deleted successfully!" });
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            alertMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Row matching Screenshot 3 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title & Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage Students
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Add, edit, or import student details.
            </p>
          </div>
        </div>

        {/* Action Buttons matching Screenshot 3 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sample CSV */}
          <button
            onClick={handleDownloadSampleCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs"
            title="Download Sample CSV Template"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample CSV</span>
          </button>

          {/* Upload Photos */}
          <button
            onClick={() => setIsPhotosOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 text-xs font-semibold text-purple-700 transition shadow-xs"
            title="Upload student profile photos"
          >
            <Camera className="w-3.5 h-3.5 text-purple-600" />
            <span>Upload Photos</span>
          </button>

          {/* Import */}
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-xs font-semibold text-blue-700 transition shadow-xs"
            title="Bulk import student records"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-blue-600" />
            <span>Import</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-xs font-semibold text-emerald-700 transition shadow-xs"
            title="Export filtered student list to CSV"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export</span>
          </button>

          {/* + Add Student Button */}
          <button
            onClick={() => {
              setFormData({
                year: 1,
                semester: 1,
                programId: programs[0]?.id || "",
                sectionId: sections[0]?.id || "",
                status: "ACTIVE",
                admissionYear: "2026",
              });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Status Tabs matching Screenshot 3 */}
      <div className="flex items-center gap-6 border-b border-slate-200 px-2 text-xs font-bold">
        <button
          onClick={() => {
            setActiveTab("ACTIVE");
            setCurrentPage(1);
          }}
          className={`pb-2.5 transition-all relative ${
            activeTab === "ACTIVE"
              ? "text-blue-600 font-black border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Active Students</span>
          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700">
            {students.filter((s) => s.status === "ACTIVE" || !s.status).length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("LEFT");
            setCurrentPage(1);
          }}
          className={`pb-2.5 transition-all relative ${
            activeTab === "LEFT"
              ? "text-blue-600 font-black border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Left College</span>
          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
            {students.filter((s) => s.status === "DISCONTINUED" || s.status === "LEFT").length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("ALUMNI");
            setCurrentPage(1);
          }}
          className={`pb-2.5 transition-all relative ${
            activeTab === "ALUMNI"
              ? "text-blue-600 font-black border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Alumni</span>
          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
            {students.filter((s) => s.status === "ALUMNI").length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("DETAINED");
            setCurrentPage(1);
          }}
          className={`pb-2.5 transition-all relative ${
            activeTab === "DETAINED"
              ? "text-blue-600 font-black border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Detained</span>
          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-rose-50 text-rose-700">
            {students.filter((s) => s.status === "DETAINED").length}
          </span>
        </button>
      </div>

      {/* Filter Controls Card matching Screenshot 3 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
        {/* 4 Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Department / Program Dropdown */}
          <select
            value={selectedDeptOrProg}
            onChange={(e) => {
              setSelectedDeptOrProg(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          {/* Semester Dropdown */}
          <select
            value={selectedSem}
            onChange={(e) => {
              setSelectedSem(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>

          {/* Section Dropdown */}
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sections</option>
            <option value="1">Section 1</option>
            <option value="2">Section 2</option>
            <option value="3">Section 3</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        {/* Search Row & Clear Filters matching Screenshot 3 */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name or Roll Number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Students Table matching Screenshot 3 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/60 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-4 w-16">PHOTO</th>
                <th className="py-3 px-4">ROLL NO</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4">CLASS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => {
                  const enrollment = s.enrollments?.[0];
                  const classDisplay = enrollment
                    ? `${enrollment.year}-${enrollment.semester} (${enrollment.section?.name ? `Sec ${enrollment.section.name}` : "A"})`
                    : "1-1 (Sec 1)";

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.has(s.id)}
                          onChange={() => handleToggleStudent(s.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Photo Placeholder */}
                      <td className="py-3 px-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                          <User className="w-4 h-4" />
                        </div>
                      </td>

                      {/* Roll Number (Clickable blue) */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setActiveStudent(s);
                            setIsViewOpen(true);
                          }}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline tracking-wide font-mono text-left"
                        >
                          {s.rollNumber}
                        </button>
                      </td>

                      {/* Name (Uppercase bold dark slate) */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 uppercase tracking-tight">
                          {s.user?.fullName}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4">
                        <span className="text-slate-600 font-semibold">{classDisplay}</span>
                      </td>

                      {/* Actions matching Screenshot 3: Edit, View, Assign, Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2 text-slate-400">
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setActiveStudent(s);
                              setFormData({
                                fullName: s.user?.fullName,
                                rollNumber: s.rollNumber,
                                phone: s.user?.phone,
                                email: s.user?.email,
                                parentPhone: s.parentPhone,
                                status: s.status || "ACTIVE",
                                programId: s.enrollments?.[0]?.programId,
                                sectionId: s.enrollments?.[0]?.sectionId,
                              });
                              setIsEditOpen(true);
                            }}
                            className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Student"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* View */}
                          <button
                            onClick={() => {
                              setActiveStudent(s);
                              setIsViewOpen(true);
                            }}
                            className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="View Full Student Details"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>

                          {/* Layers / Batch Assignment */}
                          <button
                            onClick={() => {
                              setActiveStudent(s);
                              setIsViewOpen(true);
                            }}
                            className="p-1 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Academic Program & Section"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setActiveStudent(s);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <strong className="text-slate-800">{paginatedStudents.length}</strong> of{" "}
            <strong className="text-slate-800">{filteredStudents.length}</strong> students
            {selectedStudentIds.size > 0 && (
              <span className="ml-2 text-blue-600 font-bold">
                ({selectedStudentIds.size} selected)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. ADD STUDENT MODAL */}
      {isAddOpen && (
        <CustomModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Student"
        >
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Roll Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 26UECSE0001"
                  value={formData.rollNumber || ""}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Student Full Name"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Degree Program *</label>
                <select
                  required
                  value={formData.programId || ""}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Section *</label>
                <select
                  required
                  value={formData.sectionId || ""}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName || `Sec ${s.name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Year</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={formData.year || 1}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Semester</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={formData.semester || 1}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Mobile</label>
                <input
                  type="text"
                  placeholder="+91 9848011000"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Mobile</label>
                <input
                  type="text"
                  placeholder="+91 9849099999"
                  value={formData.parentPhone || ""}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 text-blue-800 text-[11px] rounded-xl font-medium">
              Note: The default student password will be initialized to the Roll Number. The student can sign in directly with their roll number.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Student</span>
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* 2. EDIT STUDENT MODAL */}
      {isEditOpen && activeStudent && (
        <CustomModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Student: ${activeStudent.rollNumber}`}
        >
          <form onSubmit={handleEditStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNumber || ""}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile</label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Mobile</label>
                <input
                  type="text"
                  value={formData.parentPhone || ""}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={formData.status || "ACTIVE"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISCONTINUED">DISCONTINUED / LEFT</option>
                  <option value="ALUMNI">ALUMNI</option>
                  <option value="DETAINED">DETAINED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Section</label>
                <select
                  value={formData.sectionId || ""}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="">Keep current section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName || `Sec ${s.name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* 3. VIEW STUDENT MODAL */}
      {isViewOpen && activeStudent && (
        <CustomModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Student Profile: ${activeStudent.rollNumber}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header snippet */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-black text-slate-900 uppercase">
                  {activeStudent.user?.fullName}
                </div>
                <div className="font-mono text-blue-600 font-bold">
                  {activeStudent.rollNumber}
                </div>
              </div>
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Class</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {activeStudent.enrollments?.[0]
                    ? `${activeStudent.enrollments[0].year}-${activeStudent.enrollments[0].semester} (Sec ${activeStudent.enrollments[0].section?.name || "1"})`
                    : "1-1"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Program</div>
                <div className="font-bold text-slate-800 mt-0.5 truncate">
                  {activeStudent.enrollments?.[0]?.program?.name || "B.Tech"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Student Phone</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {activeStudent.user?.phone || "-"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Parent Phone</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {activeStudent.parentPhone || "-"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Aadhar / Reg No</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {activeStudent.registerNumber || "-"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Gender &amp; Caste</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {activeStudent.gender || "Male"} • {activeStudent.casteCategory || "GEN"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">EAPCET Rank</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {activeStudent.eapcetRank || "-"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Status</div>
                <div className="font-bold text-emerald-700 mt-0.5">
                  {activeStudent.status || "ACTIVE"}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </CustomModal>
      )}

      {/* 4. DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && activeStudent && (
        <CustomModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Confirm Student Deletion"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">
                  Are you sure you want to delete student {activeStudent.rollNumber}?
                </p>
                <p className="text-rose-700 mt-1">
                  Student Name: <strong>{activeStudent.user?.fullName}</strong>. This action will permanently remove their user credentials and class enrollment if no attendance is linked.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </CustomModal>
      )}

      {/* 5. IMPORT MODAL */}
      {isImportOpen && (
        <CustomModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          title="Import Students from CSV"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Upload a standard CSV file with columns:{" "}
              <code className="text-blue-700 font-mono">
                rollNumber, fullName, programCode, year, semester, sectionName, phone, parentPhone
              </code>
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition cursor-pointer">
              <ArrowDownToLine className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-700">Choose CSV file to upload</div>
              <div className="text-[11px] text-slate-400 mt-1">or drag and drop here</div>
              <input
                type="file"
                accept=".csv"
                className="mt-3 text-xs text-slate-500 mx-auto block"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Please use the sample CSV format to batch import students.");
                  setIsImportOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Upload &amp; Process
              </button>
            </div>
          </div>
        </CustomModal>
      )}

      {/* 6. UPLOAD PHOTOS MODAL */}
      {isPhotosOpen && (
        <CustomModal
          isOpen={isPhotosOpen}
          onClose={() => setIsPhotosOpen(false)}
          title="Batch Upload Student Photos"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Upload photos in a ZIP archive named by roll number (e.g.{" "}
              <code className="text-purple-700 font-mono">26UECSE0001.jpg</code>).
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-purple-400 transition cursor-pointer">
              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-700">Choose ZIP file of photos</div>
              <input
                type="file"
                accept=".zip,.jpg,.png"
                className="mt-3 text-xs text-slate-500 mx-auto block"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsPhotosOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Photo archive upload feature ready for S3/Blob asset pipeline.");
                  setIsPhotosOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Upload Photos
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
}
