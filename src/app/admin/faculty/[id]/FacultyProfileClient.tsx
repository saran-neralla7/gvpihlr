"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  User,
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  Clock,
  Layers,
  Award,
  CheckCircle2,
  ExternalLink,
  Filter,
  Search,
} from "lucide-react";

interface AssignedSubjectItem {
  assignmentId: string;
  sectionId: string;
  sectionName: string;
  sectionDisplayName: string;
  programName: string;
  programCode: string;
  year: number;
  semester: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectShortName: string;
  subjectType: string;
  credits: number;
  sessionsConducted: number;
}

interface FacultyProfileProps {
  faculty: {
    id: string;
    employeeId: string;
    shortName: string;
    fullName: string;
    designation: string;
    qualification?: string | null;
    departmentName: string;
    departmentCode: string;
    schoolName: string;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    username: string;
    isActive: boolean;
    joiningDate?: string | null;
  };
  assignedSubjects: AssignedSubjectItem[];
  distinctSemesters: number[];
  canEdit: boolean;
  canDelete: boolean;
}

export default function FacultyProfileClient({
  faculty,
  assignedSubjects,
  distinctSemesters,
  canEdit,
  canDelete,
}: FacultyProfileProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "subjects">("profile");
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [subjectSearch, setSubjectSearch] = useState<string>("");

  const initials = faculty.fullName
    ? faculty.fullName
        .replace("Dr. ", "")
        .replace("Prof. ", "")
        .replace("Mr. ", "")
        .replace("Mrs. ", "")
        .replace("Ms. ", "")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : faculty.shortName.slice(0, 2).toUpperCase();

  const totalSessionsAll = useMemo(() => {
    return assignedSubjects.reduce((acc, s) => acc + s.sessionsConducted, 0);
  }, [assignedSubjects]);

  const filteredSubjects = useMemo(() => {
    return assignedSubjects.filter((s) => {
      const matchesSem =
        selectedSemester === "ALL" || s.semester.toString() === selectedSemester;
      const matchesSearch =
        !subjectSearch.trim() ||
        s.subjectName.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.subjectCode.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.programName.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.sectionName.toLowerCase().includes(subjectSearch.toLowerCase());

      return matchesSem && matchesSearch;
    });
  }, [assignedSubjects, selectedSemester, subjectSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with Back Navigation & Call Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/faculty"
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs flex-shrink-0"
            title="Back to Faculty Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg">
                Short Name: {faculty.shortName}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                {faculty.employeeId}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  faculty.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {faculty.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {faculty.fullName}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {faculty.designation} • {faculty.departmentName}
            </p>
          </div>
        </div>

        {/* Direct Call & Contact Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {faculty.phone ? (
            <a
              href={`tel:${faculty.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition shadow-xs"
              title={`Call faculty on ${faculty.phone}`}
            >
              <Phone className="w-4 h-4" />
              <span>Call Faculty</span>
              <span className="font-mono text-[11px] opacity-80 hidden md:inline">
                ({faculty.phone})
              </span>
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>No Phone Listed</span>
            </button>
          )}

          {faculty.email && (
            <a
              href={`mailto:${faculty.email}`}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs"
              title={`Email faculty on ${faculty.email}`}
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Send Email</span>
            </a>
          )}
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === "profile"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Faculty Profile &amp; Details</span>
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === "subjects"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>Subjects Assigned</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600">
            {assignedSubjects.length}
          </span>
        </button>
      </div>

      {/* =======================================================================
          TAB 1: FACULTY PROFILE & DETAILS
          ======================================================================= */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Big Size Faculty Avatar / Photo Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-br from-purple-100 to-indigo-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center group mb-4">
                {faculty.avatarUrl ? (
                  <img
                    src={faculty.avatarUrl}
                    alt={faculty.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0B2545] text-white flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-wider">
                      {initials}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase mt-2 tracking-widest font-mono">
                      {faculty.shortName}
                    </span>
                  </div>
                )}
              </div>

              <h2 className="text-lg font-black text-slate-900">
                {faculty.fullName}
              </h2>
              <div className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl mt-1">
                Short Name: {faculty.shortName}
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                {faculty.designation}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {faculty.departmentName}
              </p>

              {/* Direct Call Button in Photo Card */}
              {faculty.phone && (
                <div className="w-full mt-5 pt-5 border-t border-slate-100">
                  <a
                    href={`tel:${faculty.phone}`}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 transition font-bold text-xs"
                  >
                    <Phone className="w-4 h-4 text-purple-600" />
                    <span>Dial {faculty.phone}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Academic Workload Overview
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Assigned Courses</span>
                <span className="font-bold text-slate-800 font-mono">{assignedSubjects.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Total Classes Conducted</span>
                <span className="font-bold text-emerald-700 font-mono">{totalSessionsAll} sessions</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Teaching Department</span>
                <span className="font-bold text-slate-800">{faculty.departmentName.replace("Department of ", "")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Profiles & Account */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Department & Designation */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                <Building className="w-4 h-4 text-purple-600" />
                <span>Departmental &amp; Institutional Authority</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Teaching Department</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{faculty.departmentName}</span>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Designation</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{faculty.designation}</span>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Highest Qualification</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{faculty.qualification || "Ph.D / M.Tech"}</span>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Institutional School</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{faculty.schoolName}</span>
                </div>
              </div>
            </div>

            {/* Login & Portal Access Details */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                <User className="w-4 h-4 text-blue-600" />
                <span>Portal Login Credentials</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Login Username (Short Name)</span>
                  <span className="text-xs font-mono font-bold text-purple-700 block mt-0.5">{faculty.username}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Faculty logs in using their short name.</p>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Employee Code</span>
                  <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{faculty.employeeId}</span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Contact Communications</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone Number</span>
                    <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{faculty.phone || "Not Provided"}</span>
                  </div>
                  {faculty.phone && (
                    <a
                      href={`tel:${faculty.phone}`}
                      className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition shadow-xs"
                      title="Direct dialpad phone call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Institutional Email</span>
                    <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{faculty.email || "—"}</span>
                  </div>
                  {faculty.email && (
                    <a
                      href={`mailto:${faculty.email}`}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                      title="Send email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: SUBJECTS ASSIGNED (WITH SEMESTER FILTERS)
          ======================================================================= */}
      {activeTab === "subjects" && (
        <div className="space-y-6">
          {/* Controls Bar: Semester Filter & Search */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Assigned Teaching Workload
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Course offerings, laboratory practicals, and sections assigned to {faculty.fullName}.
                </p>
              </div>

              {/* Semester Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Semester:
                </span>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Semesters</option>
                  {distinctSemesters.map((sem) => (
                    <option key={sem} value={sem.toString()}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by subject name, course code, program, or section..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Course Code &amp; Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Class Section</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4 text-center">Conducted Classes</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((sub) => (
                      <tr key={sub.assignmentId} className="hover:bg-purple-50/20 transition">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900">{sub.subjectName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {sub.subjectCode} • Short: {sub.subjectShortName}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.subjectType === "LAB"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {sub.subjectType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {sub.credits}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">
                            {sub.programName}
                          </span>
                          <span className="text-[11px] text-blue-600 font-semibold">
                            Section {sub.sectionName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">
                          Sem {sub.semester}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 text-xs">
                            {sub.sessionsConducted} sessions
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link
                            href={`/reports?sectionId=${sub.sectionId}&subjectId=${sub.subjectId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-xs"
                            title="View Attendance Register for this subject"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                            <span>View Register</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        No assigned subjects matching the chosen filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
