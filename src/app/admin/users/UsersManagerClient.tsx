"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  UserCheck,
  UserX,
  Lock,
  Unlock,
} from "lucide-react";
import CustomModal from "@/components/ui/CustomModal";

interface UsersManagerProps {
  initialFaculty: any[];
  initialStudents: any[];
  departments: any[];
  programs: any[];
  sections: any[];
}

export default function UsersManagerClient({
  initialFaculty,
  initialStudents,
  departments,
  programs,
  sections,
}: UsersManagerProps) {
  const [activeTab, setActiveTab] = useState<"faculty" | "students">("faculty");
  const [faculty, setFaculty] = useState(initialFaculty);
  const [students, setStudents] = useState(initialStudents);
  const [searchFilter, setSearchFilter] = useState("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<{ type: "faculty" | "student"; data: any } | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "faculty" | "student";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Alerts
  // Student Login Management States
  const [selectedStudentUserIds, setSelectedStudentUserIds] = useState<Set<string>>(new Set());
  const [isGlobalLoginModalOpen, setIsGlobalLoginModalOpen] = useState(false);
  const [globalLoginTarget, setGlobalLoginTarget] = useState(false);
  const [isLoginActionInProgress, setIsLoginActionInProgress] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);

  const activeStudentLoginsCount = useMemo(() => {
    return students.filter((s) => s.user?.isActive !== false).length;
  }, [students]);

  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Open Create Modal
  const openCreateModal = () => {
    setActionAlert(null);
    if (activeTab === "faculty") {
      setCreateFormData({
        fullName: "",
        shortName: "",
        employeeId: "",
        departmentId: departments[0]?.id || "",
        designation: "Assistant Professor",
        qualification: "Ph.D / M.Tech",
        phone: "+91 9440112233",
        email: "",
        password: "gvpihlr@2026",
      });
    } else {
      setCreateFormData({
        fullName: "",
        rollNumber: "",
        programId: programs[0]?.id || "",
        sectionId: sections[0]?.id || "",
        admissionYear: "2026",
        parentName: "",
        parentPhone: "+91 9849011223",
        email: "",
        password: "Student@1234",
      });
    }
    setIsCreateOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setActionAlert(null);

    try {
      const res = await fetch("/api/admin/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: activeTab === "faculty" ? "faculty" : "student",
          data: createFormData,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setActionAlert({ type: "error", message: result.error || "Failed to create user." });
        setIsCreating(false);
        return;
      }

      if (activeTab === "faculty") {
        const dept = departments.find((d) => d.id === createFormData.departmentId);
        const newFaculty = {
          ...result.created,
          user: {
            fullName: createFormData.fullName,
            email: createFormData.email || `${createFormData.shortName.toLowerCase()}@gvpihlr.edu.in`,
            phone: createFormData.phone,
          },
          department: dept,
        };
        setFaculty([newFaculty, ...faculty]);
      } else {
        const sec = sections.find((s) => s.id === createFormData.sectionId);
        const prog = programs.find((p) => p.id === createFormData.programId);
        const newStudent = {
          ...result.created,
          user: {
            fullName: createFormData.fullName,
            email: createFormData.email,
            phone: createFormData.parentPhone,
          },
          enrollments: [
            {
              section: sec,
              program: prog,
              isCurrent: true,
            },
          ],
        };
        setStudents([newStudent, ...students]);
      }

      setActionAlert({ type: "success", message: result.message || "User created successfully!" });
      setIsCreateOpen(false);
      setCreateFormData({});
    } catch {
      setActionAlert({ type: "error", message: "Network error occurred." });
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (type: "faculty" | "student", item: any) => {
    setActionAlert(null);
    setEditingUser({ type, data: item });
    if (type === "faculty") {
      setEditFormData({
        fullName: item.user?.fullName || "",
        shortName: item.shortName || "",
        employeeId: item.employeeId || "",
        departmentId: item.departmentId || "",
        designation: item.designation || "Assistant Professor",
        qualification: item.qualification || "Ph.D",
        email: item.user?.email || "",
        phone: item.user?.phone || "",
        password: "", // empty means leave unchanged
        isActive: item.isActive,
      });
    } else {
      const currEnroll = item.enrollments?.find((e: any) => e.isCurrent);
      setEditFormData({
        fullName: item.user?.fullName || "",
        rollNumber: item.rollNumber || "",
        sectionId: currEnroll?.sectionId || sections[0]?.id || "",
        programId: currEnroll?.programId || programs[0]?.id || "",
        parentName: item.parentName || "",
        parentPhone: item.parentPhone || "",
        email: item.user?.email || "",
        password: "",
        status: item.status || "ACTIVE",
      });
    }
  };

  // Toggle Single Student Login
  const handleToggleStudentLogin = async (studentId: string, enable: boolean) => {
    setUpdatingStudentId(studentId);
    setActionAlert(null);
    try {
      const res = await fetch("/api/admin/users/student-logins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "single", studentId, enable }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionAlert({ type: "error", message: data.error || "Failed to update login status." });
        return;
      }

      setStudents((prev: any[]) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, user: { ...s.user, isActive: enable } } : s
        )
      );
      setActionAlert({
        type: "success",
        message: `Student login access successfully ${enable ? "enabled" : "disabled"}.`,
      });
    } catch {
      setActionAlert({ type: "error", message: "Failed to communicate with server." });
    } finally {
      setUpdatingStudentId(null);
    }
  };

  // Batch Toggle Student Logins
  const handleBatchStudentLogins = async (enable: boolean) => {
    const studentIds = Array.from(selectedStudentUserIds);
    if (studentIds.length === 0) return;

    setIsLoginActionInProgress(true);
    try {
      const res = await fetch("/api/admin/users/student-logins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "selected", studentIds, enable }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionAlert({ type: "error", message: data.error || "Failed to update login status." });
        return;
      }

      const idSet = new Set(studentIds);
      setStudents((prev: any[]) =>
        prev.map((s) =>
          idSet.has(s.id) ? { ...s, user: { ...s.user, isActive: enable } } : s
        )
      );
      setSelectedStudentUserIds(new Set());
      setActionAlert({
        type: "success",
        message: `Login access ${enable ? "enabled" : "disabled"} for ${data.count} selected students.`,
      });
    } catch {
      setActionAlert({ type: "error", message: "Failed to communicate with server." });
    } finally {
      setIsLoginActionInProgress(false);
    }
  };

  // Global Toggle Student Logins (All Students)
  const handleGlobalStudentLogins = async (enable: boolean) => {
    setIsLoginActionInProgress(true);
    try {
      const res = await fetch("/api/admin/users/student-logins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "all", enable }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionAlert({ type: "error", message: data.error || "Failed to update global login status." });
        return;
      }

      setStudents((prev: any[]) =>
        prev.map((s) => ({ ...s, user: { ...s.user, isActive: enable } }))
      );
      setIsGlobalLoginModalOpen(false);
      setActionAlert({
        type: "success",
        message: `Global login access ${enable ? "enabled" : "disabled"} for all ${data.count} students.`,
      });
    } catch {
      setActionAlert({ type: "error", message: "Failed to communicate with server." });
    } finally {
      setIsLoginActionInProgress(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    setActionAlert(null);

    try {
      const res = await fetch("/api/admin/master", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: editingUser.type,
          id: editingUser.data.id,
          data: editFormData,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setActionAlert({ type: "error", message: result.error || "Failed to update user." });
        setIsSaving(false);
        return;
      }

      if (editingUser.type === "faculty") {
        const dept = departments.find((d) => d.id === editFormData.departmentId);
        setFaculty(
          faculty.map((f) =>
            f.id === editingUser.data.id
              ? {
                  ...f,
                  ...result.updated,
                  department: dept || f.department,
                  user: {
                    ...f.user,
                    fullName: editFormData.fullName,
                    email: editFormData.email,
                    phone: editFormData.phone,
                  },
                }
              : f
          )
        );
      } else {
        const sec = sections.find((s) => s.id === editFormData.sectionId);
        const prog = programs.find((p) => p.id === editFormData.programId);
        setStudents(
          students.map((s) =>
            s.id === editingUser.data.id
              ? {
                  ...s,
                  ...result.updated,
                  user: {
                    ...s.user,
                    fullName: editFormData.fullName,
                    email: editFormData.email,
                  },
                  enrollments: [
                    {
                      section: sec,
                      program: prog,
                      isCurrent: true,
                    },
                  ],
                }
              : s
          )
        );
      }

      setActionAlert({ type: "success", message: result.message || "User updated successfully!" });
      setEditingUser(null);
    } catch {
      setActionAlert({ type: "error", message: "Network error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (type: "faculty" | "student", id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/master", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: type,
          id,
          isActive: !currentStatus,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setActionAlert({ type: "error", message: result.error || "Failed to update status." });
        return;
      }

      if (type === "faculty") {
        setFaculty(faculty.map((f) => (f.id === id ? { ...f, isActive: !currentStatus } : f)));
      } else {
        setStudents(
          students.map((s) => (s.id === id ? { ...s, status: !currentStatus ? "ACTIVE" : "SUSPENDED" } : s))
        );
      }
      setActionAlert({
        type: "success",
        message: `Account ${!currentStatus ? "activated" : "deactivated"} successfully.`,
      });
    } catch {
      setActionAlert({ type: "error", message: "Failed to communicate with server." });
    }
  };

  // Execute Deletion
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    setActionAlert(null);

    try {
      const res = await fetch(`/api/admin/master?entity=${deleteConfirm.type}&id=${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setActionAlert({ type: "warning", message: result.error || "Cannot delete record." });
        setIsDeleting(false);
        setDeleteConfirm(null);
        return;
      }

      if (deleteConfirm.type === "faculty") {
        setFaculty(faculty.filter((f) => f.id !== deleteConfirm.id));
      } else {
        setStudents(students.filter((s) => s.id !== deleteConfirm.id));
      }

      setActionAlert({ type: "success", message: result.message || "User deleted successfully." });
      setDeleteConfirm(null);
    } catch {
      setActionAlert({ type: "error", message: "Network error occurred during deletion." });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered lists
  const filteredFaculty = faculty.filter(
    (f) =>
      !searchFilter ||
      f.user?.fullName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.shortName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.employeeId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.department?.name?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      !searchFilter ||
      s.user?.fullName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.parentName?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Multi-select helpers for students
  const isAllStudentsSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentUserIds.has(s.id));

  const handleToggleSelectAllStudents = () => {
    const newSet = new Set(selectedStudentUserIds);
    if (isAllStudentsSelected) {
      filteredStudents.forEach((s) => newSet.delete(s.id));
    } else {
      filteredStudents.forEach((s) => newSet.add(s.id));
    }
    setSelectedStudentUserIds(newSet);
  };

  const handleToggleSingleStudentSelect = (id: string) => {
    const newSet = new Set(selectedStudentUserIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudentUserIds(newSet);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0B2545] transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              User Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
              Admin Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check faculty and student user accounts, configure institutional logins, edit profile credentials, and manage roles.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-bold shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === "faculty" ? "Add New Faculty" : "Add New Student"}</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-bold transition animate-in fade-in ${
            actionAlert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : actionAlert.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {actionAlert.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          {actionAlert.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
          {actionAlert.type === "error" && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
          <div className="flex-1">{actionAlert.message}</div>
          <button
            type="button"
            onClick={() => setActionAlert(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Sub-Tabs & Search Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("faculty");
              setSearchFilter("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "faculty"
                ? "bg-white text-[#0B2545] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Faculty Users</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
              {faculty.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("students");
              setSearchFilter("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "students"
                ? "bg-white text-[#0B2545] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-rose-600" />
            <span>Student Users</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono font-bold">
              {students.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={
              activeTab === "faculty"
                ? "Search faculty name, short name (KR), dept..."
                : "Search student roll number, name..."
            }
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
          />
        </div>
      </div>

      {/* Global Student Logins Control Bar */}
      {activeTab === "students" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">Student Portal Logins:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  activeStudentLoginsCount === students.length
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : activeStudentLoginsCount === 0
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeStudentLoginsCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                  <span>{activeStudentLoginsCount} of {students.length} Logins Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Disable or enable institutional student logins anytime. Student academic records and attendance are completely preserved.
              </p>
            </div>
          </div>

          {/* Global Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setGlobalLoginTarget(true);
                setIsGlobalLoginModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Enable All Student Logins</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGlobalLoginTarget(false);
                setIsGlobalLoginModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition shadow-xs"
            >
              <UserX className="w-4 h-4 text-rose-600" />
              <span>Disable All Student Logins</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Batch Actions Bar for Selected Students */}
      {activeTab === "students" && selectedStudentUserIds.size > 0 && (
        <div className="bg-[#0B2545] text-white rounded-2xl p-3.5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{selectedStudentUserIds.size} student(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBatchStudentLogins(true)}
              disabled={isLoginActionInProgress}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Enable Logins ({selectedStudentUserIds.size})</span>
            </button>
            <button
              type="button"
              onClick={() => handleBatchStudentLogins(false)}
              disabled={isLoginActionInProgress}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Disable Logins ({selectedStudentUserIds.size})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStudentUserIds(new Set())}
              className="px-2.5 py-1.5 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Users Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        {activeTab === "faculty" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Faculty Member</th>
                  <th className="py-3.5 px-4 text-center">Login ID (Short Name)</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4 text-center">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No faculty users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((fac) => (
                    <tr key={fac.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{fac.user?.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {fac.user?.email || `${fac.shortName?.toLowerCase()}@gvpihlr.edu.in`}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-black text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-xs">
                          {fac.shortName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{fac.employeeId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {fac.department?.name || "Independent"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{fac.designation}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fac.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {fac.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEditModal("faculty", fac)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive("faculty", fac.id, fac.isActive)}
                          className={`px-2.5 py-1 font-bold rounded-lg text-[11px] border transition inline-flex items-center gap-1 ${
                            fac.isActive
                              ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                          }`}
                        >
                          {fac.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          <span>{fac.isActive ? "Deactivate" : "Activate"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: "faculty",
                              id: fac.id,
                              name: fac.user?.fullName || fac.shortName,
                            })
                          }
                          className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllStudentsSelected}
                      onChange={handleToggleSelectAllStudents}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3.5 px-4 font-mono">Roll Number (Login)</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Program &amp; Current Section</th>
                  <th className="py-3.5 px-4">Parent Contact</th>
                  <th className="py-3.5 px-4 text-center">Admission Year</th>
                  <th className="py-3.5 px-4 text-center">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No student users registered in the system yet. Click &quot;Add New Student&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => {
                    const currEnroll = stu.enrollments?.find((e: any) => e.isCurrent);
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudentUserIds.has(stu.id)}
                            onChange={() => handleToggleSingleStudentSelect(stu.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-rose-800 bg-rose-50/50">
                          {stu.rollNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{stu.user?.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{stu.user?.email || "—"}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {currEnroll?.section ? (
                            <span className="font-bold text-blue-900">
                              {currEnroll.program?.name || "Program"} — Section {currEnroll.section.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not Enrolled</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{stu.parentPhone || "—"}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">{stu.admissionYear}</td>
                        <td className="py-3 px-4 text-center">
                          {stu.user?.isActive !== false ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                              <UserX className="w-3 h-3" />
                              <span>DISABLED</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditModal("student", stu)}
                            className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[11px] transition inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          {stu.user?.isActive !== false ? (
                            <button
                              type="button"
                              disabled={updatingStudentId === stu.id}
                              onClick={() => handleToggleStudentLogin(stu.id, false)}
                              className="px-2.5 py-1 font-bold rounded-lg text-[11px] border text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 transition inline-flex items-center gap-1 disabled:opacity-50"
                              title="Disable this student from logging in"
                            >
                              {updatingStudentId === stu.id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                              ) : (
                                <UserX className="w-3 h-3 text-rose-600" />
                              )}
                              <span>Disable Login</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={updatingStudentId === stu.id}
                              onClick={() => handleToggleStudentLogin(stu.id, true)}
                              className="px-2.5 py-1 font-bold rounded-lg text-[11px] border text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 transition inline-flex items-center gap-1 disabled:opacity-50"
                              title="Enable this student to log in"
                            >
                              {updatingStudentId === stu.id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                              ) : (
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>Enable Login</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: "student",
                                id: stu.id,
                                name: stu.user?.fullName || stu.rollNumber,
                              })
                            }
                            className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px] transition inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      <CustomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={activeTab === "faculty" ? "Create New Faculty Account" : "Enroll New Student User"}
        description={
          activeTab === "faculty"
            ? "Create an official institutional faculty user profile with login short name credentials."
            : "Enroll a new student profile and link them to their academic program and section."
        }
        type="info"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 mt-3 text-xs">
          {activeTab === "faculty" ? (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K Ramesh Kumar"
                  value={createFormData.fullName || ""}
                  onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Login Short Name (e.g. KR, PS)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KR"
                    value={createFormData.shortName || ""}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, shortName: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. GVPIHLR-KR"
                    value={createFormData.employeeId || ""}
                    onChange={(e) => setCreateFormData({ ...createFormData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Home Department</label>
                  <select
                    value={createFormData.departmentId}
                    onChange={(e) => setCreateFormData({ ...createFormData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <select
                    value={createFormData.designation}
                    onChange={(e) => setCreateFormData({ ...createFormData, designation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createFormData.phone || ""}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={createFormData.password || "gvpihlr@2026"}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5241411014"
                    value={createFormData.rollNumber || ""}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, rollNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siddartha Varma"
                    value={createFormData.fullName || ""}
                    onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Degree Program</label>
                  <select
                    value={createFormData.programId}
                    onChange={(e) => setCreateFormData({ ...createFormData, programId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enrolled Section</label>
                  <select
                    value={createFormData.sectionId}
                    onChange={(e) => setCreateFormData({ ...createFormData, sectionId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.program?.code || "Section"} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Phone</label>
                  <input
                    type="text"
                    value={createFormData.parentPhone || ""}
                    onChange={(e) => setCreateFormData({ ...createFormData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={createFormData.password || "Student@1234"}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2 bg-[#0B2545] hover:bg-[#132E5C] text-white font-bold rounded-xl flex items-center gap-2"
            >
              {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </CustomModal>

      {/* EDIT USER MODAL */}
      <CustomModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={editingUser?.type === "faculty" ? "Edit Faculty Profile & Login" : "Edit Student Profile"}
        description="Update profile details or enter a new password to reset account access."
        type="info"
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5 mt-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editFormData.fullName || ""}
              onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          {editingUser?.type === "faculty" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login Short Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.shortName || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, shortName: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={editFormData.departmentId}
                    onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editFormData.designation || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={editFormData.rollNumber || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, rollNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <select
                    value={editFormData.sectionId}
                    onChange={(e) => setEditFormData({ ...editFormData, sectionId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.program?.code} — Sec {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Parent Phone</label>
                <input
                  type="text"
                  value={editFormData.parentPhone || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>
            </>
          )}

          {/* Reset Password Field */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Reset Password (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Leave blank to keep current password"
              value={editFormData.password || ""}
              onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-mono text-xs bg-white"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#0B2545] hover:bg-[#132E5C] text-white font-bold rounded-xl flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </CustomModal>

      {/* DELETE CONFIRMATION MODAL */}
      <CustomModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm User Account Deletion"
        description={`Are you sure you want to delete ${deleteConfirm?.name}? If this user has recorded historical attendance sessions, system integrity safeguards will prevent hard-deletion and recommend deactivation instead.`}
        confirmText="Confirm Delete"
        type="danger"
        isLoading={isDeleting}
      />

      {/* GLOBAL STUDENT LOGINS CONFIRMATION MODAL */}
      <CustomModal
        isOpen={isGlobalLoginModalOpen}
        onClose={() => setIsGlobalLoginModalOpen(false)}
        onConfirm={() => handleGlobalStudentLogins(globalLoginTarget)}
        title={globalLoginTarget ? "Enable All Student Logins" : "Disable All Student Logins"}
        description={
          globalLoginTarget
            ? `Are you sure you want to enable portal logins for ALL ${students.length} students? Students will be able to log in to the portal with their roll number and password.`
            : `Are you sure you want to disable portal logins for ALL ${students.length} students? When trying to log in, students will be informed that logins are temporarily disabled by the administration. Note: Student academic profiles, enrollments, and attendance records remain 100% intact.`
        }
        confirmText={globalLoginTarget ? "Confirm Enable All" : "Confirm Disable All"}
        type={globalLoginTarget ? "success" : "danger"}
        isLoading={isLoginActionInProgress}
      />
    </div>
  );
}
