"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Layers,
  AlertCircle,
  Loader2,
  Check,
  Send,
} from "lucide-react";
import { AttendanceStatus, SessionType } from "@prisma/client";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import CustomModal from "@/components/ui/CustomModal";

interface StudentItem {
  enrollmentId: string;
  studentId: string;
  rollNumber: string;
  fullName: string;
  phone?: string | null;
  labBatches: string[];
}

interface AssignmentData {
  id: string;
  academicYearId: string;
  facultyId: string;
  facultyName: string;
  facultyShortName: string;
  subjectName: string;
  subjectCode: string;
  subjectType: string;
  programName: string;
  year: number;
  semester: number;
  sectionId: string;
  sectionName: string;
  labBatches: Array<{ id: string; name: string; batchNumber: number }>;
}

export default function AttendanceMarkerClient({
  assignment,
  initialStudents,
}: {
  assignment: AssignmentData;
  initialStudents: StudentItem[];
}) {
  const router = useRouter();

  // Session parameters with custom picker states
  const [sessionDate, setSessionDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.REGULAR);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [topicCovered, setTopicCovered] = useState<string>("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Student Attendance States map: studentId -> AttendanceStatus
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    for (const s of initialStudents) {
      initial[s.studentId] = AttendanceStatus.PRESENT;
    }
    return initial;
  });

  // UI state for modal & submission
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Filter students by selected batch (if applicable)
  const filteredByBatch = useMemo(() => {
    if (!selectedBatchId) return initialStudents;
    const batchObj = assignment.labBatches.find((b) => b.id === selectedBatchId);
    if (!batchObj) return initialStudents;
    return initialStudents.filter((s) => s.labBatches.includes(batchObj.name));
  }, [initialStudents, selectedBatchId, assignment.labBatches]);

  // Filter by search query
  const displayedStudents = useMemo(() => {
    if (!searchQuery.trim()) return filteredByBatch;
    const q = searchQuery.toLowerCase();
    return filteredByBatch.filter(
      (s) => s.rollNumber.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q)
    );
  }, [filteredByBatch, searchQuery]);

  // Toggle single student status
  const toggleStatus = (studentId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]:
        prev[studentId] === AttendanceStatus.PRESENT
          ? AttendanceStatus.ABSENT
          : AttendanceStatus.PRESENT,
    }));
  };

  // Bulk actions
  const markAll = (status: AttendanceStatus) => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      for (const s of filteredByBatch) {
        updated[s.studentId] = status;
      }
      return updated;
    });
  };

  // Metrics summary
  const totalInBatch = filteredByBatch.length;
  const presentCount = filteredByBatch.filter(
    (s) => attendanceMap[s.studentId] === AttendanceStatus.PRESENT
  ).length;
  const absentCount = totalInBatch - presentCount;
  const attendancePercentage =
    totalInBatch > 0 ? ((presentCount / totalInBatch) * 100).toFixed(1) : "0.0";

  // Submit attendance session
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const records = filteredByBatch.map((s) => ({
      studentId: s.studentId,
      status: attendanceMap[s.studentId] || AttendanceStatus.PRESENT,
    }));

    try {
      const res = await fetch("/api/attendance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYearId: assignment.academicYearId,
          assignmentId: assignment.id,
          sectionId: assignment.sectionId,
          facultyId: assignment.facultyId,
          labBatchId: selectedBatchId || null,
          sessionDate,
          periodNumber: Number(periodNumber),
          sessionType,
          topicCovered: topicCovered || null,
          records,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Failed to submit attendance session.");
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(data.message || "Attendance recorded successfully!");
      setTimeout(() => {
        router.push("/reports");
        router.refresh();
      }, 1500);
    } catch {
      setSubmitError("Network failure while submitting attendance.");
      setIsSubmitting(false);
    }
  };

  // Dropdown options
  const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
    value: String(num),
    label: `Period ${num}`,
  }));

  const sessionTypeOptions = [
    { value: "REGULAR", label: "Regular Lecture" },
    { value: "EXTRA", label: "Extra Class" },
    { value: "MAKEUP", label: "Makeup Class" },
    { value: "SUBSTITUTE", label: "Substitute Class" },
    { value: "LAB_PRACTICAL", label: "Lab Practical" },
  ];

  const batchOptions = [
    { value: "", label: "All Batches (Full Class)" },
    ...assignment.labBatches.map((b) => ({
      value: b.id,
      label: b.name,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Context Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {assignment.subjectType} • {assignment.subjectCode}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {assignment.programName}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {assignment.subjectName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
              <span>Class: <strong>Year {assignment.year} • Sem {assignment.semester}</strong></span>
              <span>•</span>
              <span>Section: <strong className="text-[#8B1528] font-bold">{assignment.sectionName}</strong></span>
              <span>•</span>
              <span>Faculty: <strong>{assignment.facultyName} ({assignment.facultyShortName})</strong></span>
            </div>
          </div>

          {/* Quick Metrics Bar (Responsive 2x2 on mobile, 4 columns on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
              <div className="text-lg font-black text-slate-900">{totalInBatch}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Present</div>
              <div className="text-lg font-black text-emerald-600">{presentCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-600 uppercase">Absent</div>
              <div className="text-lg font-black text-rose-600">{absentCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#0B2545] uppercase">Rate</div>
              <div className="text-lg font-black text-[#0B2545]">{attendancePercentage}%</div>
            </div>
          </div>
        </div>

        {/* Custom Form Controls: Custom Date Picker and Custom Dropdowns */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <CustomDatePicker
            label="Session Date"
            value={sessionDate}
            onChange={setSessionDate}
          />

          <CustomSelect
            label="Period Slot"
            options={periodOptions}
            value={String(periodNumber)}
            onChange={(val) => setPeriodNumber(Number(val))}
          />

          <CustomSelect
            label="Session Type"
            options={sessionTypeOptions}
            value={sessionType}
            onChange={(val) => setSessionType(val as SessionType)}
          />

          {assignment.labBatches.length > 0 && (
            <CustomSelect
              label="Lab Batch"
              options={batchOptions}
              value={selectedBatchId}
              onChange={setSelectedBatchId}
            />
          )}
        </div>
      </div>

      {/* Toolbar: Search, Filters & Bulk Actions */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Roll No or Student Name..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
          />
        </div>

        {/* Global Batch Buttons & Submit Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => markAll(AttendanceStatus.PRESENT)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition"
          >
            [ ALL PRESENT ]
          </button>

          <button
            type="button"
            onClick={() => markAll(AttendanceStatus.ABSENT)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition"
          >
            [ ALL ABSENT ]
          </button>

          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="px-5 py-2 bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>REVIEW & SUBMIT</span>
          </button>
        </div>
      </div>

      {/* Student Cards Grid (Exact Design Specification from Prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedStudents.map((student) => {
          const isPresent = attendanceMap[student.studentId] === AttendanceStatus.PRESENT;

          return (
            <div
              key={student.studentId}
              onClick={() => toggleStatus(student.studentId)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all duration-150 select-none flex flex-col justify-between ${
                isPresent
                  ? "bg-white border-slate-200 shadow-sm hover:border-emerald-300"
                  : "bg-rose-50/40 border-rose-200 shadow-sm hover:border-rose-300"
              }`}
            >
              <div>
                {/* Roll Number (Prominent High Contrast) */}
                <div className="text-base font-black text-slate-900 tracking-tight">
                  {student.rollNumber}
                </div>

                {/* Student Name */}
                <div className="text-xs font-extrabold text-slate-800 mt-1 uppercase tracking-wide">
                  {student.fullName}
                </div>

                {/* Section Tag */}
                <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                    {assignment.sectionName}
                  </span>
                  {student.labBatches.length > 0 && (
                    <span className="text-slate-400 text-[10px]">
                      {student.labBatches.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Toggle Indicator Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Status</span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide border transition-all ${
                    isPresent
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPresent ? "bg-emerald-500" : "bg-rose-600"
                    }`}
                  ></span>
                  {isPresent ? "PRESENT" : "ABSENT"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {displayedStudents.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-semibold">No students found matching your search filter.</p>
        </div>
      )}

      {/* Custom Review & Final Submission Confirmation Modal */}
      <CustomModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Confirm Attendance Submission"
        description="Please review the attendance summary before final submission. This session will be recorded in the official audit trail."
        confirmText="CONFIRM & SUBMIT"
        cancelText="Back to Editing"
        onConfirm={handleSubmit}
        isLoading={isSubmitting}
        type="info"
      >
        <div className="space-y-3">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-start gap-2">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitSuccess}</span>
            </div>
          )}

          <div className="space-y-2 bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Subject:</span>
              <span className="font-bold text-slate-900">{assignment.subjectName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Class / Section:</span>
              <span className="font-bold text-slate-900">{assignment.programName} ({assignment.sectionName})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Session Date & Slot:</span>
              <span className="font-bold text-slate-900">{sessionDate} (Period {periodNumber})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Faculty Conducting:</span>
              <span className="font-bold text-slate-900">{assignment.facultyName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Total Students:</span>
              <span className="font-black text-slate-900">{totalInBatch}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Present Count:</span>
              <span className="font-black text-emerald-600">{presentCount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Absent Count:</span>
              <span className="font-black text-rose-600">{absentCount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Attendance Rate:</span>
              <span className="font-black text-[#0B2545]">{attendancePercentage}%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Topic Covered / Syllabus Notes (Optional)
            </label>
            <textarea
              value={topicCovered}
              onChange={(e) => setTopicCovered(e.target.value)}
              placeholder="e.g. Unit 2: Linear Differential Equations with Constant Coefficients"
              rows={2}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none"
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
