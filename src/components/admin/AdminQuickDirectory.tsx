"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Search,
  ArrowRight,
  User,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";

interface AdminQuickDirectoryProps {
  students: any[];
  faculty: any[];
  programs: any[];
  departments: any[];
}

export default function AdminQuickDirectory({
  students,
  faculty,
  programs,
  departments,
}: AdminQuickDirectoryProps) {
  const [activeTab, setActiveTab] = useState<"students" | "faculty">("students");

  // Students filter states
  const [studentSearch, setStudentSearch] = useState("");
  const [studentProg, setStudentProg] = useState("");

  // Faculty filter states
  const [facultySearch, setFacultySearch] = useState("");
  const [facultyDept, setFacultyDept] = useState("");

  // Filtered Students (preview max 8)
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (studentProg) {
          const pId = s.enrollments?.[0]?.programId;
          if (pId !== studentProg) return false;
        }
        if (studentSearch.trim()) {
          const q = studentSearch.trim().toLowerCase();
          const r = (s.rollNumber || "").toLowerCase();
          const n = (s.user?.fullName || "").toLowerCase();
          if (!r.includes(q) && !n.includes(q)) return false;
        }
        return true;
      })
      .slice(0, 10);
  }, [students, studentProg, studentSearch]);

  // Filtered Faculty (preview max 8)
  const filteredFaculty = useMemo(() => {
    return faculty
      .filter((f) => {
        if (facultyDept) {
          if (f.departmentId !== facultyDept && f.department?.id !== facultyDept) return false;
        }
        if (facultySearch.trim()) {
          const q = facultySearch.trim().toLowerCase();
          const n = (f.user?.fullName || "").toLowerCase();
          const c = (f.employeeId || "").toLowerCase();
          const s = (f.shortName || "").toLowerCase();
          if (!n.includes(q) && !c.includes(q) && !s.includes(q)) return false;
        }
        return true;
      })
      .slice(0, 10);
  }, [faculty, facultyDept, facultySearch]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
      {/* Directory Header with Tabs & Dedicated Page Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Students Tab */}
          <button
            onClick={() => setActiveTab("students")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "students"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students Directory ({students.length})</span>
          </button>

          {/* Faculty Tab */}
          <button
            onClick={() => setActiveTab("faculty")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "faculty"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Faculty Directory ({faculty.length})</span>
          </button>
        </div>

        {/* Link to Dedicated Page */}
        {activeTab === "students" ? (
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition shadow-xs"
          >
            <span>Open Dedicated Students Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href="/admin/faculty"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition shadow-xs"
          >
            <span>Open Dedicated Faculty Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* =========================================================================
          TAB 1: STUDENTS DIRECTORY PREVIEW
          ========================================================================= */}
      {activeTab === "students" && (
        <div className="space-y-4">
          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-64">
              <select
                value={studentProg}
                onChange={(e) => setStudentProg(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Degree Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Student by Name or Roll Number..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick List Table */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-12">PHOTO</th>
                  <th className="py-2.5 px-4">ROLL NO</th>
                  <th className="py-2.5 px-4">NAME</th>
                  <th className="py-2.5 px-4">CLASS</th>
                  <th className="py-2.5 px-4">MOBILE</th>
                  <th className="py-2.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const enr = s.enrollments?.[0];
                  const classStr = enr
                    ? `${enr.year}-${enr.semester} (Sec ${enr.section?.name || "1"})`
                    : "1-1 (Sec 1)";

                  return (
                    <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">
                        <Link href="/admin/students" className="hover:underline">
                          {s.rollNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800 uppercase">
                        {s.user?.fullName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-medium">{classStr}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{s.user?.phone || "-"}</td>
                      <td className="py-2.5 px-4 text-right">
                        <Link
                          href="/admin/students"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Showing preview of 10 students. Total active students: <strong>{students.length}</strong>.
            </span>
            <Link
              href="/admin/students"
              className="font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View all {students.length} students in dedicated manager →</span>
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: FACULTY DIRECTORY PREVIEW
          ========================================================================= */}
      {activeTab === "faculty" && (
        <div className="space-y-4">
          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-64">
              <select
                value={facultyDept}
                onChange={(e) => setFacultyDept(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.replace("Department of ", "")}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Faculty by Name or Employee Code..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Quick List Table */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">EMPLOYEE</th>
                  <th className="py-2.5 px-4">DESIGNATION</th>
                  <th className="py-2.5 px-4">DEPARTMENT</th>
                  <th className="py-2.5 px-4">CONTACT</th>
                  <th className="py-2.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.map((f) => {
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
                    <tr key={f.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href="/admin/faculty"
                              className="font-bold text-blue-600 hover:underline block"
                            >
                              {f.user?.fullName}
                            </Link>
                            <span className="text-[10px] font-mono text-slate-400">
                              {f.employeeId || f.shortName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 font-medium">{f.designation}</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {f.department?.name ? f.department.name.replace("Department of ", "") : "General"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                        {f.user?.phone || f.user?.email || "-"}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Link
                          href="/admin/faculty"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Showing preview of 10 faculty. Total faculty profiles: <strong>{faculty.length}</strong>.
            </span>
            <Link
              href="/admin/faculty"
              className="font-bold text-purple-600 hover:underline flex items-center gap-1"
            >
              <span>View all {faculty.length} faculty members in dedicated manager →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
