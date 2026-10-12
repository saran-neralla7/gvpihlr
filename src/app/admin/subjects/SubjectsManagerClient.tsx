"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  FileSpreadsheet,
  Edit3,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Building,
  GraduationCap,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import CustomModal from "@/components/ui/CustomModal";

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: string;
  credits: number;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  offeringsCount: number;
}

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
}

interface SubjectsManagerProps {
  subjects: SubjectItem[];
  departments: DepartmentItem[];
  canEdit: boolean;
  canDelete: boolean;
}

export default function SubjectsManagerClient({
  subjects: initialSubjects,
  departments,
  canEdit,
  canDelete,
}: SubjectsManagerProps) {
  const [subjects, setSubjects] = useState<SubjectItem[]>(initialSubjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "THEORY" | "LAB">("ALL");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState<SubjectItem | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    shortName: "",
    type: "THEORY",
    credits: 3,
    departmentId: departments[0]?.id || "",
    syllabusNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = !selectedDeptId || s.departmentId === selectedDeptId;
      const matchesType = selectedType === "ALL" || s.type === selectedType;

      return matchesSearch && matchesDept && matchesType;
    });
  }, [subjects, searchQuery, selectedDeptId, selectedType]);

  const theoryCount = useMemo(() => subjects.filter((s) => s.type === "THEORY").length, [subjects]);
  const labCount = useMemo(() => subjects.filter((s) => s.type === "LAB").length, [subjects]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMsg(null);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubjects((prev) => [data.subject, ...prev]);
        setIsAddOpen(false);
        setAlertMsg({ type: "success", text: "Subject added successfully!" });
      } else {
        setAlertMsg({ type: "error", text: data.error || "Failed to add subject" });
      }
    } catch {
      setAlertMsg({ type: "error", text: "Network error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
            alertMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
              Curriculum &amp; Syllabus Architecture (R1 Regulation)
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Subject Catalog
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Institutional theory courses, laboratory modules, and credit allocations.
            </p>
          </div>
        </div>

        {/* Add Subject Action */}
        <button
          onClick={() => {
            setFormData({
              code: "",
              name: "",
              shortName: "",
              type: "THEORY",
              credits: 3,
              departmentId: departments[0]?.id || "",
              syllabusNotes: "",
            });
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Catalog</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {subjects.length}
            <span className="text-xs font-semibold text-slate-400 ml-1">Courses</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Theory Subjects</span>
          <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
            {theoryCount}
            <span className="text-xs font-semibold text-blue-600/70 ml-1">Lectures</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Laboratory Practicals</span>
          <div className="text-2xl font-black text-purple-700 mt-1 font-mono">
            {labCount}
            <span className="text-xs font-semibold text-purple-600/70 ml-1">Labs</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Academic Regulation</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            R1
            <span className="text-xs font-semibold text-emerald-600/70 ml-1">2026-27</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course title, code, or short name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.replace("Department of ", "")}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
            <button
              onClick={() => setSelectedType("ALL")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition text-center ${
                selectedType === "ALL"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType("THEORY")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition text-center ${
                selectedType === "THEORY"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              Theory
            </button>
            <button
              onClick={() => setSelectedType("LAB")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition text-center ${
                selectedType === "LAB"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-purple-700 hover:bg-purple-50"
              }`}
            >
              Labs
            </button>
          </div>
        </div>
      </div>

      {/* Subjects Catalog Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Course Code</th>
                <th className="py-3 px-5">Course Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-5">Teaching Department</th>
                <th className="py-3 px-4 text-center">Class Sections</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-700">
                      {sub.code}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{sub.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Short: <span className="font-bold text-purple-700">{sub.shortName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.type === "LAB"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {sub.credits} Credits
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-semibold">
                      {sub.departmentName.replace("Department of ", "")}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                        {sub.offeringsCount} sections
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5 text-slate-400">
                        <button
                          onClick={() => {
                            setActiveSubject(sub);
                            setFormData({
                              code: sub.code,
                              name: sub.name,
                              shortName: sub.shortName,
                              type: sub.type,
                              credits: sub.credits,
                              departmentId: sub.departmentId,
                              syllabusNotes: "",
                            });
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Course"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No subjects found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subject Modal */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Subject / Course"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Course Code *</label>
            <input
              type="text"
              required
              placeholder="e.g., 26CS101"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Course Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Data Structures and Algorithms"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Short Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., DSA"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Credits *</label>
              <input
                type="number"
                min={1}
                max={6}
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Course Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="THEORY">THEORY</option>
                <option value="LAB">LAB</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Department *</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.replace("Department of ", "")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Syllabus Overview / Notes</label>
            <textarea
              rows={3}
              placeholder="Module topics, curriculum references, and course objectives..."
              value={formData.syllabusNotes}
              onChange={(e) => setFormData({ ...formData, syllabusNotes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Subject</span>
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
}
