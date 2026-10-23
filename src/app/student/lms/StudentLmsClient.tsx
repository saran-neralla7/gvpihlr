"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  PlayCircle,
  Play,
  Video,
  Sparkles,
  Filter,
  Layers,
  ShieldAlert,
  X,
  Search,
  ChevronRight,
  GraduationCap,
  User,
} from "lucide-react";
import CustomModal from "@/components/ui/CustomModal";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube watch, share, short
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  // Google Drive
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  }
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9_-]+)/);
  if (loomMatch && loomMatch[1]) {
    return `https://www.loom.com/embed/${loomMatch[1]}`;
  }
  return null;
}

interface StudentProps {
  id: string;
  rollNumber: string;
  fullName: string;
  programName: string;
  sectionName: string;
  year: number;
  semester: number;
  academicYear: string;
}

interface QuestionItem {
  id: string;
  unitNumber: number;
  questionText: string;
  type: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  marks: number;
  bloomsLevel?: string | null;
  options?: any;
  correctOption?: number | null;
  explanation?: string | null;
}

interface QuizAttempt {
  id: string;
  score: number;
  tabSwitchCount: number;
  completedAt?: string | null;
}

interface QuizQuestion {
  id: string;
  order: number;
  marks: number;
  questionBankId: string;
  questionBank: QuestionItem;
}

interface CourseQuiz {
  id: string;
  title: string;
  unitNumber?: number | null;
  durationMinutes: number;
  totalMarks: number;
  isPublished: boolean;
  attempts: QuizAttempt[];
  questions: QuizQuestion[];
}

interface CourseMaterial {
  id: string;
  unitNumber: number;
  title: string;
  description?: string | null;
  type: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number | null;
  createdAt: string;
}

interface LecturePlanTopic {
  id: string;
  unitNumber: number;
  topicSequence: number;
  topicTitle: string;
  plannedDate: string;
  actualDate?: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  deliveryMode?: string | null;
  remarks?: string | null;
  materials?: CourseMaterial[];
}

interface Assignment {
  id: string;
  allAssignmentIds?: string[];
  allFaculty?: { id: string; fullName: string; email?: string | null; isPrimary: boolean }[];
  faculty: {
    user: { fullName: string; email?: string | null };
    department?: { name: string; code: string } | null;
  };
  subjectOffering: {
    subject: {
      id: string;
      code: string;
      name: string;
      credits: number;
      questionBankItems: QuestionItem[];
    };
  };
  lecturePlanTopics: LecturePlanTopic[];
  courseMaterials: CourseMaterial[];
  courseQuizzes: CourseQuiz[];
}

// Telemetry dispatcher helper
function sendStudentTelemetry(category: string, action: string, metadata?: any) {
  try {
    const payload = JSON.stringify({ category, action, metadata });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/telemetry/student-event", blob);
    } else {
      fetch("/api/telemetry/student-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // Non-blocking telemetry
  }
}

export default function StudentLmsClient({
  student,
  assignments,
}: {
  student: StudentProps;
  assignments: Assignment[];
}) {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"topics" | "materials" | "questions" | "quizzes">(
    "materials"
  );
  const [selectedUnit, setSelectedUnit] = useState<number | "ALL">("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">(
    "ALL"
  );
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // PDF Viewer Modal State
  const [previewMaterial, setPreviewMaterial] = useState<CourseMaterial | null>(null);

  // Active Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<CourseQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | number>>({});
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number>(0);
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [quizSubmittedResult, setQuizSubmittedResult] = useState<any | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState<boolean>(false);

  // Styled in-app modal popups (replaces browser confirm and alert dialogs)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  // Sync with URL query parameter so students can bookmark / link directly to a subject room
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const subjectParam = params.get("subject");
      if (subjectParam) {
        const matched = assignments.find(
          (a) => a.id === subjectParam || a.allAssignmentIds?.includes(subjectParam)
        );
        if (matched) {
          setSelectedAssignmentId(matched.id);
        }
      }
    }
  }, [assignments]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const subjectParam = params.get("subject");
        if (subjectParam) {
          const matched = assignments.find(
            (a) => a.id === subjectParam || a.allAssignmentIds?.includes(subjectParam)
          );
          setSelectedAssignmentId(matched ? matched.id : null);
        } else {
          setSelectedAssignmentId(null);
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [assignments]);

  // Initial page load telemetry
  useEffect(() => {
    sendStudentTelemetry("NAVIGATION", "VIEW_LMS_HOME", {
      rollNumber: student.rollNumber,
      section: student.sectionName,
      subjectsCount: assignments.length,
    });
  }, [student.rollNumber, student.sectionName, assignments.length]);

  const currentAssignment = assignments.find(
    (a) => a.id === selectedAssignmentId || a.allAssignmentIds?.includes(selectedAssignmentId || "")
  );

  // Handle switching subject
  const handleSelectSubject = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("subject", assignmentId);
      window.history.pushState({}, "", url.toString());
    }
    const chosen = assignments.find((a) => a.id === assignmentId);
    if (chosen) {
      sendStudentTelemetry("SUBJECT_ROOM", "OPEN_SUBJECT_ROOM", {
        subjectCode: chosen.subjectOffering.subject.code,
        subjectName: chosen.subjectOffering.subject.name,
        facultyName: chosen.faculty.user.fullName,
      });
    }
  };

  const handleBackToAllSubjects = () => {
    setSelectedAssignmentId(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("subject");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Switch tabs
  const handleTabChange = (tab: "topics" | "materials" | "questions" | "quizzes") => {
    setActiveTab(tab);
    if (currentAssignment) {
      if (tab === "questions") {
        sendStudentTelemetry("QUESTION_BANK", "BROWSE_QUESTION_BANK", {
          subjectCode: currentAssignment.subjectOffering.subject.code,
          unitFilter: selectedUnit,
          difficultyFilter,
        });
      } else if (tab === "topics") {
        sendStudentTelemetry("LECTURE_PLAN", "VIEW_LECTURE_PLAN", {
          subjectCode: currentAssignment.subjectOffering.subject.code,
        });
      }
    }
  };

  // Open PDF Preview
  const handleViewMaterial = (material: CourseMaterial) => {
    setPreviewMaterial(material);
    sendStudentTelemetry("MATERIAL_ACCESS", "VIEW_MATERIAL_INLINE", {
      materialId: material.id,
      unitNumber: material.unitNumber,
      title: material.title,
      fileName: material.fileName,
      fileUrl: material.fileUrl,
    });
  };

  // Download Material
  const handleDownloadMaterial = (material: CourseMaterial) => {
    sendStudentTelemetry("MATERIAL_ACCESS", "DOWNLOAD_MATERIAL_FILE", {
      materialId: material.id,
      unitNumber: material.unitNumber,
      title: material.title,
      fileName: material.fileName,
      fileUrl: material.fileUrl,
    });
  };

  // Start Quiz
  const handleStartQuiz = (quiz: CourseQuiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setTabSwitches(0);
    setQuizSubmittedResult(null);
    setQuizTimeRemaining(quiz.durationMinutes * 60);

    sendStudentTelemetry("ONLINE_QUIZ", "QUIZ_START", {
      quizId: quiz.id,
      quizTitle: quiz.title,
      durationMinutes: quiz.durationMinutes,
      totalQuestions: quiz.questions.length,
    });
  };

  // Quiz Timer and Anti-cheat Tab Proctoring
  useEffect(() => {
    if (!activeQuiz || quizSubmittedResult) return;

    // Countdown Timer
    const timer = setInterval(() => {
      setQuizTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Anti-cheat Proctor: Tab Switch & Window Blur Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          setShowTabSwitchWarning(true);
          sendStudentTelemetry("QUIZ_PROCTORING", "TAB_SWITCH", {
            quizId: activeQuiz.id,
            tabSwitchesCount: next,
            timestamp: new Date().toISOString(),
          });
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitches((prev) => {
        const next = prev + 1;
        setShowTabSwitchWarning(true);
        sendStudentTelemetry("QUIZ_PROCTORING", "QUIZ_WINDOW_BLUR", {
          quizId: activeQuiz.id,
          tabSwitchesCount: next,
          timestamp: new Date().toISOString(),
        });
        return next;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [activeQuiz, quizSubmittedResult]);

  // Submit Quiz
  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmittingQuiz) return;
    setIsSubmittingQuiz(true);

    try {
      const res = await fetch("/api/lms/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          submittedAnswers: quizAnswers,
          tabSwitchCount: tabSwitches,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setQuizSubmittedResult(data.attempt);
        sendStudentTelemetry("ONLINE_QUIZ", "QUIZ_SUBMIT", {
          quizId: activeQuiz.id,
          score: data.attempt.score,
          tabSwitchCount: tabSwitches,
        });
      } else {
        setErrorDialog({
          isOpen: true,
          title: "Submission Failed",
          description: data.error || "Failed to submit quiz. Please retry.",
        });
      }
    } catch (e) {
      setErrorDialog({
        isOpen: true,
        title: "Network Error",
        description: "Network error while submitting quiz. Please check your connection and try again.",
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Calculate syllabus progress for current subject
  const totalTopics = currentAssignment?.lecturePlanTopics.length || 0;
  const completedTopics =
    currentAssignment?.lecturePlanTopics.filter((t) => t.status === "COMPLETED").length || 0;
  const syllabusPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Filtered materials
  const filteredMaterials =
    currentAssignment?.courseMaterials.filter((m) =>
      selectedUnit === "ALL" ? true : m.unitNumber === selectedUnit
    ) || [];

  // Filtered questions
  const filteredQuestions =
    currentAssignment?.subjectOffering.subject.questionBankItems.filter((q) => {
      const matchUnit = selectedUnit === "ALL" ? true : q.unitNumber === selectedUnit;
      const matchDiff = difficultyFilter === "ALL" ? true : q.difficulty === difficultyFilter;
      return matchUnit && matchDiff;
    }) || [];

  // Filtered assignments for search in shelf view
  const filteredAssignments = assignments.filter((a) => {
    if (!courseSearch.trim()) return true;
    const q = courseSearch.toLowerCase();
    const sub = a.subjectOffering.subject;
    const fac = a.faculty.user.fullName;
    return (
      sub.name.toLowerCase().includes(q) ||
      sub.code.toLowerCase().includes(q) ||
      fac.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {!currentAssignment ? (
        /* =========================================================================
           VIEW A: ALL ASSIGNED COURSES SHELF (CARDS VIEW)
           ========================================================================= */
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>GVPIHLR Digital Courseware &amp; LMS Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Academic Course Room
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Enrolled in {student.programName} • Section {student.sectionName} (Year {student.year}, Sem {student.semester})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/student"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Attendance Portal</span>
              </Link>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400">Authenticated Student</span>
                <span className="text-xs font-black text-slate-900 font-mono">{student.rollNumber}</span>
              </div>
            </div>
          </div>

          {/* Search and Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subjects by code, name, or faculty..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono">
                {filteredAssignments.length} Subjects
              </span>
              <span>assigned for your current semester</span>
            </div>
          </div>

          {/* Course Cards Grid */}
          {assignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Course Offerings Assigned</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are currently no active course assignments configured for Section {student.sectionName}.
              </p>
            </div>
          ) : filteredAssignments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssignments.map((assignment) => {
                const sub = assignment.subjectOffering.subject;
                const cTopics = assignment.lecturePlanTopics.filter(
                  (t) => t.status === "COMPLETED"
                ).length;
                const tTopics = assignment.lecturePlanTopics.length;
                const pct = tTopics > 0 ? Math.round((cTopics / tTopics) * 100) : 0;
                const materialsCount = assignment.courseMaterials.length;
                const quizzesCount = assignment.courseQuizzes.length;
                const questionsCount = sub.questionBankItems.length;

                return (
                  <div
                    key={assignment.id}
                    onClick={() => handleSelectSubject(assignment.id)}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 cursor-pointer p-5 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md font-mono bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {sub.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {sub.credits} Credits
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                        {sub.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={assignment.allFaculty?.map((f) => f.fullName).join(", ") || assignment.faculty.user.fullName}>
                          Faculty:{" "}
                          {assignment.allFaculty && assignment.allFaculty.length > 1
                            ? `${assignment.allFaculty[0].fullName} +${assignment.allFaculty.length - 1} co-faculty`
                            : assignment.faculty.user.fullName}
                        </span>
                      </div>

                      {/* Content Badges */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{materialsCount} Materials</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{tTopics} Topics</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{questionsCount} Questions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{quizzesCount} Quizzes</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-500">Syllabus Coverage</span>
                        <span className="font-bold text-slate-700">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-100/60 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                        <span>Open Course Room</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No subjects matching "{courseSearch}"</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing the search input to see all courses.</p>
              <button
                onClick={() => setCourseSearch("")}
                className="mt-3 px-4 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
           VIEW B: DEDICATED SUBJECT COURSE ROOM (FULL PAGE)
           ========================================================================= */
        <div className="space-y-6">
          {/* Dedicated Course Top Navigation Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToAllSubjects}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-bold text-slate-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← All Subjects</span>
              </button>

              <div className="h-5 w-px bg-slate-200 hidden sm:block" />

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Academic LMS</span>
                <span>/</span>
                <span className="font-bold text-slate-900 font-mono">
                  {currentAssignment.subjectOffering.subject.code}
                </span>
                <span>-</span>
                <span className="text-slate-700 font-medium truncate max-w-xs">
                  {currentAssignment.subjectOffering.subject.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 hidden md:inline">Jump to Course:</span>
              <select
                value={currentAssignment.id}
                onChange={(e) => handleSelectSubject(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.subjectOffering.subject.code} - {a.subjectOffering.subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dedicated Course Workspace */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header of Active Subject */}
            <div className="p-6 border-b border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-mono font-bold">
                      {currentAssignment.subjectOffering.subject.code}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {currentAssignment.faculty.department?.name || "Academic Department"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-2">
                    {currentAssignment.subjectOffering.subject.name}
                </h2>
                  <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Course Instructors:</span>
                    {currentAssignment.allFaculty && currentAssignment.allFaculty.length > 1 ? (
                      currentAssignment.allFaculty.map((f, i) => (
                        <span key={f.id || i} className="inline-flex items-center gap-1">
                          <strong className="text-white">{f.fullName}</strong>
                          {f.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-[10px] text-indigo-200 font-bold">
                              Lead
                            </span>
                          )}
                          {i < currentAssignment.allFaculty!.length - 1 && <span className="text-slate-400">•</span>}
                        </span>
                      ))
                    ) : (
                      <strong className="text-white">{currentAssignment.faculty.user.fullName}</strong>
                    )}
                  </div>
              </div>

              {/* Syllabus Speedometer Pill */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/10 flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-300">Syllabus Covered</div>
                  <div className="text-lg font-black text-white">{completedTopics} / {totalTopics} Topics</div>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-white/20"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-emerald-400 transition-all duration-1000"
                      fill="transparent"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 - (125.6 * syllabusPercentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-white">{syllabusPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
              <button
                onClick={() => handleTabChange("materials")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "materials"
                    ? "bg-white text-slate-900 shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Course Materials ({currentAssignment.courseMaterials.length})</span>
              </button>

              <button
                onClick={() => handleTabChange("topics")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "topics"
                    ? "bg-white text-slate-900 shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Lecture Plan &amp; Syllabus ({totalTopics})</span>
              </button>

              <button
                onClick={() => handleTabChange("questions")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "questions"
                    ? "bg-white text-slate-900 shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Question Bank ({currentAssignment.subjectOffering.subject.questionBankItems.length})</span>
              </button>

              <button
                onClick={() => handleTabChange("quizzes")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "quizzes"
                    ? "bg-white text-slate-900 shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-rose-500" />
                <span>Section CBT Quizzes ({currentAssignment.courseQuizzes.length})</span>
              </button>
            </div>
          </div>

          {/* Tab Filter Bar (Unit Selector) */}
          <div className="p-4 px-6 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Unit:
              </span>
              {(["ALL", 1, 2, 3, 4, 5] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    selectedUnit === u
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {u === "ALL" ? "All Units" : `Unit ${u}`}
                </button>
              ))}
            </div>

            {activeTab === "questions" && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-500 mr-1">Difficulty:</span>
                {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                      difficultyFilter === d
                        ? d === "EASY"
                          ? "bg-emerald-600 text-white"
                          : d === "MEDIUM"
                          ? "bg-amber-600 text-white"
                          : d === "HARD"
                          ? "bg-rose-600 text-white"
                          : "bg-slate-800 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =====================================================================
              TAB CONTENT 1: COURSE MATERIALS (OPTION A WITH INLINE PDF VIEWER)
              ===================================================================== */}
          {activeTab === "materials" && (
            <div className="p-6">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Course Materials Uploaded Yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Your faculty member will upload unit lecture notes, slides, and syllabus documents here shortly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((mat) => {
                    const isPdf =
                      mat.fileUrl.toLowerCase().endsWith(".pdf") ||
                      mat.fileName.toLowerCase().endsWith(".pdf") ||
                      mat.type === "LECTURE_NOTES_PDF" ||
                      mat.type === "SYLLABUS_COPY";
                    const isPpt =
                      mat.fileUrl.toLowerCase().endsWith(".ppt") ||
                      mat.fileUrl.toLowerCase().endsWith(".pptx") ||
                      mat.fileName.toLowerCase().endsWith(".ppt") ||
                      mat.fileName.toLowerCase().endsWith(".pptx") ||
                      mat.type === "SLIDES_PPT";
                    const isVideo =
                      mat.type === "VIDEO_LECTURE" ||
                      Boolean(getEmbedUrl(mat.fileUrl)) ||
                      Boolean(mat.fileUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i));
                    const isExternalLink = mat.fileUrl.startsWith("http");

                    return (
                      <div
                        key={mat.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px]">
                              UNIT {mat.unitNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                isVideo
                                  ? "bg-rose-50 text-rose-600 font-extrabold"
                                  : isPpt
                                  ? "bg-amber-50 text-amber-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {isVideo ? "Video Lecture" : mat.type.replace(/_/g, " ")}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm mt-3 line-clamp-2">
                            {mat.title}
                          </h3>
                          {mat.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {mat.description}
                            </p>
                          )}

                          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>Uploaded {new Date(mat.createdAt).toLocaleDateString()}</span>
                            {Boolean(mat.fileSize && mat.fileSize > 0) && (
                              <span>• {((mat.fileSize || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                          {isVideo ? (
                            <button
                              onClick={() => handleViewMaterial(mat)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Watch Lecture</span>
                            </button>
                          ) : isPdf ? (
                            <button
                              onClick={() => handleViewMaterial(mat)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Read in Browser</span>
                            </button>
                          ) : isPpt ? (
                            <button
                              onClick={() => handleViewMaterial(mat)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Slides</span>
                            </button>
                          ) : (
                            <a
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Resource</span>
                            </a>
                          )}

                          {!isExternalLink && (
                            <a
                              href={mat.fileUrl}
                              download={mat.fileName}
                              onClick={() => handleDownloadMaterial(mat)}
                              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB CONTENT 2: LECTURE PLAN & SYLLABUS TOPICS TRACKER
              ===================================================================== */}
          {activeTab === "topics" && (
            <div className="p-6">
              {/* Official Course Syllabus / Lecture Plan Document if Uploaded by Faculty */}
              {currentAssignment.courseMaterials
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
                    : "Official Course Syllabus (PDF)";

                  return (
                    <div
                      key={syl.id}
                      className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shadow-md border border-white/10"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                          <FileText className="w-6 h-6 text-indigo-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/30 text-indigo-200 font-mono">
                              {badgeLabel}
                            </span>
                            <span className="text-[11px] text-slate-300">
                              {syl.fileSize ? `${(syl.fileSize / (1024 * 1024)).toFixed(2)} MB` : "PDF Document"}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm sm:text-base text-white mt-1">{syl.title}</h4>
                          <p className="text-xs text-slate-300">Institutional syllabus and lecture plan for this course</p>
                        </div>
                      </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleViewMaterial(syl)}
                        className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View Document</span>
                      </button>
                      <a
                        href={syl.fileUrl}
                        download={syl.fileName}
                        onClick={() => handleDownloadMaterial(syl)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                );
              })}

              {currentAssignment.lecturePlanTopics.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Lecture Plan Not Published</p>
                  <p className="text-xs text-slate-500 mt-1">
                    The detailed topic-by-topic teaching schedule will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5]
                    .filter((u) => (selectedUnit === "ALL" ? true : u === selectedUnit))
                    .map((unit) => {
                      const unitTopics = currentAssignment.lecturePlanTopics.filter(
                        (t) => t.unitNumber === unit
                      );
                      if (unitTopics.length === 0) return null;

                      const completed = unitTopics.filter((t) => t.status === "COMPLETED").length;
                      const unitPct = Math.round((completed / unitTopics.length) * 100);

                      return (
                        <div key={unit} className="border border-slate-200 rounded-2xl overflow-hidden">
                          <div className="p-4 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                              <h3 className="font-bold text-sm text-slate-900">
                                Unit {unit} Syllabus Modules
                              </h3>
                              <span className="text-xs text-slate-400">
                                ({completed} of {unitTopics.length} covered)
                              </span>
                            </div>
                            <span
                              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                                unitPct === 100
                                  ? "bg-emerald-100 text-emerald-800"
                                  : unitPct > 0
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {unitPct}% Covered
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {unitTopics.map((topic, idx) => (
                              <div
                                key={topic.id}
                                className="p-3.5 px-5 flex items-center justify-between text-xs hover:bg-slate-50/50 transition"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-slate-400 font-semibold w-6">
                                    #{idx + 1}
                                  </span>
                                  <div>
                                    <p className="font-bold text-slate-800">{topic.topicTitle}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                      <span>Planned: {new Date(topic.plannedDate).toLocaleDateString()}</span>
                                      {topic.deliveryMode && <span>• {topic.deliveryMode}</span>}
                                      {topic.actualDate && (
                                        <span>• Completed on {new Date(topic.actualDate).toLocaleDateString()}</span>
                                      )}
                                    </div>

                                    {/* Topic Materials Attachments */}
                                    {topic.materials && topic.materials.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1.5">
                                        {topic.materials.map((tm) => (
                                          <button
                                            key={tm.id}
                                            onClick={() => handleViewMaterial(tm)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold hover:bg-indigo-100 transition"
                                          >
                                            <Eye className="w-3 h-3" />
                                            <span>{tm.title}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  {topic.status === "COMPLETED" ? (
                                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Covered
                                    </span>
                                  ) : topic.status === "IN_PROGRESS" ? (
                                    <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                                      <Clock className="w-3.5 h-3.5" /> In Progress
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium px-2 py-1">
                                      Upcoming
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB CONTENT 3: SELF-STUDY QUESTION BANK WITH DIFFICULTY
              ===================================================================== */}
          {activeTab === "questions" && (
            <div className="p-6">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Questions Found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try selecting another unit or difficulty filter above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((q, idx) => {
                    const isRevealed = revealedAnswers[q.id];
                    const optionsList = Array.isArray(q.options)
                      ? q.options
                      : typeof q.options === "string"
                      ? JSON.parse(q.options || "[]")
                      : [];

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-indigo-200 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              Q{idx + 1}.
                            </span>
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
                            {q.bloomsLevel && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                • {q.bloomsLevel}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-600">{q.marks} Mark(s)</span>
                        </div>

                        <p className="text-sm font-bold text-slate-900 mt-3 whitespace-pre-wrap leading-relaxed">
                          {q.questionText}
                        </p>

                        {/* MCQ Options Display */}
                        {q.type === "MCQ" && optionsList.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                            {optionsList.map((opt: string, optIdx: number) => {
                              const isCorrect = isRevealed && optIdx === q.correctOption;
                              const optLetter = String.fromCharCode(65 + optIdx);
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-500 font-bold text-emerald-900"
                                      : "bg-slate-50/60 border-slate-200 text-slate-700"
                                  }`}
                                >
                                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                                    {optLetter}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reveal Answer Toggle */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() =>
                              setRevealedAnswers((prev) => ({
                                ...prev,
                                [q.id]: !prev[q.id],
                              }))
                            }
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isRevealed ? "Hide Solution" : "Reveal Answer & Solution"}</span>
                          </button>
                        </div>

                        {/* Revealed Solution Box */}
                        {isRevealed && (
                          <div className="mt-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
                            {q.correctOption !== null && q.correctOption !== undefined && (
                              <p className="font-extrabold text-emerald-900">
                                Correct Answer: Option {String.fromCharCode(65 + q.correctOption)}
                              </p>
                            )}
                            {q.explanation ? (
                              <p className="text-emerald-800 leading-relaxed">{q.explanation}</p>
                            ) : (
                              <p className="text-emerald-700 italic">Self-study practice item.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB CONTENT 4: SECTION CBT QUIZZES
              ===================================================================== */}
          {activeTab === "quizzes" && (
            <div className="p-6">
              {currentAssignment.courseQuizzes.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Award className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No CBT Quizzes Scheduled</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Continuous evaluation quizzes assigned by your faculty will be presented here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentAssignment.courseQuizzes.map((quiz) => {
                    const latestAttempt = quiz.attempts[0];
                    const hasCompleted = !!latestAttempt;

                    return (
                      <div
                        key={quiz.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-extrabold text-[10px]">
                              ONLINE CBT
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              {quiz.durationMinutes} Mins Duration
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-base mt-3">{quiz.title}</h3>

                          <div className="mt-4 grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">Questions</div>
                              <div className="font-extrabold text-slate-800 mt-0.5">
                                {quiz.questions.length}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">Max Marks</div>
                              <div className="font-extrabold text-slate-800 mt-0.5">
                                {quiz.totalMarks}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          {hasCompleted ? (
                            <div className="w-full flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                  Your Score
                                </span>
                                <span className="text-sm font-black text-emerald-600">
                                  {latestAttempt.score} / {quiz.totalMarks}
                                </span>
                              </div>
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" /> Attempt Recorded
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartQuiz(quiz)}
                              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>Start Timed Quiz ({quiz.durationMinutes}m)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}

      {/* =========================================================================
          IN-BROWSER PDF VIEWER MODAL (RESPONSIVE FOR SMARTPHONES & DESKTOP)
          ========================================================================= */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800/20">
            {/* Modal Header */}
            <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
                  UNIT {previewMaterial.unitNumber}
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md sm:max-w-xl">
                    {previewMaterial.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">{previewMaterial.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewMaterial.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={previewMaterial.fileUrl}
                  download={previewMaterial.fileName}
                  onClick={() => handleDownloadMaterial(previewMaterial)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Styled Document Presentation for Video, PDF & PPT */}
            {(() => {
              const fname = previewMaterial.fileName.toLowerCase();
              const embedUrl = getEmbedUrl(previewMaterial.fileUrl);
              const isDirectVideo = Boolean(previewMaterial.fileUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i));
              const isVideo = previewMaterial.type === "VIDEO_LECTURE" || Boolean(embedUrl) || isDirectVideo;
              const isPpt =
                fname.endsWith(".ppt") ||
                fname.endsWith(".pptx") ||
                previewMaterial.type === "SLIDES_PPT";

              if (isVideo) {
                return (
                  <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                      {/* Responsive 16:9 Video Player */}
                      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative flex items-center justify-center">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={previewMaterial.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : isDirectVideo ? (
                          <video
                            src={previewMaterial.fileUrl}
                            controls
                            className="w-full h-full object-contain"
                          >
                            Your browser does not support HTML5 video playback.
                          </video>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
                            <Play className="w-16 h-16 text-rose-500 mb-4" />
                            <h4 className="text-lg font-bold mb-2">Video Lecture Stream</h4>
                            <p className="text-xs text-slate-400 max-w-md mb-4 truncate">{previewMaterial.fileUrl}</p>
                            <a
                              href={previewMaterial.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition"
                            >
                              Open Video Link
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Video Information & Instructor Notes */}
                      <div className="w-full mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase">
                              Video Lecture
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Unit {previewMaterial.unitNumber}</span>
                          </div>
                          <h4 className="font-bold text-base text-white">{previewMaterial.title}</h4>
                          {previewMaterial.description && (
                            <p className="text-xs text-slate-300 mt-1 max-w-2xl">{previewMaterial.description}</p>
                          )}
                        </div>
                        <a
                          href={previewMaterial.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 border border-white/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in New Tab</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              if (isPpt) {
                return (
                  <div className="flex-1 bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                        <FileText className="w-10 h-10 text-white" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase mb-2">
                        PowerPoint Slide Deck
                      </span>
                      <h4 className="font-black text-lg sm:text-xl text-white mb-2">
                        {previewMaterial.title}
                      </h4>
                      <p className="text-xs text-slate-300 mb-6">
                        {previewMaterial.fileName}{" "}
                        {previewMaterial.fileSize
                          ? `(${(previewMaterial.fileSize / (1024 * 1024)).toFixed(2)} MB)`
                          : ""}
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                        <a
                          href={previewMaterial.fileUrl}
                          download={previewMaterial.fileName}
                          onClick={() => handleDownloadMaterial(previewMaterial)}
                          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Slide Deck (.pptx)</span>
                        </a>
                        <a
                          href={previewMaterial.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open in App</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex-1 bg-slate-100 relative">
                  <object
                    data={`${previewMaterial.fileUrl}#toolbar=1&navpanes=0`}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <iframe
                      src={`${previewMaterial.fileUrl}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0"
                      title={previewMaterial.title}
                    />
                  </object>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* =========================================================================
          ACTIVE TIMED QUIZ ROOM MODAL (WITH ANTI-CHEAT PROCTORING)
          ========================================================================= */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto border border-slate-200">
            {/* Header: Quiz title, timer, and tab-switch counter */}
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                  Online Proctored CBT Exam
                </span>
                <h2 className="text-xl font-black text-white">{activeQuiz.title}</h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Live Countdown */}
                <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="font-mono font-bold text-sm text-white">
                    {Math.floor(quizTimeRemaining / 60)}:
                    {(quizTimeRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                {/* Tab switch anti-cheat badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                    tabSwitches > 0
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Tab Switches: {tabSwitches}</span>
                </div>
              </div>
            </div>

            {/* Anti-cheat Warning Alert Banner */}
            {showTabSwitchWarning && (
              <div className="bg-rose-600 text-white p-3 px-6 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Warning: Navigating away from the quiz tab has been logged in your official activity audit feed!
                  </span>
                </div>
                <button
                  onClick={() => setShowTabSwitchWarning(false)}
                  className="text-white hover:underline text-[11px] ml-3"
                >
                  Acknowledge
                </button>
              </div>
            )}

            {/* Quiz Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
              {quizSubmittedResult ? (
                /* Result Screen */
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-100 text-emerald-600">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Quiz Completed!</h3>
                  <p className="text-sm text-slate-500">
                    Your answers have been securely recorded and evaluated.
                  </p>

                  <div className="max-w-xs mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-sm">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">Score:</span>
                      <span className="font-extrabold text-slate-900">
                        {quizSubmittedResult.score} / {activeQuiz.totalMarks}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-200">
                      <span>Proctor Tab Switches:</span>
                      <span className="font-mono font-bold text-slate-700">
                        {quizSubmittedResult.tabSwitchCount || tabSwitches}
                      </span>
                    </div>
                  </div>

                  {activeQuiz.questions.some(
                    (qq) =>
                      qq.questionBank.type === "SHORT_ANSWER" ||
                      qq.questionBank.type === "LONG_ANSWER" ||
                      !qq.questionBank.options ||
                      (Array.isArray(qq.questionBank.options) && qq.questionBank.options.length === 0)
                  ) && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium max-w-sm mx-auto">
                      📝 <strong>Note:</strong> MCQ auto-score shown above. Your descriptive answers have been submitted securely to your faculty for grading.
                    </p>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setActiveQuiz(null);
                        window.location.reload();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                    >
                      Close Exam Room
                    </button>
                  </div>
                </div>
              ) : (
                /* Question Paper */
                <div className="space-y-6">
                  {activeQuiz.questions.map((qq, qIdx) => {
                    const q = qq.questionBank;
                    const selectedVal = quizAnswers[q.id];
                    const optionsList = Array.isArray(q.options)
                      ? q.options
                      : typeof q.options === "string"
                      ? JSON.parse(q.options || "[]")
                      : [];

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-indigo-600">
                            Question {qIdx + 1} of {activeQuiz.questions.length}
                          </span>
                          <span className="font-bold text-slate-500">{qq.marks || q.marks} Mark(s)</span>
                        </div>

                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                          {q.questionText}
                        </p>

                        {/* Descriptive Question vs Multiple Choice */}
                        {optionsList.length === 0 || q.type === "SHORT_ANSWER" || q.type === "LONG_ANSWER" ? (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>Your Answer / Explanation:</span>
                                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                  {q.type === "LONG_ANSWER" ? "Descriptive / Long Answer" : "Short Answer"}
                                </span>
                              </label>
                              <span className="text-[10px] font-mono text-slate-400">
                                Word count: {selectedVal ? String(selectedVal).trim().split(/\s+/).filter(Boolean).length : 0} words
                              </span>
                            </div>
                            <textarea
                              rows={q.type === "LONG_ANSWER" ? 6 : 4}
                              value={typeof selectedVal === "string" ? selectedVal : ""}
                              onChange={(e) =>
                                setQuizAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                              placeholder="Type your explanation, formula, derivation, or answer here..."
                              className="w-full p-3.5 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-y font-sans leading-relaxed shadow-sm"
                            />
                            <div className="flex items-center justify-between text-[11px]">
                              <span>
                                {selectedVal && String(selectedVal).trim().length > 0 ? (
                                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    ✓ Answer drafted ({String(selectedVal).trim().length} chars)
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">No answer written yet</span>
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 mt-3">
                            {optionsList.map((opt: string, optIdx: number) => {
                              const isChecked = selectedVal === optIdx;
                              const optLetter = String.fromCharCode(65 + optIdx);

                              return (
                                <label
                                  key={optIdx}
                                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition text-xs font-medium ${
                                    isChecked
                                      ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold"
                                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    value={optIdx}
                                    checked={isChecked}
                                    onChange={() =>
                                      setQuizAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: optIdx,
                                      }))
                                    }
                                    className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                  />
                                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                    {optLetter}
                                  </span>
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quiz Footer */}
            {!quizSubmittedResult && (
              <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Answered:{" "}
                  <strong className="text-slate-900">
                    {
                      activeQuiz.questions.filter((qq) => {
                        const ans = quizAnswers[qq.questionBank.id];
                        if (ans === undefined || ans === null) return false;
                        if (typeof ans === "string") return ans.trim().length > 0;
                        return true;
                      }).length
                    }
                  </strong>{" "}
                  of {activeQuiz.questions.length}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: "Abandon Timed Quiz?",
                        description: "Are you sure you want to exit? Your answers will not be recorded and this will count as an incomplete attempt.",
                        confirmText: "Exit Quiz",
                        type: "danger",
                        onConfirm: () => {
                          setActiveQuiz(null);
                          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                        },
                      });
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmittingQuiz}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingQuiz ? "Submitting..." : "Submit Exam"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styled Confirmation Dialog (Replaces native browser confirm dialogs) */}
      {confirmDialog.isOpen && (
        <CustomModal
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText || "Confirm"}
          type={confirmDialog.type || "danger"}
          onConfirm={confirmDialog.onConfirm}
        />
      )}

      {/* Styled Error Alert Modal (Replaces native browser alert dialogs) */}
      {errorDialog.isOpen && (
        <CustomModal
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog((prev) => ({ ...prev, isOpen: false }))}
          title={errorDialog.title}
          description={errorDialog.description}
          cancelText="Dismiss"
          type="warning"
        />
      )}
    </div>
  );
}
