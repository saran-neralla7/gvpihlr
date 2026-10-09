"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Plus,
  ArrowUpFromLine,
  FileText,
  Camera,
  ArrowDownToLine,
  Filter,
  Search,
  Phone,
  Mail,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CustomModal from "@/components/ui/CustomModal";

interface FacultyManagerProps {
  faculty: any[];
  departments: any[];
}

export default function FacultyManagerClient({
  faculty: initialFaculty,
  departments,
}: FacultyManagerProps) {
  const [faculty, setFaculty] = useState<any[]>(initialFaculty);

  // Filter States
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [activeDeptFilter, setActiveDeptFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

  const [activeFaculty, setActiveFaculty] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Apply Department Filter on "Load Faculty" or dropdown change
  const handleLoadFaculty = () => {
    setActiveDeptFilter(selectedDeptId);
    setCurrentPage(1);
  };

  // Filtered Faculty
  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      // Department filter
      if (activeDeptFilter) {
        if (f.departmentId !== activeDeptFilter && f.department?.id !== activeDeptFilter) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const name = (f.user?.fullName || "").toLowerCase();
        const code = (f.employeeId || "").toLowerCase();
        const short = (f.shortName || "").toLowerCase();
        const email = (f.user?.email || "").toLowerCase();
        if (!name.includes(query) && !code.includes(query) && !short.includes(query) && !email.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [faculty, activeDeptFilter, searchQuery]);

  // Paginated Faculty
  const totalPages = Math.ceil(filteredFaculty.length / pageSize) || 1;
  const paginatedFaculty = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFaculty.slice(start, start + pageSize);
  }, [filteredFaculty, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Employee ID",
      "Short Name",
      "Full Name",
      "Designation",
      "Department",
      "Phone",
      "Email",
      "Qualification",
    ];

    const rows = filteredFaculty.map((f) => [
      `"${f.employeeId || ""}"`,
      `"${f.shortName || ""}"`,
      `"${f.user?.fullName || ""}"`,
      `"${f.designation || ""}"`,
      `"${f.department?.name || ""}"`,
      `"${f.user?.phone || ""}"`,
      `"${f.user?.email || ""}"`,
      `"${f.qualification || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `faculty_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Template CSV
  const handleDownloadTemplate = () => {
    const headers = [
      "employeeId",
      "shortName",
      "fullName",
      "designation",
      "departmentCode",
      "phone",
      "email",
    ];
    const sampleRows = [
      "GVPIHLR-BHP,BHP,Dr. Bh Padma,Professor,CSE,9441921325,padmabh@gvpcdpgc.edu.in",
      "GVPIHLR-DC,DC,Dr. D Chandravathi,Associate Professor,CSE,9951862491,chandravathid@gvpcdpgc.edu.in",
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...sampleRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "faculty_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Faculty Handler
  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await fetch("/api/admin/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "faculty",
          data: formData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create faculty");
      }

      setAlertMsg({ type: "success", text: "Faculty profile created successfully!" });
      setIsAddOpen(false);
      setFormData({});
      window.location.reload();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Faculty Handler
  const handleEditFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFaculty) return;
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await fetch("/api/admin/master", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "faculty",
          id: activeFaculty.id,
          data: formData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update faculty");
      }

      setFaculty((prev) =>
        prev.map((f) => {
          if (f.id === activeFaculty.id) {
            const matchedDept = departments.find((d) => d.id === formData.departmentId) || f.department;
            return {
              ...f,
              shortName: formData.shortName || f.shortName,
              designation: formData.designation || f.designation,
              qualification: formData.qualification !== undefined ? formData.qualification : f.qualification,
              departmentId: formData.departmentId || f.departmentId,
              department: matchedDept,
              user: {
                ...f.user,
                fullName: formData.fullName || f.user?.fullName,
                phone: formData.phone !== undefined ? formData.phone : f.user?.phone,
                email: formData.email !== undefined ? formData.email : f.user?.email,
              },
            };
          }
          return f;
        })
      );

      setAlertMsg({ type: "success", text: "Faculty updated successfully!" });
      setIsEditOpen(false);
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Faculty Handler
  const handleDeleteFaculty = async () => {
    if (!activeFaculty) return;
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await fetch(`/api/admin/master?entity=faculty&id=${activeFaculty.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete faculty member");
      }

      setFaculty((prev) => prev.filter((f) => f.id !== activeFaculty.id));
      setIsDeleteOpen(false);
      setAlertMsg({ type: "success", text: "Faculty member deleted successfully!" });
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

      {/* Top Header Row matching Screenshot 4 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title & Purple Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage Faculty
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              add and manage faculty profiles
            </p>
          </div>
        </div>

        {/* Action Buttons matching Screenshot 4 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs"
            title="Export faculty list"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          {/* Template */}
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs"
            title="Download CSV Template"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Template</span>
          </button>

          {/* Photos */}
          <button
            onClick={() => setIsPhotosOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs"
            title="Upload faculty photos"
          >
            <Camera className="w-3.5 h-3.5 text-slate-500" />
            <span>Photos</span>
          </button>

          {/* Import */}
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs"
            title="Import faculty records"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
          </button>

          {/* + Add Faculty */}
          <button
            onClick={() => {
              setFormData({
                designation: "Assistant Professor",
                qualification: "Ph.D / M.Tech",
                departmentId: departments[0]?.id || "",
              });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Filter Row matching Screenshot 4 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-2">
        <div className="text-[11px] font-bold text-slate-700">Department Filter</div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Department Select */}
          <div className="w-full sm:w-72">
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setActiveDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.replace("Department of ", "")}
                </option>
              ))}
            </select>
          </div>

          {/* Load Faculty Button */}
          <button
            onClick={handleLoadFaculty}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Load Faculty</span>
          </button>

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Name or Code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Faculty Table matching Screenshot 4 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/60 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-5">EMPLOYEE</th>
                <th className="py-3 px-5">DESIGNATION</th>
                <th className="py-3 px-5">DEPARTMENT</th>
                <th className="py-3 px-5">CONTACT</th>
                <th className="py-3 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFaculty.length > 0 ? (
                paginatedFaculty.map((f) => {
                  const initials = f.user?.fullName
                    ? f.user.fullName
                        .replace("Dr. ", "")
                        .replace("Prof. ", "")
                        .replace("Mr. ", "")
                        .replace("Mrs. ", "")
                        .replace("Ms. ", "")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "FC";

                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-purple-50/20 transition-colors group"
                    >
                      {/* Employee Column: Avatar, Name, Code */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-purple-100 group-hover:text-purple-700 transition">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-blue-600 hover:underline cursor-pointer">
                              {f.user?.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {f.employeeId || f.shortName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-5">
                        <span className="text-slate-700 font-medium">{f.designation}</span>
                      </td>

                      {/* Department: pill badge */}
                      <td className="py-3 px-5">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {f.department?.name ? f.department.name.replace("Department of ", "") : "General"}
                        </span>
                      </td>

                      {/* Contact: Phone & Email */}
                      <td className="py-3 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{f.user?.phone || "-"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{f.user?.email || "-"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-5 text-right">
                        <div className="inline-flex items-center gap-2 text-slate-400">
                          <button
                            onClick={() => {
                              setActiveFaculty(f);
                              setFormData({
                                fullName: f.user?.fullName,
                                shortName: f.shortName,
                                employeeId: f.employeeId,
                                designation: f.designation,
                                qualification: f.qualification,
                                departmentId: f.departmentId,
                                phone: f.user?.phone,
                                email: f.user?.email,
                              });
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Faculty Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setActiveFaculty(f);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Faculty Profile"
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
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                    No faculty found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <strong className="text-slate-800">{paginatedFaculty.length}</strong> of{" "}
            <strong className="text-slate-800">{filteredFaculty.length}</strong> faculty members
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

      {/* 1. ADD FACULTY MODAL */}
      {isAddOpen && (
        <CustomModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Faculty Member"
        >
          <form onSubmit={handleAddFaculty} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. A Suseelatha"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Name / Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ASL or KR"
                  value={formData.shortName || ""}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Employee ID</label>
                <input
                  type="text"
                  placeholder="e.g. GVPIHLR-FAC-0142"
                  value={formData.employeeId || ""}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department *</label>
                <select
                  required
                  value={formData.departmentId || ""}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation</label>
                <select
                  value={formData.designation || "Assistant Professor"}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Senior Assistant Professor">Senior Assistant Professor</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="Ph.D, M.Tech"
                  value={formData.qualification || ""}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 9441921325"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Institutional Email</label>
                <input
                  type="email"
                  placeholder="faculty@gvpihlr.edu.in"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Faculty Profile</span>
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* 2. EDIT FACULTY MODAL */}
      {isEditOpen && activeFaculty && (
        <CustomModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Faculty: ${activeFaculty.user?.fullName}`}
        >
          <form onSubmit={handleEditFaculty} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Name / Code</label>
                <input
                  type="text"
                  value={formData.shortName || ""}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation</label>
                <select
                  value={formData.designation || "Assistant Professor"}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Senior Assistant Professor">Senior Assistant Professor</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <select
                  value={formData.departmentId || ""}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* 3. DELETE FACULTY MODAL */}
      {isDeleteOpen && activeFaculty && (
        <CustomModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Confirm Faculty Profile Deletion"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">
                  Are you sure you want to delete {activeFaculty.user?.fullName}?
                </p>
                <p className="text-rose-700 mt-1">
                  Code: <strong>{activeFaculty.employeeId || activeFaculty.shortName}</strong> ({activeFaculty.department?.name}). This action will remove the faculty user account and their profile.
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
                onClick={handleDeleteFaculty}
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

      {/* 4. IMPORT MODAL */}
      {isImportOpen && (
        <CustomModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          title="Import Faculty Profiles from CSV"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Upload CSV file with columns:{" "}
              <code className="text-purple-700 font-mono">
                employeeId, shortName, fullName, designation, departmentCode, phone, email
              </code>
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-purple-400 transition cursor-pointer">
              <ArrowDownToLine className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-700">Choose CSV file to upload</div>
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
                  alert("Use the template CSV to import new faculty records.");
                  setIsImportOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Upload &amp; Process
              </button>
            </div>
          </div>
        </CustomModal>
      )}

      {/* 5. PHOTOS MODAL */}
      {isPhotosOpen && (
        <CustomModal
          isOpen={isPhotosOpen}
          onClose={() => setIsPhotosOpen(false)}
          title="Batch Upload Faculty Photos"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Upload photos named by employee ID or short name (e.g.{" "}
              <code className="text-purple-700 font-mono">BHP.jpg</code>).
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-purple-400 transition cursor-pointer">
              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-700">Choose ZIP / Image files</div>
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
                  alert("Photos asset upload pipeline ready.");
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
