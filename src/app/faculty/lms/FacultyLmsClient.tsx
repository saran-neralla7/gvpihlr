"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  UploadCloud,
  HelpCircle,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  AlertTriangle,
  Loader2,
  Layers,
  ChevronRight,
  ExternalLink,
  Award,
  Filter,
  X,
} from "lucide-react";
import CustomModal from "@/components/ui/CustomModal";

interface AssignmentOption {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectShortName: string;
  credits: number;
  type: string;
  syllabus?: string | null;
  sectionId: string;
  sectionName: string;
  programName: string;
  year: number;
  semester: number;
  facultyName: string;
}

export default function FacultyLmsClient({ assignments }: { assignments: AssignmentOption[] }) {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || ""
  );
  const [activeTab, setActiveTab] = useState<"lecture_plan" | "materials" | "questions" | "quizzes">(
    "lecture_plan"
  );

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  // 1. LECTURE PLAN STATE
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTopicUnit, setNewTopicUnit] = useState(1);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicSequence, setNewTopicSequence] = useState(1);
  const [newTopicPlannedDate, setNewTopicPlannedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newTopicMode, setNewTopicMode] = useState("Chalk & Talk");
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  // 2. MATERIALS STATE (OPTION A)
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [newMaterialUnit, setNewMaterialUnit] = useState(1);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialType, setNewMaterialType] = useState("LECTURE_NOTES_PDF");
  const [newMaterialDescription, setNewMaterialDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

  // 3. QUESTION BANK STATE
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");
  const [filterUnit, setFilterUnit] = useState<number | "ALL">("ALL");
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [qUnit, setQUnit] = useState(1);
  const [qDifficulty, setQDifficulty] = useState("MEDIUM");
  const [qText, setQText] = useState("");
  const [qOptionA, setQOptionA] = useState("");
  const [qOptionB, setQOptionB] = useState("");
  const [qOptionC, setQOptionC] = useState("");
  const [qOptionD, setQOptionD] = useState("");
  const [qCorrectOpt, setQCorrectOpt] = useState(0);
  const [qExplanation, setQExplanation] = useState("");
  const [qBlooms, setQBlooms] = useState("Understand");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // 4. QUIZZES STATE
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizUnit, setQuizUnit] = useState(1);
  const [quizDuration, setQuizDuration] = useState(20);
  const [quizStartTime, setQuizStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [quizEndTime, setQuizEndTime] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [viewingQuizAttempts, setViewingQuizAttempts] = useState<any | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotify = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch data on assignment change
  useEffect(() => {
    if (!selectedAssignmentId) return;

    // Load topics
    setIsLoadingTopics(true);
    fetch(`/api/lms/lecture-plan?assignmentId=${selectedAssignmentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTopics(data.topics);
      })
      .finally(() => setIsLoadingTopics(false));

    // Load materials
    setIsLoadingMaterials(true);
    fetch(`/api/lms/materials?assignmentId=${selectedAssignmentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMaterials(data.materials);
      })
      .finally(() => setIsLoadingMaterials(false));

    // Load quizzes
    setIsLoadingQuizzes(true);
    fetch(`/api/lms/quizzes?assignmentId=${selectedAssignmentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuizzes(data.quizzes);
      })
      .finally(() => setIsLoadingQuizzes(false));
  }, [selectedAssignmentId]);

  // Load questions when assignment subject changes
  useEffect(() => {
    if (!selectedAssignment?.subjectId) return;
    setIsLoadingQuestions(true);
    fetch(`/api/lms/questions?subjectId=${selectedAssignment.subjectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuestions(data.questions);
      })
      .finally(() => setIsLoadingQuestions(false));
  }, [selectedAssignment?.subjectId]);

  // --- TOPIC ACTIONS ---
  const handleToggleTopicStatus = async (topicId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PLANNED" : "COMPLETED";
    try {
      const res = await fetch("/api/lms/lecture-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: topicId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTopics((prev) => prev.map((t) => (t.id === topicId ? data.topic : t)));
        showNotify("success", `Topic marked as ${nextStatus.toLowerCase()}`);
      }
    } catch {
      showNotify("error", "Failed to update topic status");
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    setIsSubmittingTopic(true);
    try {
      const res = await fetch("/api/lms/lecture-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignmentId,
          unitNumber: newTopicUnit,
          topicSequence: newTopicSequence,
          topicTitle: newTopicTitle.trim(),
          plannedDate: newTopicPlannedDate,
          deliveryMode: newTopicMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTopics((prev) => [...prev, data.topic]);
        setIsAddTopicModalOpen(false);
        setNewTopicTitle("");
        setNewTopicSequence((prev) => prev + 1);
        showNotify("success", "Lecture topic added successfully");
      }
    } catch {
      showNotify("error", "Failed to add lecture topic");
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Are you sure you want to remove this lecture topic?")) return;
    try {
      const res = await fetch(`/api/lms/lecture-plan?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTopics((prev) => prev.filter((t) => t.id !== id));
        showNotify("success", "Topic removed");
      }
    } catch {
      showNotify("error", "Failed to delete topic");
    }
  };

  // --- MATERIAL UPLOAD ACTIONS (OPTION A) ---
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newMaterialTitle.trim()) {
      showNotify("error", "Please provide a document title and file");
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const fd = new FormData();
      fd.append("assignmentId", selectedAssignmentId);
      fd.append("unitNumber", String(newMaterialUnit));
      fd.append("title", newMaterialTitle.trim());
      fd.append("type", newMaterialType);
      fd.append("description", newMaterialDescription);
      fd.append("file", selectedFile);

      const res = await fetch("/api/lms/materials", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setMaterials((prev) => [data.material, ...prev]);
        setIsAddMaterialModalOpen(false);
        setNewMaterialTitle("");
        setNewMaterialDescription("");
        setSelectedFile(null);
        showNotify("success", "Course material uploaded to server storage successfully!");
      } else {
        showNotify("error", data.error || "Upload failed");
      }
    } catch {
      showNotify("error", "Error uploading file to storage");
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Delete this material? File will be removed from server storage.")) return;
    try {
      const res = await fetch(`/api/lms/materials?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
        showNotify("success", "Material deleted from disk and database");
      }
    } catch {
      showNotify("error", "Failed to delete material");
    }
  };

  // --- QUESTION BANK ACTIONS ---
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qOptionA.trim() || !qOptionB.trim()) {
      showNotify("error", "Please provide question text and at least 2 options");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const optionsArray = [qOptionA.trim(), qOptionB.trim()];
      if (qOptionC.trim()) optionsArray.push(qOptionC.trim());
      if (qOptionD.trim()) optionsArray.push(qOptionD.trim());

      const res = await fetch("/api/lms/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedAssignment.subjectId,
          assignmentId: selectedAssignmentId,
          unitNumber: qUnit,
          difficulty: qDifficulty,
          type: "MCQ",
          questionText: qText.trim(),
          options: optionsArray,
          correctOption: qCorrectOpt,
          explanation: qExplanation.trim(),
          bloomsLevel: qBlooms,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => [data.question, ...prev]);
        setIsAddQuestionModalOpen(false);
        setQText("");
        setQOptionA("");
        setQOptionB("");
        setQOptionC("");
        setQOptionD("");
        setQExplanation("");
        showNotify("success", "Question added to Question Bank");
      }
    } catch {
      showNotify("error", "Failed to add question");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Remove this question from the Question Bank?")) return;
    try {
      const res = await fetch(`/api/lms/questions?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        showNotify("success", "Question removed");
      }
    } catch {
      showNotify("error", "Failed to delete question");
    }
  };

  // --- QUIZ ACTIONS ---
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || selectedQuestionIds.length === 0) {
      showNotify("error", "Please give a quiz title and select at least 1 question");
      return;
    }

    setIsSubmittingQuiz(true);
    try {
      const res = await fetch("/api/lms/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignmentId,
          title: quizTitle.trim(),
          unitNumber: quizUnit,
          durationMinutes: quizDuration,
          totalMarks: selectedQuestionIds.length,
          startTime: quizStartTime,
          endTime: quizEndTime,
          isPublished: true,
          questionIds: selectedQuestionIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) => [data.quiz, ...prev]);
        setIsCreateQuizModalOpen(false);
        setQuizTitle("");
        setSelectedQuestionIds([]);
        showNotify("success", "Section quiz created and published!");
      }
    } catch {
      showNotify("error", "Failed to create quiz");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleTogglePublishQuiz = async (id: string, currentPublished: boolean) => {
    try {
      const res = await fetch("/api/lms/quizzes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublished: !currentPublished }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === id ? { ...q, isPublished: !currentPublished } : q))
        );
        showNotify("success", `Quiz ${!currentPublished ? "Published" : "Set to Draft"}`);
      }
    } catch {
      showNotify("error", "Failed to update quiz status");
    }
  };

  // Completion calculation
  const totalTopicsCount = topics.length;
  const completedTopicsCount = topics.filter((t) => t.status === "COMPLETED").length;
  const overallCompletionRate =
    totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    if (filterDifficulty !== "ALL" && q.difficulty !== filterDifficulty) return false;
    if (filterUnit !== "ALL" && q.unitNumber !== filterUnit) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B2545] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>GVPIHLR Learning Management System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Faculty LMS Course Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unit-wise lecture planning, courseware upload, Question Bank curation, and section quizzes.
          </p>
        </div>

        {/* Section & Subject Selector */}
        <div className="w-full md:w-auto min-w-[320px]">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Assigned Class &amp; Course
          </label>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="w-full text-xs font-bold bg-blue-50/70 border border-blue-200 rounded-xl px-3 py-2.5 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                Sec {a.sectionName} — {a.subjectCode} ({a.subjectShortName}) • {a.programName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected Course Metadata Pill & Progress Speedometer */}
      {selectedAssignment && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#0B2545] text-white">
              {selectedAssignment.subjectCode}
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {selectedAssignment.subjectName}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedAssignment.programName} • Year {selectedAssignment.year} Sem {selectedAssignment.semester} (Section {selectedAssignment.sectionName}) • {selectedAssignment.credits} Credits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:w-48">
              <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                <span className="text-slate-600">Syllabus Covered</span>
                <span className="text-blue-600">{overallCompletionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${overallCompletionRate}%` }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-black text-slate-900 block">
                {completedTopicsCount} / {totalTopicsCount}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Topics Delivered</span>
            </div>
          </div>
        </div>
      )}

      {/* 4 Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("lecture_plan")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
            activeTab === "lecture_plan"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Lecture Plan</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {topics.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
            activeTab === "materials"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Course Materials (Option A)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {materials.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
            activeTab === "questions"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Question Bank</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {questions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("quizzes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
            activeTab === "quizzes"
              ? "bg-[#0B2545] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Section Quizzes</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {quizzes.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: LECTURE PLAN (TOPICS TRACKER)
          ========================================================================= */}
      {activeTab === "lecture_plan" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Unit-Wise Delivery Plan</h3>
              <p className="text-xs text-slate-500">Track and mark completion for scheduled syllabus topics.</p>
            </div>
            <button
              onClick={() => setIsAddTopicModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lecture Topic</span>
            </button>
          </div>

          {/* Unit Buckets */}
          {[1, 2, 3, 4, 5].map((u) => {
            const unitTopics = topics.filter((t) => t.unitNumber === u);
            const unitDone = unitTopics.filter((t) => t.status === "COMPLETED").length;
            const pct = unitTopics.length > 0 ? Math.round((unitDone / unitTopics.length) * 100) : 0;

            return (
              <div key={u} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs">
                      UNIT {u}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {unitTopics.length} Topics Planned
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">
                      {unitDone}/{unitTopics.length} Completed ({pct}%)
                    </span>
                    <div className="w-24 bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>

                {unitTopics.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No topics planned for Unit {u} yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {unitTopics.map((topic) => {
                      const isCompleted = topic.status === "COMPLETED";
                      return (
                        <div
                          key={topic.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 px-2 rounded-xl transition"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleTopicStatus(topic.id, topic.status)}
                              className={`mt-0.5 p-1 rounded-lg transition ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-400 hover:text-slate-600"
                              }`}
                              title={isCompleted ? "Mark Planned" : "Mark Completed"}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-400">
                                  #{topic.topicSequence}
                                </span>
                                <h4
                                  className={`text-xs font-bold ${
                                    isCompleted ? "text-slate-500 line-through" : "text-slate-900"
                                  }`}
                                >
                                  {topic.topicTitle}
                                </h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                  {topic.deliveryMode || "Chalk & Talk"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                                <span>Planned: {new Date(topic.plannedDate).toLocaleDateString("en-IN")}</span>
                                {topic.actualDate && (
                                  <span className="text-emerald-600 font-semibold">
                                    Delivered: {new Date(topic.actualDate).toLocaleDateString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => handleToggleTopicStatus(topic.id, topic.status)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {isCompleted ? "Completed ✓" : "Mark Done"}
                            </button>
                            <button
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete Topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          TAB 2: COURSE MATERIALS (OPTION A STORAGE)
          ========================================================================= */}
      {activeTab === "materials" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Course Materials &amp; Lecture Notes</h3>
              <p className="text-xs text-slate-500">
                Uploaded files are saved to server storage (<code>public/uploads/materials/</code>) and stream directly to student devices.
              </p>
            </div>
            <button
              onClick={() => setIsAddMaterialModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document (Option A)</span>
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center">
              <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No Course Materials Uploaded Yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload lecture notes, formula sheets, and slide presentations for Units 1 to 5.
              </p>
              <button
                onClick={() => setIsAddMaterialModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
              >
                Upload First PDF
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Document Title</th>
                      <th className="px-3 py-3">Unit</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Size</th>
                      <th className="px-3 py-3 text-center">Student Views</th>
                      <th className="px-3 py-3 text-center">Downloads</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materials.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{m.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                                {m.fileName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                            Unit {m.unitNumber}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-600 font-medium">
                          {m.type.replace(/_/g, " ")}
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-500">
                          {m.fileSize ? `${Math.round(m.fileSize / 1024)} KB` : "—"}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-blue-600">
                          {m.viewCount || 0}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-600">
                          {m.downloadCount || 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Preview PDF in New Tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteMaterial(m.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Delete from Storage"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: QUESTION BANK (EASY / MEDIUM / HARD)
          ========================================================================= */}
      {activeTab === "questions" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Course Question Bank</h3>
              <p className="text-xs text-slate-500">
                Curate assessment items categorized by Unit, Bloom's Taxonomy, and Difficulty level.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">Difficulty:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                {["ALL", "EASY", "MEDIUM", "HARD"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDifficulty(d)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                      filterDifficulty === d
                        ? d === "EASY"
                          ? "bg-emerald-600 text-white"
                          : d === "MEDIUM"
                          ? "bg-amber-600 text-white"
                          : d === "HARD"
                          ? "bg-rose-600 text-white"
                          : "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Unit:</span>
              <select
                value={filterUnit}
                onChange={(e) =>
                  setFilterUnit(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
                }
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
              >
                <option value="ALL">All Units</option>
                {[1, 2, 3, 4, 5].map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions Grid */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No questions found matching your filter criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        Unit {q.unitNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          q.difficulty === "EASY"
                            ? "bg-emerald-50 text-emerald-700"
                            : q.difficulty === "MEDIUM"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {q.bloomsLevel || "Understand"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-900 leading-relaxed">{q.questionText}</p>

                  {/* Options */}
                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isCorrect = q.correctOption === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="font-mono text-[10px] font-bold uppercase w-4">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: SECTION QUIZZES
          ========================================================================= */}
      {activeTab === "quizzes" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Section CBT Quizzes</h3>
              <p className="text-xs text-slate-500">
                Author and publish timed computer-based tests with automated grading and anti-cheat tracking.
              </p>
            </div>
            <button
              onClick={() => setIsCreateQuizModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No quizzes created for this section yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => {
                const totalAttempts = quiz.attempts?.length || 0;
                return (
                  <div
                    key={quiz.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          Unit {quiz.unitNumber || "All"}
                        </span>
                        <button
                          onClick={() => handleTogglePublishQuiz(quiz.id, quiz.isPublished)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition ${
                            quiz.isPublished
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {quiz.isPublished ? "PUBLISHED" : "DRAFT"}
                        </button>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 mt-2">{quiz.title}</h4>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3 font-semibold">
                        <span>{quiz.durationMinutes} Mins Duration</span>
                        <span>•</span>
                        <span>{quiz.totalMarks} Marks</span>
                        <span>•</span>
                        <span>{quiz.questions?.length || 0} Questions</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        <strong>{totalAttempts}</strong> Student Attempts
                      </span>
                      <button
                        onClick={() => setViewingQuizAttempts(quiz)}
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        <span>View Results</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD LECTURE TOPIC
          ========================================================================= */}
      <CustomModal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        title="Add Lecture Plan Topic"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit Number</label>
              <select
                value={newTopicUnit}
                onChange={(e) => setNewTopicUnit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
              >
                {[1, 2, 3, 4, 5].map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sequence #</label>
              <input
                type="number"
                value={newTopicSequence}
                onChange={(e) => setNewTopicSequence(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Topic Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Eigenvalues and Cayley-Hamilton Theorem"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Planned Date *</label>
              <input
                type="date"
                required
                value={newTopicPlannedDate}
                onChange={(e) => setNewTopicPlannedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Delivery Mode</label>
              <select
                value={newTopicMode}
                onChange={(e) => setNewTopicMode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
              >
                <option value="Chalk & Talk">Chalk &amp; Talk</option>
                <option value="Presentation / Slides">Presentation / Slides</option>
                <option value="Lab Demonstration">Lab Demonstration</option>
                <option value="Interactive Discussion">Interactive Discussion</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddTopicModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingTopic}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5"
            >
              {isSubmittingTopic && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Topic</span>
            </button>
          </div>
        </form>
      </CustomModal>

      {/* =========================================================================
          MODAL 2: UPLOAD COURSE MATERIAL (OPTION A STORAGE)
          ========================================================================= */}
      <CustomModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        title="Upload Course Material (Option A Storage)"
      >
        <form onSubmit={handleUploadMaterial} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit Number</label>
              <select
                value={newMaterialUnit}
                onChange={(e) => setNewMaterialUnit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
              >
                {[1, 2, 3, 4, 5].map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Material Type</label>
              <select
                value={newMaterialType}
                onChange={(e) => setNewMaterialType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
              >
                <option value="LECTURE_NOTES_PDF">Lecture Notes (PDF)</option>
                <option value="SLIDES_PPT">Slides (PPT / PDF)</option>
                <option value="SYLLABUS_COPY">Syllabus Copy</option>
                <option value="FORMULA_SHEET">Formula Sheet</option>
                <option value="REFERENCE_LINK">Reference Document</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit-1 Differential Calculus Complete Handout"
              value={newMaterialTitle}
              onChange={(e) => setNewMaterialTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Brief Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Key concepts covered in this reading material..."
              value={newMaterialDescription}
              onChange={(e) => setNewMaterialDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Select File (PDF, PPT, DOCX) *</label>
            <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 rounded-2xl p-6 text-center transition">
              <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <input
                type="file"
                required
                accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.png,.jpg"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              />
              {selectedFile && (
                <div className="mt-2 text-xs font-bold text-indigo-900">
                  Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddMaterialModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploadingMaterial || !selectedFile}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5"
            >
              {isUploadingMaterial ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Option A Storage...</span>
                </>
              ) : (
                <span>Upload to Server</span>
              )}
            </button>
          </div>
        </form>
      </CustomModal>

      {/* =========================================================================
          MODAL 3: ADD QUESTION TO QUESTION BANK
          ========================================================================= */}
      <CustomModal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        title="Add Question to Question Bank"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit</label>
              <select
                value={qUnit}
                onChange={(e) => setQUnit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
              >
                {[1, 2, 3, 4, 5].map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Difficulty</label>
              <select
                value={qDifficulty}
                onChange={(e) => setQDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bloom&apos;s Level</label>
              <select
                value={qBlooms}
                onChange={(e) => setQBlooms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
              >
                <option value="Remember">Remember</option>
                <option value="Understand">Understand</option>
                <option value="Apply">Apply</option>
                <option value="Analyze">Analyze</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Question Text *</label>
            <textarea
              required
              rows={3}
              placeholder="Type question stem..."
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">Multiple Choice Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Option A *"
                value={qOptionA}
                onChange={(e) => setQOptionA(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <input
                type="text"
                required
                placeholder="Option B *"
                value={qOptionB}
                onChange={(e) => setQOptionB(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <input
                type="text"
                placeholder="Option C"
                value={qOptionC}
                onChange={(e) => setQOptionC(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <input
                type="text"
                placeholder="Option D"
                value={qOptionD}
                onChange={(e) => setQOptionD(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Correct Option *</label>
            <div className="grid grid-cols-4 gap-2">
              {["Option A", "Option B", "Option C", "Option D"].map((optLabel, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setQCorrectOpt(idx)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    qCorrectOpt === idx
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {optLabel}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Explanation (Revealed in Practice Mode)</label>
            <textarea
              rows={2}
              placeholder="Step-by-step mathematical or scientific derivation..."
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddQuestionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuestion}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              Save Question
            </button>
          </div>
        </form>
      </CustomModal>

      {/* =========================================================================
          MODAL 4: CREATE SECTION QUIZ
          ========================================================================= */}
      <CustomModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
        title="Create Section CBT Quiz"
      >
        <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Quiz Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit-1 CBT Practice Assessment"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit Focus</label>
              <select
                value={quizUnit}
                onChange={(e) => setQuizUnit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
              >
                {[1, 2, 3, 4, 5].map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={quizDuration}
                onChange={(e) => setQuizDuration(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Available From *</label>
              <input
                type="datetime-local"
                required
                value={quizStartTime}
                onChange={(e) => setQuizStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Deadline / End Time *</label>
              <input
                type="datetime-local"
                required
                value={quizEndTime}
                onChange={(e) => setQuizEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Select Questions from Bank ({selectedQuestionIds.length} selected)</label>
              <button
                type="button"
                onClick={() => setSelectedQuestionIds(questions.map((q) => q.id))}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                Select All
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-2 bg-slate-50">
              {questions.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No questions in question bank to select from.</p>
              ) : (
                questions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200/80 cursor-pointer text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestionIds((prev) => [...prev, q.id]);
                          } else {
                            setSelectedQuestionIds((prev) => prev.filter((id) => id !== q.id));
                          }
                        }}
                        className="mt-0.5"
                      />
                      <span className="flex-1 font-medium text-slate-800 line-clamp-2">
                        [Unit {q.unitNumber} - {q.difficulty}] {q.questionText}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateQuizModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuiz || selectedQuestionIds.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              Publish Quiz
            </button>
          </div>
        </form>
      </CustomModal>

      {/* =========================================================================
          MODAL 5: VIEW QUIZ ATTEMPTS & ANTI-CHEAT FLAGS
          ========================================================================= */}
      {viewingQuizAttempts && (
        <CustomModal
          isOpen={!!viewingQuizAttempts}
          onClose={() => setViewingQuizAttempts(null)}
          title={`Results: ${viewingQuizAttempts.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-semibold border-b pb-2">
              <span>Total Submissions: {viewingQuizAttempts.attempts?.length || 0}</span>
              <span>Total Marks: {viewingQuizAttempts.totalMarks}</span>
            </div>

            {(!viewingQuizAttempts.attempts || viewingQuizAttempts.attempts.length === 0) ? (
              <p className="text-center py-8 text-slate-400">No student submissions recorded yet.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {viewingQuizAttempts.attempts.map((att: any) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {att.student?.rollNumber || "Roll No"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Submitted: {new Date(att.completedAt).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {att.tabSwitchCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{att.tabSwitchCount} Tab Switches</span>
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 font-black text-xs">
                        {att.score} / {viewingQuizAttempts.totalMarks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CustomModal>
      )}
    </div>
  );
}
