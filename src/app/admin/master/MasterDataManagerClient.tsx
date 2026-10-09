"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Layers,
  BookOpen,
  GraduationCap,
  Users,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Check,
  Search,
  Plus,
  X,
  FileText,
  Award,
} from "lucide-react";
import CustomModal from "@/components/ui/CustomModal";

interface MasterDataProps {
  schools: any[];
  departments: any[];
  programs: any[];
  sections: any[];
  subjects: any[];
  faculty: any[];
  students: any[];
  regulations?: any[];
}

export default function MasterDataManagerClient(props: MasterDataProps) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as any;

  const validTabs = ["schools", "departments", "programs", "regulations", "sections", "subjects", "faculty", "students"];
  const [activeTab, setActiveTab] = useState<
    "schools" | "departments" | "programs" | "regulations" | "sections" | "subjects" | "faculty" | "students"
  >(validTabs.includes(requestedTab) ? requestedTab : "schools");

  useEffect(() => {
    if (requestedTab && validTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  // Local state for live reactivity
  const [schools, setSchools] = useState(props.schools);
  const [departments, setDepartments] = useState(props.departments);
  const [programs, setPrograms] = useState(props.programs);
  const [sections, setSections] = useState(props.sections);
  const [subjects, setSubjects] = useState(props.subjects);
  const [faculty, setFaculty] = useState(props.faculty);
  const [students, setStudents] = useState(props.students);
  const [regulations, setRegulations] = useState(props.regulations || []);

  const [searchFilter, setSearchFilter] = useState("");
  const [editingItem, setEditingItem] = useState<{ entity: string; item: any } | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Creation Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  // Custom Deletion Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    entity: string;
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Tab definitions
  const tabs = [
    { key: "schools", label: "Schools", singular: "School", entity: "school", icon: Building2, count: schools.length },
    { key: "departments", label: "Departments", singular: "Department", entity: "department", icon: Layers, count: departments.length },
    { key: "programs", label: "Programs", singular: "Program", entity: "program", icon: BookOpen, count: programs.length },
    { key: "regulations", label: "Regulations", singular: "Regulation", entity: "regulation", icon: Award, count: regulations.length },
    { key: "sections", label: "Sections", singular: "Section", entity: "section", icon: Layers, count: sections.length },
    { key: "subjects", label: "Subjects", singular: "Subject", entity: "subject", icon: BookOpen, count: subjects.length },
    { key: "faculty", label: "Faculty", singular: "Faculty Member", entity: "faculty", icon: Users, count: faculty.length },
    { key: "students", label: "Students", singular: "Student", entity: "student", icon: GraduationCap, count: students.length },
  ];

  const currentTabObj = tabs.find((t) => t.key === activeTab) || tabs[0];

  // Open Create Modal with initial defaults
  const openCreateModal = () => {
    setActionAlert(null);
    let defaults: any = {};
    if (activeTab === "departments") {
      defaults = { schoolId: schools[0]?.id || "", isTeachingOnly: false };
    } else if (activeTab === "programs") {
      defaults = {
        schoolId: schools[0]?.id || "",
        regulationId: regulations[0]?.id || "",
        degreeType: "UG",
        durationYears: 4,
        totalSemesters: 8,
      };
    } else if (activeTab === "regulations") {
      defaults = {
        code: "R1",
        name: "Regulation R1",
        academicYearStart: "2026-27",
        description: "Standard Deemed University Academic Curriculum Regulation R1",
      };
    } else if (activeTab === "sections") {
      defaults = { programId: programs[0]?.id || "", year: 1, semester: 1, capacity: 65, name: "A" };
    } else if (activeTab === "subjects") {
      defaults = { departmentId: departments[0]?.id || "", credits: 3.0, type: "THEORY", syllabus: "" };
    } else if (activeTab === "faculty") {
      defaults = { departmentId: departments[0]?.id || "", designation: "Assistant Professor", qualification: "Ph.D", password: "Faculty@1234" };
    } else if (activeTab === "students") {
      defaults = {
        programId: programs[0]?.id || "",
        sectionId: sections[0]?.id || "",
        year: 1,
        semester: 1,
        password: "Student@1234",
        admissionYear: "2026",
      };
    }
    setCreateFormData(defaults);
    setIsCreateOpen(true);
  };

  // Submit Create New Record
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setActionAlert(null);

    try {
      const res = await fetch("/api/admin/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: currentTabObj.entity,
          data: createFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionAlert({ type: "error", message: data.error || "Failed to create record." });
        setIsCreating(false);
        return;
      }

      // Add to local state
      const newRecord = data.created;
      if (activeTab === "schools") {
        setSchools([newRecord, ...schools]);
      } else if (activeTab === "departments") {
        const sc = schools.find((s) => s.id === newRecord.schoolId);
        setDepartments([{ ...newRecord, school: sc }, ...departments]);
      } else if (activeTab === "programs") {
        const sc = schools.find((s) => s.id === newRecord.schoolId);
        const rg = regulations.find((r) => r.id === newRecord.regulationId);
        setPrograms([{ ...newRecord, school: sc, regulation: rg }, ...programs]);
      } else if (activeTab === "regulations") {
        setRegulations([newRecord, ...regulations]);
      } else if (activeTab === "sections") {
        const pr = programs.find((p) => p.id === newRecord.programId);
        setSections([{ ...newRecord, program: pr }, ...sections]);
      } else if (activeTab === "subjects") {
        const dp = departments.find((d) => d.id === newRecord.departmentId);
        setSubjects([{ ...newRecord, department: dp }, ...subjects]);
      } else if (activeTab === "faculty") {
        const dp = departments.find((d) => d.id === newRecord.departmentId);
        setFaculty([{ ...newRecord, user: { fullName: createFormData.fullName }, department: dp }, ...faculty]);
      } else if (activeTab === "students") {
        const sec = sections.find((s) => s.id === createFormData.sectionId);
        setStudents([
          {
            ...newRecord,
            user: { fullName: createFormData.fullName },
            enrollments: [{ section: sec, isCurrent: true }],
          },
          ...students,
        ]);
      }

      setActionAlert({ type: "success", message: data.message || "Record created successfully!" });
      setIsCreateOpen(false);
      setCreateFormData({});
    } catch {
      setActionAlert({ type: "error", message: "Network error occurred." });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Edit initiation
  const openEdit = (entity: string, item: any) => {
    setEditingItem({ entity, item });
    setEditFormData({ ...item });
    setActionAlert(null);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    setActionAlert(null);

    try {
      const res = await fetch("/api/admin/master", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: editingItem.entity,
          id: editingItem.item.id,
          data: editFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionAlert({ type: "error", message: data.error || "Failed to update record" });
        setIsSaving(false);
        return;
      }

      setActionAlert({ type: "success", message: "Record updated successfully." });
      updateLocalList(editingItem.entity, editingItem.item.id, editFormData);
      setEditingItem(null);
    } catch {
      setActionAlert({ type: "error", message: "Network error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (entity: string, id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/master", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity,
          id,
          isActive: !currentActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionAlert({ type: "success", message: data.message });
        updateLocalList(entity, id, { isActive: !currentActive });
      } else {
        setActionAlert({ type: "error", message: data.error || "Failed to change status" });
      }
    } catch {
      setActionAlert({ type: "error", message: "Network error occurred." });
    }
  };

  // Execute Deletion via Custom Modal
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/master?entity=${deleteConfirm.entity}&id=${deleteConfirm.id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionAlert({
          type: "warning",
          message:
            data.error ||
            "This record is already referenced by historical academic data and cannot be permanently deleted. You can deactivate it.",
        });
        setDeleteConfirm(null);
        setIsDeleting(false);
        return;
      }

      setActionAlert({ type: "success", message: data.message || "Record permanently deleted." });
      removeFromLocalList(deleteConfirm.entity, deleteConfirm.id);
      setDeleteConfirm(null);
    } catch {
      setActionAlert({ type: "error", message: "Network error occurred during deletion." });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper state updaters
  const updateLocalList = (entity: string, id: string, patch: any) => {
    const updater = (list: any[]) => list.map((item) => (item.id === id ? { ...item, ...patch } : item));
    if (entity === "school") setSchools(updater);
    if (entity === "department") setDepartments(updater);
    if (entity === "program") setPrograms(updater);
    if (entity === "regulation") setRegulations(updater);
    if (entity === "section") setSections(updater);
    if (entity === "subject") setSubjects(updater);
    if (entity === "faculty") setFaculty(updater);
    if (entity === "student") setStudents(updater);
  };

  const removeFromLocalList = (entity: string, id: string) => {
    const filterer = (list: any[]) => list.filter((item) => item.id !== id);
    if (entity === "school") setSchools(filterer);
    if (entity === "department") setDepartments(filterer);
    if (entity === "program") setPrograms(filterer);
    if (entity === "regulation") setRegulations(filterer);
    if (entity === "section") setSections(filterer);
    if (entity === "subject") setSubjects(filterer);
    if (entity === "faculty") setFaculty(filterer);
    if (entity === "student") setStudents(filterer);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
          Institutional Authority Panel
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">
          Master Data Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Super Admin control center to inspect, add, edit, deactivate, and safely remove seeded academic entities.
        </p>

        {/* Global Feedback Banner */}
        {actionAlert && (
          <div
            className={`mt-4 p-4 rounded-xl text-xs font-bold flex items-start gap-3 border ${
              actionAlert.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : actionAlert.type === "warning"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {actionAlert.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">{actionAlert.message}</div>
            <button
              onClick={() => setActionAlert(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation (Horizontally scrollable on mobile) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setActionAlert(null);
                setSearchFilter("");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                isActive
                  ? "bg-[#0B2545] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Bar: Search Input + "+ Add New Entity" Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        {/* The prominent "+ Add" Button requested by the user */}
        <button
          onClick={openCreateModal}
          className="px-5 py-3 sm:py-2.5 bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add {currentTabObj.singular}</span>
        </button>
      </div>

      {/* Tab Content Tables */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* 1. SCHOOLS TABLE */}
          {activeTab === "schools" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">School Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools
                  .filter((s) => !searchFilter || s.name.toLowerCase().includes(searchFilter.toLowerCase()) || s.code.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((school) => (
                    <tr key={school.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{school.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{school.name}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{school.description || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${school.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                          {school.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openEdit("school", school)} className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px]">
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive("school", school.id, school.isActive)} className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold rounded-lg text-[11px]">
                          {school.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteConfirm({ entity: "school", id: school.id, title: school.name })} className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px]">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 2. DEPARTMENTS TABLE */}
          {activeTab === "departments" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments
                  .filter((d) => !searchFilter || d.name.toLowerCase().includes(searchFilter.toLowerCase()) || d.code.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{dept.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{dept.name}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {dept.isTeachingOnly || !dept.school ? "-" : (dept.school?.name || "-")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dept.isTeachingOnly ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`}>
                          {dept.isTeachingOnly ? "TEACHING (SERVICE)" : "PROGRAM DEPT"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dept.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                          {dept.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openEdit("department", dept)} className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px]">
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive("department", dept.id, dept.isActive)} className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold rounded-lg text-[11px]">
                          {dept.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteConfirm({ entity: "department", id: dept.id, title: dept.name })} className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px]">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 3. PROGRAMS TABLE */}
          {activeTab === "programs" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Program Name</th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-4 text-center">Regulation</th>
                  <th className="py-3 px-4 text-center">Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programs
                  .filter((p) => !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.code.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((prog) => (
                    <tr key={prog.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{prog.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{prog.name}</td>
                      <td className="py-3 px-4 text-slate-600">{prog.school?.name || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                          {prog.regulation?.code || "R1"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{prog.degreeType}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prog.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                          {prog.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openEdit("program", prog)} className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px]">
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive("program", prog.id, prog.isActive)} className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold rounded-lg text-[11px]">
                          {prog.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteConfirm({ entity: "program", id: prog.id, title: prog.name })} className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px]">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* REGULATIONS TABLE */}
          {activeTab === "regulations" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Regulation Title</th>
                  <th className="py-3 px-4 text-center">Effective Academic Year</th>
                  <th className="py-3 px-4">Curriculum Scope / Notes</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regulations
                  .filter((r) => !searchFilter || r.name.toLowerCase().includes(searchFilter.toLowerCase()) || r.code.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-black text-blue-900">{reg.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{reg.name}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{reg.academicYearStart}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{reg.description || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${reg.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                          {reg.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openEdit("regulation", reg)} className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px]">
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive("regulation", reg.id, reg.isActive)} className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold rounded-lg text-[11px]">
                          {reg.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteConfirm({ entity: "regulation", id: reg.id, title: reg.name })} className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px]">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 4. SECTIONS TABLE */}
          {activeTab === "sections" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Section Display</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4 text-center">Year / Sem</th>
                  <th className="py-3 px-4 text-center">Capacity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sections
                  .filter((sec) => !searchFilter || sec.displayName.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((sec) => (
                    <tr key={sec.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{sec.displayName}</td>
                      <td className="py-3 px-4 text-slate-600">{sec.program?.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">Y{sec.year} - S{sec.semester}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{sec.capacity}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sec.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                          {sec.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openEdit("section", sec)} className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px]">
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive("section", sec.id, sec.isActive)} className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold rounded-lg text-[11px]">
                          {sec.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteConfirm({ entity: "section", id: sec.id, title: sec.displayName })} className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px]">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 5. SUBJECTS TABLE */}
          {activeTab === "subjects" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Short</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Credits</th>
                  <th className="py-3 px-4">Teaching Dept</th>
                  <th className="py-3 px-4">Syllabus Status</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects
                  .filter((sub) => !searchFilter || sub.name.toLowerCase().includes(searchFilter.toLowerCase()) || sub.code.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{sub.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{sub.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 font-bold">{sub.shortName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.type === "LAB" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                          {sub.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{sub.credits}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{sub.department?.name}</td>
                      <td className="py-3 px-4">
                        {sub.syllabus ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 max-w-[180px] truncate"
                            title={sub.syllabus}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{sub.syllabus.slice(0, 25)}...</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not added yet</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                          {sub.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openEdit("subject", sub)} className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px]">
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive("subject", sub.id, sub.isActive)} className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold rounded-lg text-[11px]">
                          {sub.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteConfirm({ entity: "subject", id: sub.id, title: sub.name })} className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px]">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 6. FACULTY TABLE */}
          {activeTab === "faculty" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Emp ID</th>
                  <th className="py-3 px-4">Faculty Name</th>
                  <th className="py-3 px-4 text-center">Short Name (Login)</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {faculty
                  .filter((fac) => !searchFilter || fac.user?.fullName.toLowerCase().includes(searchFilter.toLowerCase()) || fac.shortName.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((fac) => (
                    <tr key={fac.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{fac.employeeId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{fac.user?.fullName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                          {fac.shortName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{fac.designation}</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{fac.department?.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fac.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                          {fac.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openEdit("faculty", fac)} className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px]">
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive("faculty", fac.id, fac.isActive)} className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold rounded-lg text-[11px]">
                          {fac.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteConfirm({ entity: "faculty", id: fac.id, title: fac.user?.fullName })} className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px]">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 7. STUDENTS TABLE */}
          {activeTab === "students" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Current Section</th>
                  <th className="py-3 px-4">Parent Phone</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students
                  .filter((stu) => !searchFilter || stu.rollNumber.toLowerCase().includes(searchFilter.toLowerCase()) || stu.user?.fullName.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((stu) => {
                    const currentSec = stu.enrollments?.find((e: any) => e.isCurrent)?.section?.name;
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{stu.rollNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{stu.user?.fullName}</td>
                        <td className="py-3 px-4 font-semibold text-blue-700">Section {currentSec || "—"}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{stu.parentPhone || "—"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stu.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                            {stu.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button onClick={() => openEdit("student", stu)} className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px]">
                            Edit
                          </button>
                          <button onClick={() => setDeleteConfirm({ entity: "student", id: stu.id, title: `${stu.rollNumber} - ${stu.user?.fullName}` })} className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px]">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: ADD / CREATE NEW RECORD (Requested by User)
          ========================================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Add New {currentTabObj.singular}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* SCHOOL FORM */}
              {activeTab === "schools" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">School Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SMGMT"
                      value={createFormData.code || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">School Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. School of Management Studies"
                      value={createFormData.name || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      placeholder="Faculty of Management & Leadership"
                      value={createFormData.description || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* DEPARTMENT FORM */}
              {activeTab === "departments" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI"
                      value={createFormData.code || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Department of Artificial Intelligence"
                      value={createFormData.name || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="teachingOnly"
                      checked={Boolean(createFormData.isTeachingOnly)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCreateFormData({
                          ...createFormData,
                          isTeachingOnly: checked,
                          schoolId: checked ? "" : (schools[0]?.id || ""),
                        });
                      }}
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="teachingOnly" className="font-semibold text-slate-700">
                      Independent Teaching / Service Department (e.g. Mathematics, Physics, Chemistry, English)
                    </label>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Parent School {createFormData.isTeachingOnly ? "(None - Independent Teaching Department)" : "*"}
                    </label>
                    <select
                      disabled={Boolean(createFormData.isTeachingOnly)}
                      value={createFormData.isTeachingOnly ? "" : (createFormData.schoolId || "")}
                      onChange={(e) => setCreateFormData({ ...createFormData, schoolId: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {createFormData.isTeachingOnly ? (
                        <option value="">- None (Independent Teaching Department) -</option>
                      ) : (
                        schools.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </>
              )}

              {/* PROGRAM FORM */}
              {activeTab === "programs" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Program Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BTECH-CS-AIML"
                      value={createFormData.code || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Program Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.Tech Computer Science & AI"
                      value={createFormData.name || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Parent School *</label>
                      <select
                        value={createFormData.schoolId}
                        onChange={(e) => setCreateFormData({ ...createFormData, schoolId: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Academic Regulation *</label>
                      <select
                        value={createFormData.regulationId}
                        onChange={(e) => setCreateFormData({ ...createFormData, regulationId: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        {regulations.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.code} - {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Degree Type</label>
                      <select
                        value={createFormData.degreeType}
                        onChange={(e) => setCreateFormData({ ...createFormData, degreeType: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        <option value="UG">UG</option>
                        <option value="PG">PG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration (Yrs)</label>
                      <input
                        type="number"
                        value={createFormData.durationYears}
                        onChange={(e) => setCreateFormData({ ...createFormData, durationYears: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Semesters</label>
                      <input
                        type="number"
                        value={createFormData.totalSemesters}
                        onChange={(e) => setCreateFormData({ ...createFormData, totalSemesters: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* REGULATION FORM */}
              {activeTab === "regulations" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Regulation Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. R1"
                        value={createFormData.code || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase text-xs font-bold text-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Effective Academic Year *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2026-27"
                        value={createFormData.academicYearStart || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, academicYearStart: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Regulation Title / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Regulation R1 - University Academic Regulations"
                      value={createFormData.name || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Curriculum Scope / Notes</label>
                    <textarea
                      placeholder="Academic guidelines, total credits, grading scale details, etc."
                      value={createFormData.description || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* SECTION FORM */}
              {activeTab === "sections" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Section Letter/Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. C"
                        value={createFormData.name || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-bold uppercase text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        value={createFormData.capacity}
                        onChange={(e) => setCreateFormData({ ...createFormData, capacity: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Program *</label>
                    <select
                      value={createFormData.programId}
                      onChange={(e) => setCreateFormData({ ...createFormData, programId: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                    >
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Year</label>
                      <select
                        value={createFormData.year}
                        onChange={(e) => setCreateFormData({ ...createFormData, year: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Semester</label>
                      <select
                        value={createFormData.semester}
                        onChange={(e) => setCreateFormData({ ...createFormData, semester: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        <option value="1">Sem 1</option>
                        <option value="2">Sem 2</option>
                        <option value="3">Sem 3</option>
                        <option value="4">Sem 4</option>
                        <option value="5">Sem 5</option>
                        <option value="6">Sem 6</option>
                        <option value="7">Sem 7</option>
                        <option value="8">Sem 8</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* SUBJECT FORM */}
              {activeTab === "subjects" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subject Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 26CS103"
                        value={createFormData.code || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Short Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DSA"
                        value={createFormData.shortName || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, shortName: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-bold uppercase text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Data Structures and Algorithms"
                      value={createFormData.name || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teaching Department *</label>
                    <select
                      value={createFormData.departmentId}
                      onChange={(e) => setCreateFormData({ ...createFormData, departmentId: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Type</label>
                      <select
                        value={createFormData.type}
                        onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        <option value="THEORY">THEORY</option>
                        <option value="LAB">LAB</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Credits</label>
                      <input
                        type="number"
                        step="0.5"
                        value={createFormData.credits}
                        onChange={(e) => setCreateFormData({ ...createFormData, credits: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Syllabus Outline / Unit Topics
                    </label>
                    <textarea
                      placeholder="e.g. Unit 1: Introduction to Data Structures, Arrays and Pointers&#10;Unit 2: Stacks and Queues&#10;Unit 3: Linked Lists..."
                      value={createFormData.syllabus || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, syllabus: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                      rows={4}
                    />
                  </div>
                </>
              )}

              {/* FACULTY FORM */}
              {activeTab === "faculty" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Faculty Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. A. Sharma"
                      value={createFormData.fullName || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-blue-700 mb-1">
                        Short Name (Used for Login!) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AS"
                        value={createFormData.shortName || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, shortName: e.target.value })}
                        className="w-full p-2.5 border border-blue-400 bg-blue-50/50 rounded-xl font-mono uppercase text-xs font-black text-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                      <input
                        type="text"
                        placeholder="e.g. GVPIHLR-FAC-0104"
                        value={createFormData.employeeId || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, employeeId: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department *</label>
                    <select
                      value={createFormData.departmentId}
                      onChange={(e) => setCreateFormData({ ...createFormData, departmentId: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        placeholder="Associate Professor"
                        value={createFormData.designation || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, designation: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Qualification</label>
                      <input
                        type="text"
                        placeholder="Ph.D in AI"
                        value={createFormData.qualification || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, qualification: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="a.sharma@gvpihlr.edu.in"
                        value={createFormData.email || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone</label>
                      <input
                        type="text"
                        placeholder="+91 9440112233"
                        value={createFormData.phone || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STUDENT FORM */}
              {activeTab === "students" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Roll Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5241411096"
                        value={createFormData.rollNumber || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, rollNumber: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase text-xs font-black text-rose-700"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. K. Rakesh Reddy"
                        value={createFormData.fullName || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Program *</label>
                      <select
                        value={createFormData.programId}
                        onChange={(e) => setCreateFormData({ ...createFormData, programId: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Section *</label>
                      <select
                        value={createFormData.sectionId}
                        onChange={(e) => setCreateFormData({ ...createFormData, sectionId: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        {sections.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.displayName || `Section ${s.name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Parent Mobile</label>
                      <input
                        type="text"
                        placeholder="9849099999"
                        value={createFormData.parentPhone || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, parentPhone: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Parent Name</label>
                      <input
                        type="text"
                        placeholder="K. Narayana Rao"
                        value={createFormData.parentName || ""}
                        onChange={(e) => setCreateFormData({ ...createFormData, parentName: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create {currentTabObj.singular}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT EXISTING RECORD
          ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 pb-2 border-b border-slate-100">
              Edit {editingItem.entity.toUpperCase()} Record
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              {editFormData.name !== undefined && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name / Title</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              )}

              {editingItem.entity === "regulation" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effective Academic Year</label>
                  <input
                    type="text"
                    value={editFormData.academicYearStart || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, academicYearStart: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              )}

              {editFormData.shortName !== undefined && (
                <div>
                  <label className="block font-bold text-blue-700 mb-1">
                    Short Name (Used for Login!)
                  </label>
                  <input
                    type="text"
                    value={editFormData.shortName}
                    onChange={(e) => setEditFormData({ ...editFormData, shortName: e.target.value })}
                    className="w-full p-2.5 border border-blue-400 bg-blue-50/50 rounded-xl text-xs font-mono font-black text-blue-900"
                  />
                </div>
              )}

              {editFormData.user?.fullName !== undefined && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.fullName || editFormData.user?.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              )}

              {editFormData.designation !== undefined && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              )}

              {editingItem.entity === "department" && (
                <>
                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="editTeachingOnly"
                      checked={Boolean(editFormData.isTeachingOnly)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditFormData({
                          ...editFormData,
                          isTeachingOnly: checked,
                          schoolId: checked ? null : (schools[0]?.id || null),
                          school: checked ? null : editFormData.school,
                        });
                      }}
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="editTeachingOnly" className="font-semibold text-slate-700">
                      Independent Teaching / Service Department (e.g. Mathematics, Physics, Chemistry, English)
                    </label>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Parent School {editFormData.isTeachingOnly ? "(None - Independent Teaching Department)" : "*"}
                    </label>
                    <select
                      disabled={Boolean(editFormData.isTeachingOnly)}
                      value={editFormData.isTeachingOnly ? "" : (editFormData.schoolId || "")}
                      onChange={(e) => setEditFormData({ ...editFormData, schoolId: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {editFormData.isTeachingOnly ? (
                        <option value="">- None (Independent Teaching Department) -</option>
                      ) : (
                        schools.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </>
              )}

              {editingItem.entity === "subject" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Credits</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editFormData.credits || 3.0}
                        onChange={(e) => setEditFormData({ ...editFormData, credits: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Type</label>
                      <select
                        value={editFormData.type || "THEORY"}
                        onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        <option value="THEORY">THEORY</option>
                        <option value="LAB">LAB</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Syllabus Outline / Unit Topics
                    </label>
                    <textarea
                      placeholder="Enter course syllabus, units, and learning modules..."
                      value={editFormData.syllabus || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, syllabus: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                      rows={5}
                    />
                  </div>
                </>
              )}

              {editFormData.description !== undefined && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                  <textarea
                    value={editFormData.description || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                    rows={3}
                  />
                </div>
              )}

              {editFormData.parentPhone !== undefined && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Phone</label>
                  <input
                    type="text"
                    value={editFormData.parentPhone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="px-5 py-2.5 bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Record</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DELETE CONFIRMATION
          ========================================================================= */}
      <CustomModal
        isOpen={Boolean(deleteConfirm)}
        title="Confirm Permanent Deletion"
        onClose={() => setDeleteConfirm(null)}
        onConfirm={executeDelete}
        confirmText="Yes, Permanently Delete"
        type="danger"
        isLoading={isDeleting}
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Are you sure you want to permanently delete:
            <strong className="block text-slate-900 text-sm mt-1 font-mono">
              {deleteConfirm?.title}
            </strong>
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-semibold">
            🛡️ <strong>Safety Protection:</strong> If this entity has historical attendance records or curriculum mappings in the database, the system will block hard deletion to prevent data corruption, and recommend deactivation instead.
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
