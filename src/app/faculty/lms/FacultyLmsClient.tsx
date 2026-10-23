"use client";

import { useState, useEffect, useMemo } from "react";
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
  ArrowLeft,
  Search,
  Paperclip,
  CheckCircle,
  GraduationCap,
  Sparkles,
  BarChart3,
  Calendar,
  Users,
  FileSpreadsheet,
  Video,
  Play,
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
  coFaculty?: string[];
}

export default function FacultyLmsClient({ assignments }: { assignments: AssignmentOption[] }) {
  // Navigation State: null = Courses Grid view, string = Studio View for that course
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseFilterProgram, setCourseFilterProgram] = useState("ALL");

  const [activeTab, setActiveTab] = useState<"lecture_plan" | "materials" | "questions" | "quizzes">(
    "lecture_plan"
  );

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId) || null;

  // Extract unique programs for course cards filter
  const uniquePrograms = useMemo(() => {
    return Array.from(new Set(assignments.map((a) => a.programName)));
  }, [assignments]);

  // Filtered assignments for the cards shelf
  const filteredCourses = useMemo(() => {
    return assignments.filter((a) => {
      const matchProg = courseFilterProgram === "ALL" || a.programName === courseFilterProgram;
      const matchSearch =
        courseSearch === "" ||
        a.subjectName.toLowerCase().includes(courseSearch.toLowerCase()) ||
        a.subjectCode.toLowerCase().includes(courseSearch.toLowerCase()) ||
        a.sectionName.toLowerCase().includes(courseSearch.toLowerCase());
      return matchProg && matchSearch;
    });
  }, [assignments, courseFilterProgram, courseSearch]);

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

  // 2. MATERIALS STATE (OPTION A) - Multiple uploads per topic & unit
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [newMaterialUnit, setNewMaterialUnit] = useState(1);
  const [newMaterialTopicId, setNewMaterialTopicId] = useState<string>("");
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialType, setNewMaterialType] = useState("LECTURE_NOTES_PDF");
  const [newMaterialUrl, setNewMaterialUrl] = useState("");
  const [newMaterialDescription, setNewMaterialDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

  // Syllabus / Lecture Plan PDF Upload State (strict 5MB limit)
  const [isUploadSyllabusModalOpen, setIsUploadSyllabusModalOpen] = useState(false);
  const [syllabusCategory, setSyllabusCategory] = useState<"COMBINED" | "LECTURE_PLAN" | "SYLLABUS_COPY">("COMBINED");
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusTitle, setSyllabusTitle] = useState("Official Course Syllabus & Lecture Plan");
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState(false);

  // Styled In-App Confirmation Dialog State (Replaces native browser popups)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // 3. QUESTION BANK STATE (Difficulty levels Easy/Medium/Hard, types, marks)
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");
  const [filterUnit, setFilterUnit] = useState<number | "ALL">("ALL");
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [qUnit, setQUnit] = useState(1);
  const [qDifficulty, setQDifficulty] = useState("MEDIUM");
  const [qType, setQType] = useState("MCQ");
  const [qMarks, setQMarks] = useState(1);
  const [qText, setQText] = useState("");
  const [qOptionA, setQOptionA] = useState("");
  const [qOptionB, setQOptionB] = useState("");
  const [qOptionC, setQOptionC] = useState("");
  const [qOptionD, setQOptionD] = useState("");
  const [qCorrectOpt, setQCorrectOpt] = useState(0);
  const [qExplanation, setQExplanation] = useState("");
  const [qBlooms, setQBlooms] = useState("Understand");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Excel Question Bank Import State
  const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);
  const [importExcelFile, setImportExcelFile] = useState<File | null>(null);
  const [isImportingExcel, setIsImportingExcel] = useState(false);

  // 4. QUIZZES STATE (Many quizzes allowed per course, customizable marks and duration)
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizUnit, setQuizUnit] = useState<number | null>(1);
  const [quizDuration, setQuizDuration] = useState(20);
  const [quizTotalMarks, setQuizTotalMarks] = useState(10);
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

  // Fetch data when an assignment is selected
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

  const reloadQuestions = () => {
    if (!selectedAssignment?.subjectId) return;
    setIsLoadingQuestions(true);
    fetch(`/api/lms/questions?subjectId=${selectedAssignment.subjectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuestions(data.questions);
      })
      .finally(() => setIsLoadingQuestions(false));
  };

  // Load questions when assignment subject changes
  useEffect(() => {
    reloadQuestions();
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

  const handleDeleteTopic = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Lecture Topic?",
      description: "Are you sure you want to remove this topic from the lecture schedule? This action cannot be undone.",
      confirmText: "Delete Topic",
      type: "danger",
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          const res = await fetch(`/api/lms/lecture-plan?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            setTopics((prev) => prev.filter((t) => t.id !== id));
            showNotify("success", "Topic removed from lecture schedule");
          } else {
            showNotify("error", data.error || "Failed to remove topic");
          }
        } catch {
          showNotify("error", "Failed to delete topic");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  // Open Add Material for a specific Topic or Unit
  const handleOpenAddMaterialModal = (unitNum: number, topicId?: string) => {
    setNewMaterialUnit(unitNum);
    setNewMaterialTopicId(topicId || "");
    setNewMaterialTitle("");
    setNewMaterialDescription("");
    setNewMaterialUrl("");
    setSelectedFile(null);
    setIsAddMaterialModalOpen(true);
  };

  // --- MATERIAL UPLOAD ACTIONS (OPTION A - MULTIPLE FILES PER TOPIC & VIDEO LINKS) ---
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const isLinkType = newMaterialType === "VIDEO_LECTURE" || newMaterialType === "REFERENCE_LINK";

    if (!newMaterialTitle.trim() || !selectedAssignmentId) {
      showNotify("error", "Please provide a material title");
      return;
    }

    if (!isLinkType && !selectedFile) {
      showNotify("error", "Please select a file to upload");
      return;
    }

    if (isLinkType && !newMaterialUrl.trim() && !selectedFile) {
      showNotify("error", "Please provide a valid video lecture or resource link");
      return;
    }

    // STRICT 5MB VALIDATION
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      showNotify("error", `File exceeds the 5MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB). Please select a file under 5MB.`);
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const fd = new FormData();
      fd.append("assignmentId", selectedAssignmentId);
      fd.append("unitNumber", String(newMaterialUnit));
      if (newMaterialTopicId) {
        fd.append("topicId", newMaterialTopicId);
      }
      fd.append("title", newMaterialTitle.trim());
      fd.append("type", newMaterialType);
      fd.append("description", newMaterialDescription);
      if (selectedFile) {
        fd.append("file", selectedFile);
      }
      if (newMaterialUrl.trim()) {
        fd.append("videoUrl", newMaterialUrl.trim());
      }

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
        setNewMaterialUrl("");
        setNewMaterialTopicId("");
        setSelectedFile(null);
        showNotify("success", isLinkType ? "Video lecture link added successfully!" : "Course material file uploaded successfully!");
      } else {
        showNotify("error", data.error || "Failed to upload material");
      }
    } catch {
      showNotify("error", "Server error while saving material");
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  // --- OFFICIAL SYLLABUS & LECTURE PLAN PDF UPLOAD (STRICT 5MB) ---
  const handleUploadSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusFile || !selectedAssignmentId) {
      showNotify("error", "Please select a PDF document");
      return;
    }
    if (syllabusFile.size > 5 * 1024 * 1024) {
      showNotify("error", `File exceeds 5MB limit (${(syllabusFile.size / (1024 * 1024)).toFixed(2)} MB)`);
      return;
    }

    setIsUploadingSyllabus(true);
    try {
      const fd = new FormData();
      fd.append("assignmentId", selectedAssignmentId);
      fd.append("unitNumber", "1");
      const computedTitle =
        syllabusTitle.trim() ||
        (syllabusCategory === "LECTURE_PLAN"
          ? "Institutional Course Lecture Plan"
          : syllabusCategory === "SYLLABUS_COPY"
          ? "Official Course Syllabus Copy"
          : "Official Course Syllabus & Lecture Plan");
      fd.append("title", computedTitle);
      fd.append("type", "SYLLABUS_COPY");
      fd.append("description", `Institutional ${computedTitle} for student reference`);
      fd.append("file", syllabusFile);

      const res = await fetch("/api/lms/materials", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setMaterials((prev) => [data.material, ...prev]);
        setIsUploadSyllabusModalOpen(false);
        setSyllabusFile(null);
        showNotify("success", "Institutional document uploaded successfully!");
      } else {
        showNotify("error", data.error || "Failed to upload document");
      }
    } catch {
      showNotify("error", "Error uploading document");
    } finally {
      setIsUploadingSyllabus(false);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Course Material?",
      description: "Are you sure you want to delete this file/link from server storage? This cannot be undone.",
      confirmText: "Delete File",
      type: "danger",
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          const res = await fetch(`/api/lms/materials?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            setMaterials((prev) => prev.filter((m) => m.id !== id));
            showNotify("success", "Material removed successfully");
          } else {
            showNotify("error", data.error || "Failed to delete material");
          }
        } catch {
          showNotify("error", "Failed to delete material");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  // --- QUESTION BANK ACTIONS ---
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !selectedAssignment) return;
    setIsSubmittingQuestion(true);

    try {
      const optionsArray =
        qType === "MCQ" ? [qOptionA.trim(), qOptionB.trim(), qOptionC.trim(), qOptionD.trim()] : [];

      const res = await fetch("/api/lms/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedAssignment.subjectId,
          assignmentId: selectedAssignmentId,
          unitNumber: qUnit,
          difficulty: qDifficulty,
          type: qType,
          marks: qMarks,
          questionText: qText.trim(),
          options: optionsArray,
          correctOption: qType === "MCQ" ? qCorrectOpt : null,
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
        showNotify("success", "Question added to course question bank!");
      } else {
        showNotify("error", data.error || "Failed to create question");
      }
    } catch {
      showNotify("error", "Server error saving question");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Question from Bank?",
      description: "Are you sure you want to permanently delete this question from the course Question Bank?",
      confirmText: "Delete Question",
      type: "danger",
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          const res = await fetch(`/api/lms/questions?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            setQuestions((prev) => prev.filter((q) => q.id !== id));
            showNotify("success", "Question removed from Question Bank");
          } else {
            showNotify("error", data.error || "Failed to delete question");
          }
        } catch {
          showNotify("error", "Failed to delete question");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importExcelFile || !selectedAssignment) {
      showNotify("error", "Please select an Excel file (.xlsx)");
      return;
    }
    if (importExcelFile.size > 5 * 1024 * 1024) {
      showNotify("error", `Excel file exceeds 5MB limit (${(importExcelFile.size / (1024 * 1024)).toFixed(2)} MB).`);
      return;
    }
    setIsImportingExcel(true);
    try {
      const formData = new FormData();
      formData.append("file", importExcelFile);
      formData.append("subjectId", selectedAssignment.subjectId);
      if (selectedAssignmentId) {
        formData.append("assignmentId", selectedAssignmentId);
      }

      const res = await fetch("/api/lms/questions/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        showNotify("success", data.message || `Imported ${data.count} questions!`);
        setIsImportExcelModalOpen(false);
        setImportExcelFile(null);
        reloadQuestions();
      } else {
        showNotify("error", data.error || "Failed to import questions");
      }
    } catch {
      showNotify("error", "Error uploading Excel file");
    } finally {
      setIsImportingExcel(false);
    }
  };

  // --- QUIZ ACTIONS (MANY NUMBER OF QUIZZES ALLOWED) ---
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || selectedQuestionIds.length === 0 || !selectedAssignmentId) {
      showNotify("error", "Provide quiz title and select at least one question");
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
          totalMarks: quizTotalMarks || selectedQuestionIds.length,
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
        showNotify("success", "Section CBT quiz created and published!");
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

  // Completion calculation for selected course
  const totalTopicsCount = topics.length;
  const completedTopicsCount = topics.filter((t) => t.status === "COMPLETED").length;
  const overallCompletionRate =
    totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // Filtered Questions for Question Bank tab
  const filteredQuestions = questions.filter((q) => {
    if (filterDifficulty !== "ALL" && q.difficulty !== filterDifficulty) return false;
    if (filterUnit !== "ALL" && q.unitNumber !== filterUnit) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* =========================================================================
          VIEW A: COURSE SELECTION CARDS SHELF (DEFAULT LANDING VIEW)
          ========================================================================= */}
      {!selectedAssignmentId ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Faculty Course Allocation &amp; Studio</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                My Assigned Courses
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select any of your assigned subjects below to enter its dedicated Course Studio (Lecture Plan, Materials, Question Bank &amp; Quizzes).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard Hub</span>
              </Link>
              <div className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold">
                {assignments.length} Assigned Sections
              </div>
            </div>
          </div>

          {/* Search & Program Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search course name, code, section..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Program:
              </span>
              <select
                value={courseFilterProgram}
                onChange={(e) => setCourseFilterProgram(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Degree Programs</option>
                {uniquePrograms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedAssignmentId(c.id)}
                className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-lg hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-extrabold text-xs">
                      {c.subjectCode}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px]">
                      {c.credits} Credits • {c.type}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {c.subjectName}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.programName}</span>
                    </p>
                    <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        Section {c.sectionName} (Year {c.year}, Sem {c.semester})
                      </span>
                    </p>
                    {c.coFaculty && c.coFaculty.length > 1 && (
                      <p className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded-md inline-block truncate max-w-full" title={c.coFaculty.join(", ")}>
                        👥 {c.coFaculty.length} Instructors Mapped
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Enter Course Studio</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW B: DEDICATED SUBJECT STUDIO WORKSPACE WITH SIDEBAR
            ========================================================================= */
        <div className="space-y-6">
          {/* Top Bar with Back Button & Course Switcher */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 px-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedAssignmentId(null)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition flex-shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Assigned Courses</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                    {selectedAssignment?.subjectCode}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Section {selectedAssignment?.sectionName} • {selectedAssignment?.programName}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedAssignment?.subjectName}
                </h2>
                {selectedAssignment?.coFaculty && selectedAssignment.coFaculty.length > 1 && (
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    <strong className="text-slate-700">Course Instructors ({selectedAssignment.coFaculty.length}):</strong>{" "}
                    {selectedAssignment.coFaculty.join(" • ")}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Switch Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Syllabus Covered</span>
                <span className="text-sm font-black text-emerald-600">
                  {completedTopicsCount} / {totalTopicsCount} Topics ({overallCompletionRate}%)
                </span>
              </div>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              >
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    Sec {a.sectionName} — {a.subjectCode} ({a.subjectShortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Studio Layout: Dedicated Left Sidebar + Right Content Workspace */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Sidebar */}
            <aside className="w-full lg:w-72 bg-[#0B2545] text-white rounded-3xl p-5 shadow-xl flex-shrink-0 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Course Metadata Pill */}
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                    Active Course Studio
                  </span>
                  <div className="text-lg font-black text-white mt-1 tracking-wider font-mono">
                    {selectedAssignment?.subjectCode}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5 font-semibold line-clamp-1">
                    {selectedAssignment?.subjectName}
                  </div>
                  <div className="text-[11px] text-indigo-200 mt-1">
                    Section {selectedAssignment?.sectionName} • Year {selectedAssignment?.year}, Sem {selectedAssignment?.semester}
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab("lecture_plan")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                      activeTab === "lecture_plan"
                        ? "bg-blue-600 text-white shadow-md font-extrabold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Lecture Plan</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                      {topics.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("materials")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                      activeTab === "materials"
                        ? "bg-blue-600 text-white shadow-md font-extrabold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Course Materials</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                      {materials.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                      activeTab === "questions"
                        ? "bg-blue-600 text-white shadow-md font-extrabold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Question Bank</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                      {questions.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                      activeTab === "quizzes"
                        ? "bg-blue-600 text-white shadow-md font-extrabold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-rose-400" />
                      <span>Section Quizzes</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                      {quizzes.length}
                    </span>
                  </button>
                </nav>
              </div>

              {/* Bottom Quick Stats */}
              <div className="mt-8 pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Unit 1–5 Units:</span>
                  <span className="font-bold text-white">5 Active</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Option A Files:</span>
                  <span className="font-bold text-emerald-400">{materials.length} PDFs</span>
                </div>
              </div>
            </aside>

            {/* Right Main Content Workspace */}
            <main className="flex-1 w-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs min-h-[600px]">
              {/* =========================================================================
                  TAB 1: LECTURE PLAN (TOPICS WITH MULTIPLE ATTACHMENTS PER TOPIC)
                  ========================================================================= */}
              {activeTab === "lecture_plan" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Lecture Plan &amp; Topic Delivery</h3>
                      <p className="text-xs text-slate-500">
                        Divide Unit 1 to 5 into topics, track delivery, and attach multiple lecture files per topic.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSyllabusFile(null);
                          setIsUploadSyllabusModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition shadow-2xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Syllabus / Lecture Plan (≤5MB)</span>
                      </button>

                      <button
                        onClick={() => {
                          setNewTopicUnit(1);
                          setNewTopicTitle("");
                          setIsAddTopicModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lecture Topic</span>
                      </button>
                    </div>
                  </div>

                  {/* Official Syllabus / Lecture Plan Copy Banner if Uploaded */}
                  {materials
                    .filter((m) => m.type === "SYLLABUS_COPY")
                    .map((syl) => {
                      const isPlanOnly =
                        syl.title.toLowerCase().includes("lecture plan") &&
                        !syl.title.toLowerCase().includes("syllabus");
                      const isCombined =
                        syl.title.toLowerCase().includes("lecture plan") &&
                        syl.title.toLowerCase().includes("syllabus");
                      const badgeLabel = isPlanOnly
                        ? "Institutional Lecture Plan (PDF)"
                        : isCombined
                        ? "Syllabus & Lecture Plan (PDF)"
                        : "Official Syllabus Copy (PDF)";

                      return (
                        <div
                          key={syl.id}
                          className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-indigo-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/30 text-indigo-200 font-mono">
                                  {badgeLabel}
                                </span>
                                <span className="text-[11px] text-slate-300">
                                  {syl.fileSize ? `${(syl.fileSize / (1024 * 1024)).toFixed(2)} MB` : "PDF"}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-white mt-0.5">{syl.title}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                          <a
                            href={syl.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow-2xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>View Document</span>
                          </a>
                          <a
                            href={syl.fileUrl}
                            download={syl.fileName}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(syl.id)}
                            className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-500/20 transition"
                            title="Remove Syllabus Copy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {isLoadingTopics ? (
                    <div className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      <span>Loading lecture plan...</span>
                    </div>
                  ) : topics.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No Lecture Topics Configured Yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Click &quot;Add Lecture Topic&quot; above to schedule your Unit 1–5 topics.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {[1, 2, 3, 4, 5].map((u) => {
                        const unitTopics = topics.filter((t) => t.unitNumber === u);
                        if (unitTopics.length === 0) return null;

                        const comp = unitTopics.filter((t) => t.status === "COMPLETED").length;
                        const pct = Math.round((comp / unitTopics.length) * 100);

                        return (
                          <div key={u} className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                            <div className="p-4 bg-slate-50 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                                  Unit {u} Modules
                                </h4>
                                <span className="text-xs text-slate-400 font-semibold">
                                  ({comp} of {unitTopics.length} covered)
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xs font-extrabold text-slate-700">{pct}% Complete</span>
                                <button
                                  onClick={() => handleOpenAddMaterialModal(u)}
                                  className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Attach Unit File
                                </button>
                              </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                              {unitTopics.map((topic, idx) => {
                                // Find materials attached to this specific topic
                                const topicMaterials = materials.filter((m) => m.topicId === topic.id);

                                return (
                                  <div key={topic.id} className="p-4 hover:bg-slate-50/60 transition space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3">
                                        <button
                                          onClick={() => handleToggleTopicStatus(topic.id, topic.status)}
                                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition flex-shrink-0 ${
                                            topic.status === "COMPLETED"
                                              ? "bg-emerald-600 border-emerald-600 text-white"
                                              : "border-slate-300 hover:border-slate-400 bg-white"
                                          }`}
                                        >
                                          {topic.status === "COMPLETED" && <CheckCircle className="w-3.5 h-3.5" />}
                                        </button>

                                        <div>
                                          <p
                                            className={`text-sm font-bold ${
                                              topic.status === "COMPLETED"
                                                ? "line-through text-slate-400"
                                                : "text-slate-800"
                                            }`}
                                          >
                                            {topic.topicTitle}
                                          </p>
                                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                            <span>Planned: {new Date(topic.plannedDate).toLocaleDateString()}</span>
                                            {topic.deliveryMode && <span>• {topic.deliveryMode}</span>}
                                            {topic.status === "COMPLETED" && (
                                              <span className="text-emerald-600 font-bold">• Completed</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleOpenAddMaterialModal(topic.unitNumber, topic.id)}
                                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1 transition"
                                          title="Attach file to this topic"
                                        >
                                          <Paperclip className="w-3.5 h-3.5" />
                                          <span className="text-[11px] hidden sm:inline">Attach File</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteTopic(topic.id)}
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Topic-level Material Attachments (Multiple files allowed) */}
                                    {topicMaterials.length > 0 && (
                                      <div className="ml-8 pt-2 flex flex-wrap gap-2">
                                        {topicMaterials.map((tm) => (
                                          <div
                                            key={tm.id}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900"
                                          >
                                            <FileText className="w-3 h-3 text-indigo-600" />
                                            <a
                                              href={tm.fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="hover:underline max-w-xs truncate"
                                            >
                                              {tm.title}
                                            </a>
                                            <button
                                              onClick={() => handleDeleteMaterial(tm.id)}
                                              className="text-slate-400 hover:text-rose-600 ml-1"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  TAB 2: COURSE MATERIALS (OPTION A REPOSITORY)
                  ========================================================================= */}
              {activeTab === "materials" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Course Materials Repository</h3>
                      <p className="text-xs text-slate-500">
                        Upload lecture notes, presentation slides, and reference materials. Stored in Option A local server storage.
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenAddMaterialModal(1)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Material (PDF)</span>
                    </button>
                  </div>

                  {isLoadingMaterials ? (
                    <div className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      <span>Loading course materials...</span>
                    </div>
                  ) : materials.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No Materials Uploaded Yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Upload unit notes and attach multiple PDFs to topics for student reference.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {materials.map((m) => {
                        const boundTopic = topics.find((t) => t.id === m.topicId);

                        return (
                          <div
                            key={m.id}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px]">
                                  UNIT {m.unitNumber}
                                </span>
                                {m.type === "VIDEO_LECTURE" ? (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Video className="w-3 h-3" /> Video Lecture
                                  </span>
                                ) : boundTopic ? (
                                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                                    Topic: {boundTopic.topicTitle}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {m.type.replace(/_/g, " ")}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold text-slate-900 text-sm mt-3 line-clamp-1">
                                {m.title}
                              </h4>
                              {m.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {m.description}
                                </p>
                              )}

                              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                                <span className="truncate max-w-[200px]">{m.fileName}</span>
                                {m.fileSize > 0 && <span>• {(m.fileSize / 1024).toFixed(0)} KB</span>}
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <a
                                href={m.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold hover:underline flex items-center gap-1.5"
                              >
                                {m.type === "VIDEO_LECTURE" ? (
                                  <>
                                    <Play className="w-3.5 h-3.5 fill-current text-rose-600" />
                                    <span className="text-rose-600 font-extrabold">Watch Video</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                    <span className="text-indigo-600">View File</span>
                                  </>
                                )}
                              </a>
                              <button
                                onClick={() => handleDeleteMaterial(m.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
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
              )}

              {/* =========================================================================
                  TAB 3: QUESTION BANK (EASY, MEDIUM, HARD WITH CUSTOM MARKS)
                  ========================================================================= */}
              {activeTab === "questions" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Question Bank Studio</h3>
                      <p className="text-xs text-slate-500">
                        Curate questions tagged by Unit, Difficulty (*Easy*, *Medium*, *Hard*), Bloom&apos;s level, and marks.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1. Download Sample Excel Template */}
                      <a
                        href="/api/lms/questions/template"
                        download="GVPIHLR_Question_Bank_Template.xlsx"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs"
                        title="Download official sample Excel template with guidelines"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Sample Excel</span>
                      </a>

                      {/* 2. Export Question Bank to Excel */}
                      <a
                        href={`/api/lms/questions/export?subjectId=${selectedAssignment?.subjectId}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-bold transition shadow-2xs"
                        title="Export current course Question Bank to Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Download Excel</span>
                      </a>

                      {/* 3. Upload Questions from Excel */}
                      <button
                        type="button"
                        onClick={() => {
                          setImportExcelFile(null);
                          setIsImportExcelModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                        title="Upload questions in bulk from Excel (.xlsx)"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Excel</span>
                      </button>

                      {/* 4. Single Add Question Button */}
                      <button
                        type="button"
                        onClick={() => setIsAddQuestionModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-500">Unit:</span>
                      {(["ALL", 1, 2, 3, 4, 5] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => setFilterUnit(u)}
                          className={`px-2.5 py-1 rounded-lg font-bold ${
                            filterUnit === u
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-slate-600 border border-slate-200"
                          }`}
                        >
                          {u === "ALL" ? "All" : `U${u}`}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-500">Difficulty:</span>
                      {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setFilterDifficulty(d)}
                          className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] ${
                            filterDifficulty === d
                              ? "bg-slate-800 text-white"
                              : "bg-white text-slate-600 border border-slate-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredQuestions.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No Questions In This Filter</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Add questions to create timed CBT section quizzes for students.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                                UNIT {q.unitNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                  q.difficulty === "EASY"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : q.difficulty === "MEDIUM"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {q.difficulty}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                {q.type} • {q.marks} Mark(s)
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="font-bold text-slate-900 text-sm">{q.questionText}</p>

                          {q.type === "MCQ" && q.options && Array.isArray(q.options) && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                                    optIdx === q.correctOption
                                      ? "bg-emerald-50 border-emerald-400 font-bold text-emerald-900"
                                      : "bg-slate-50/50 border-slate-200 text-slate-700"
                                  }`}
                                >
                                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-mono text-[9px] font-bold flex items-center justify-center">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  TAB 4: SECTION QUIZZES (MANY NUMBER OF QUIZZES ALLOWED)
                  ========================================================================= */}
              {activeTab === "quizzes" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Section CBT Quizzes</h3>
                      <p className="text-xs text-slate-500">
                        Create any number of online quizzes. Choose questions, set duration and marks.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setQuizTitle("");
                        setSelectedQuestionIds([]);
                        setIsCreateQuizModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Quiz</span>
                    </button>
                  </div>

                  {isLoadingQuizzes ? (
                    <div className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      <span>Loading scheduled quizzes...</span>
                    </div>
                  ) : quizzes.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No CBT Quizzes Created Yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Click &quot;Create New Quiz&quot; above to author and publish a timed CBT quiz for Section {selectedAssignment?.sectionName}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-extrabold text-[10px]">
                                ONLINE CBT
                              </span>
                              <button
                                onClick={() => handleTogglePublishQuiz(quiz.id, quiz.isPublished)}
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  quiz.isPublished
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {quiz.isPublished ? "PUBLISHED" : "DRAFT"}
                              </button>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm mt-3">{quiz.title}</h4>

                            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl mt-3 text-center text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block">DURATION</span>
                                <span className="font-extrabold text-slate-800">{quiz.durationMinutes}m</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block">TOTAL MARKS</span>
                                <span className="font-extrabold text-slate-800">{quiz.totalMarks}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block">ATTEMPTS</span>
                                <span className="font-extrabold text-purple-600">
                                  {quiz.attempts?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <button
                              onClick={() => setViewingQuizAttempts(quiz)}
                              className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>View Student Submissions</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. Add Lecture Topic Modal */}
      {isAddTopicModalOpen && (
        <CustomModal
          title="Add New Lecture Topic"
          isOpen={isAddTopicModalOpen}
          hideFooter={true}
          onClose={() => setIsAddTopicModalOpen(false)}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add New Lecture Topic</h3>
              <button onClick={() => setIsAddTopicModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Unit Number</label>
                <select
                  value={newTopicUnit}
                  onChange={(e) => setNewTopicUnit(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                >
                  {[1, 2, 3, 4, 5].map((u) => (
                    <option key={u} value={u}>
                      Unit {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eigenvalues and Cayley-Hamilton Theorem"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Planned Teaching Date</label>
                  <input
                    type="date"
                    required
                    value={newTopicPlannedDate}
                    onChange={(e) => setNewTopicPlannedDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Pedagogy</label>
                  <select
                    value={newTopicMode}
                    onChange={(e) => setNewTopicMode(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="Chalk & Talk">Chalk &amp; Talk</option>
                    <option value="ICT / Presentation">ICT / Presentation</option>
                    <option value="Lab Practical">Lab Practical</option>
                    <option value="Flipped Classroom">Flipped Classroom</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTopicModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTopic}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmittingTopic ? "Saving..." : "Save Topic"}
                </button>
              </div>
            </form>
          </div>
        </CustomModal>
      )}

      {/* 2. Upload Material Modal (Allows attaching to specific topic or unit) */}
      {isAddMaterialModalOpen && (
        <CustomModal
          title="Upload Course Material (Option A)"
          isOpen={isAddMaterialModalOpen}
          hideFooter={true}
          onClose={() => setIsAddMaterialModalOpen(false)}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Upload Course Material (Option A)</h3>
              <button onClick={() => setIsAddMaterialModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={newMaterialUnit}
                    onChange={(e) => setNewMaterialUnit(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>
                        Unit {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Attach to Specific Topic</label>
                  <select
                    value={newMaterialTopicId}
                    onChange={(e) => setNewMaterialTopicId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold truncate"
                  >
                    <option value="">General Unit Material (No topic)</option>
                    {topics
                      .filter((t) => t.unitNumber === newMaterialUnit)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.topicTitle}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1 Complete Handwritten Notes"
                  value={newMaterialTitle}
                  onChange={(e) => setNewMaterialTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Material Type</label>
                <select
                  value={newMaterialType}
                  onChange={(e) => setNewMaterialType(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                >
                  <option value="LECTURE_NOTES_PDF">Lecture Notes (PDF)</option>
                  <option value="SLIDES_PPT">Slides / PPT</option>
                  <option value="VIDEO_LECTURE">Video Lecture (YouTube / Cloud Link)</option>
                  <option value="SYLLABUS_COPY">Syllabus Copy</option>
                  <option value="FORMULA_SHEET">Formula Sheet</option>
                  <option value="REFERENCE_LINK">Web / Reference Link</option>
                </select>
              </div>

              {newMaterialType === "VIDEO_LECTURE" || newMaterialType === "REFERENCE_LINK" ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {newMaterialType === "VIDEO_LECTURE" ? "Video Lecture URL (YouTube / Vimeo / Cloud Link)" : "Resource Web Link"}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      placeholder={
                        newMaterialType === "VIDEO_LECTURE"
                          ? "https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          : "https://example.com/notes"
                      }
                      value={newMaterialUrl}
                      onChange={(e) => setNewMaterialUrl(e.target.value)}
                      className="w-full p-2.5 border rounded-xl font-medium focus:outline-none pl-9 bg-slate-50"
                    />
                    <Video className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    YouTube links automatically render inside our responsive 16:9 theater player for students.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select File (PDF / PPT - Max 5MB)</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded-xl text-xs bg-slate-50"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Strict institutional limit: 5MB maximum file size.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMaterial}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isUploadingMaterial ? "Saving to server..." : "Upload Material"}
                </button>
              </div>
            </form>
          </div>
        </CustomModal>
      )}

      {/* 3. Add Question Modal */}
      {isAddQuestionModalOpen && (
        <CustomModal
          title="Add Question to Bank"
          isOpen={isAddQuestionModalOpen}
          hideFooter={true}
          onClose={() => setIsAddQuestionModalOpen(false)}
        >
          <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add Question to Bank</h3>
              <button onClick={() => setIsAddQuestionModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={qUnit}
                    onChange={(e) => setQUnit(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
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
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={qMarks}
                    onChange={(e) => setQMarks(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Question Type</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                >
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="SHORT_ANSWER">Short Answer / Concept</option>
                  <option value="LONG_ANSWER">Long Descriptive Answer</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Type the question statement..."
                  className="w-full p-2.5 border rounded-xl font-medium focus:outline-none"
                />
              </div>

              {qType === "MCQ" && (
                <div className="space-y-2 border-t pt-3">
                  <label className="font-bold text-slate-700 block">MCQ Options &amp; Correct Answer</label>
                  {[
                    { label: "Option A", val: qOptionA, set: setQOptionA, idx: 0 },
                    { label: "Option B", val: qOptionB, set: setQOptionB, idx: 1 },
                    { label: "Option C", val: qOptionC, set: setQOptionC, idx: 2 },
                    { label: "Option D", val: qOptionD, set: setQOptionD, idx: 3 },
                  ].map((opt) => (
                    <div key={opt.idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={qCorrectOpt === opt.idx}
                        onChange={() => setQCorrectOpt(opt.idx)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <input
                        type="text"
                        required
                        placeholder={opt.label}
                        value={opt.val}
                        onChange={(e) => opt.set(e.target.value)}
                        className="flex-1 p-2 border rounded-xl text-xs font-medium"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Solution / Explanation</label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explanation shown when student practices in self-study mode..."
                  className="w-full p-2.5 border rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuestion}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmittingQuestion ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </CustomModal>
      )}

      {/* 4. Create Section CBT Quiz Modal */}
      {isCreateQuizModalOpen && (
        <CustomModal
          title="Create Section CBT Quiz"
          isOpen={isCreateQuizModalOpen}
          hideFooter={true}
          onClose={() => setIsCreateQuizModalOpen(false)}
        >
          <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Create Section CBT Quiz</h3>
              <button onClick={() => setIsCreateQuizModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1 Mid-Term Practice Test"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quizTotalMarks}
                    onChange={(e) => setQuizTotalMarks(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Focus</label>
                  <select
                    value={quizUnit || 1}
                    onChange={(e) => setQuizUnit(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>
                        Unit {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Questions from Bank */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">
                    Select Questions ({selectedQuestionIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedQuestionIds.length === questions.length) {
                        setSelectedQuestionIds([]);
                      } else {
                        setSelectedQuestionIds(questions.map((q) => q.id));
                      }
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    {selectedQuestionIds.length === questions.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {questions.length === 0 ? (
                  <p className="text-slate-400 italic py-3 text-center">
                    No questions available in question bank. Add questions first.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-xl p-2 bg-slate-50">
                    {questions.map((q) => {
                      const isChecked = selectedQuestionIds.includes(q.id);
                      return (
                        <label
                          key={q.id}
                          className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-indigo-50/50"
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
                            className="mt-0.5 rounded text-indigo-600"
                          />
                          <div className="flex-1 text-[11px]">
                            <span className="font-extrabold mr-1">U{q.unitNumber} ({q.difficulty}):</span>
                            <span className="text-slate-800">{q.questionText}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateQuizModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuiz || selectedQuestionIds.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmittingQuiz ? "Creating..." : "Create & Publish Quiz"}
                </button>
              </div>
            </form>
          </div>
        </CustomModal>
      )}

      {/* 5. View Quiz Submissions Modal */}
      {viewingQuizAttempts && (
        <CustomModal
          title={viewingQuizAttempts.title || "Quiz Submissions"}
          isOpen={!!viewingQuizAttempts}
          hideFooter={true}
          onClose={() => setViewingQuizAttempts(null)}
        >
          <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{viewingQuizAttempts.title}</h3>
                <span className="text-xs text-slate-400">
                  {viewingQuizAttempts.attempts?.length || 0} student attempts submitted
                </span>
              </div>
              <button onClick={() => setViewingQuizAttempts(null)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {(!viewingQuizAttempts.attempts || viewingQuizAttempts.attempts.length === 0) ? (
              <p className="text-center py-8 text-slate-400 text-xs italic">
                No students have submitted this quiz yet.
              </p>
            ) : (
              <div className="space-y-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                      <th className="p-2">Student</th>
                      <th className="p-2 text-center">Score</th>
                      <th className="p-2 text-center">Proctor Tab Switches</th>
                      <th className="p-2 text-right">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {viewingQuizAttempts.attempts.map((att: any) => (
                      <tr key={att.id}>
                        <td className="p-2 font-mono font-bold text-slate-800">
                          {att.student?.rollNumber || att.studentId}
                        </td>
                        <td className="p-2 text-center font-extrabold text-emerald-600">
                          {att.score} / {viewingQuizAttempts.totalMarks}
                        </td>
                        <td className="p-2 text-center font-mono font-bold">
                          {att.tabSwitchCount > 0 ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                              {att.tabSwitchCount} alert(s)
                            </span>
                          ) : (
                            <span className="text-emerald-600">0</span>
                          )}
                        </td>
                        <td className="p-2 text-right text-slate-400 text-[11px]">
                          {att.completedAt ? new Date(att.completedAt).toLocaleTimeString() : "In progress"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CustomModal>
      )}

      {/* 6. Import Questions from Excel Modal */}
      {isImportExcelModalOpen && (
        <CustomModal
          title="Upload Question Bank from Excel"
          isOpen={isImportExcelModalOpen}
          hideFooter={true}
          onClose={() => {
            if (!isImportingExcel) {
              setIsImportExcelModalOpen(false);
              setImportExcelFile(null);
            }
          }}
        >
          <form onSubmit={handleImportExcel} className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Upload Question Bank (.xlsx)</h3>
                <p className="text-xs text-slate-500">
                  Bulk import MCQs, Short Answers, and Descriptive questions for {selectedAssignment?.subjectCode}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isImportingExcel) {
                    setIsImportExcelModalOpen(false);
                    setImportExcelFile(null);
                  }
                }}
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Template Download Hint */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
              <Download className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-900 space-y-1">
                <p className="font-bold">Need the Excel column structure?</p>
                <p className="text-indigo-700">
                  Download our pre-formatted sample Excel file with columns for Unit Number, Type, Difficulty, Marks, Options, and Answers.
                </p>
                <a
                  href="/api/lms/questions/template"
                  download="GVPIHLR_Question_Bank_Template.xlsx"
                  className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 underline mt-1"
                >
                  Download GVPIHLR_Question_Bank_Template.xlsx
                </a>
              </div>
            </div>

            {/* File Input Dropzone */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition bg-slate-50/50">
              <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <label className="block cursor-pointer">
                <span className="text-xs font-bold text-indigo-600 hover:underline">Choose .xlsx or .xls file</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setImportExcelFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {importExcelFile ? (
                <div className="mt-3 p-2 px-3 bg-white border border-slate-200 rounded-xl inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{importExcelFile.name}</span>
                  <span className="text-slate-400 font-normal">
                    ({(importExcelFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">Supports standard Microsoft Excel spreadsheets (.xlsx, .xls)</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                disabled={isImportingExcel}
                onClick={() => {
                  setIsImportExcelModalOpen(false);
                  setImportExcelFile(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isImportingExcel || !importExcelFile}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {isImportingExcel ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing & Importing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Import Questions</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* 7. Upload Official Syllabus & Lecture Plan PDF Modal (Strict 5MB limit) */}
      {isUploadSyllabusModalOpen && (
        <CustomModal
          title="Upload Course Syllabus & Lecture Plan (PDF)"
          isOpen={isUploadSyllabusModalOpen}
          hideFooter={true}
          maxWidth="max-w-lg"
          onClose={() => {
            if (!isUploadingSyllabus) {
              setIsUploadSyllabusModalOpen(false);
              setSyllabusFile(null);
            }
          }}
        >
          <form onSubmit={handleUploadSyllabus} className="p-1 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Upload Course Syllabus or Lecture Plan</h3>
                <p className="text-xs text-slate-500">
                  Upload official syllabus copy or institutional lecture schedule for {selectedAssignment?.subjectCode} (Strict 5MB limit).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isUploadingSyllabus) {
                    setIsUploadSyllabusModalOpen(false);
                    setSyllabusFile(null);
                  }
                }}
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={syllabusCategory}
                  onChange={(e) => {
                    const val = e.target.value as "COMBINED" | "LECTURE_PLAN" | "SYLLABUS_COPY";
                    setSyllabusCategory(val);
                    if (val === "LECTURE_PLAN") {
                      setSyllabusTitle("Institutional Course Lecture Plan");
                    } else if (val === "SYLLABUS_COPY") {
                      setSyllabusTitle("Official Course Syllabus Copy");
                    } else {
                      setSyllabusTitle("Official Course Syllabus & Lecture Plan");
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="COMBINED">Syllabus &amp; Lecture Plan (Combined)</option>
                  <option value="LECTURE_PLAN">Institutional Lecture Plan (PDF)</option>
                  <option value="SYLLABUS_COPY">Official Syllabus Copy (PDF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={syllabusTitle}
                  onChange={(e) => setSyllabusTitle(e.target.value)}
                  placeholder="e.g. Official Course Syllabus & Lecture Plan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            {/* Entire Dashed Box is Clickable Anywhere (as requested) */}
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition bg-indigo-50/20 hover:bg-indigo-50/40 group">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f && f.size > 5 * 1024 * 1024) {
                    showNotify("error", `File exceeds 5MB limit (${(f.size / (1024 * 1024)).toFixed(2)} MB)`);
                    return;
                  }
                  setSyllabusFile(f);
                }}
                className="sr-only"
              />

              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                <FileText className="w-6 h-6" />
              </div>

              <p className="text-xs font-extrabold text-indigo-600 group-hover:text-indigo-700">
                {syllabusFile ? "Click anywhere in this box to change PDF" : "Click anywhere in this box to choose PDF"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Strict maximum size: 5 MB (PDF format only)
              </p>

              {/* Beautiful, aligned selected file preview card (matches screenshot 2 request) */}
              {syllabusFile && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 w-full bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate" title={syllabusFile.name}>
                        {syllabusFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(syllabusFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSyllabusFile(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                    title="Remove selected file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                disabled={isUploadingSyllabus}
                onClick={() => {
                  setIsUploadSyllabusModalOpen(false);
                  setSyllabusFile(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploadingSyllabus || !syllabusFile}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {isUploadingSyllabus ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* Styled Confirmation Dialog (Replaces native browser confirm popups everywhere) */}
      {confirmDialog.isOpen && (
        <CustomModal
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText || "Confirm"}
          type={confirmDialog.type || "danger"}
          isLoading={confirmDialog.isLoading}
          onConfirm={confirmDialog.onConfirm}
        />
      )}
    </div>
  );
}
