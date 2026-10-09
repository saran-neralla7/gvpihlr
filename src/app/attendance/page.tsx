import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getFacultyClasses } from "@/lib/attendanceActions";
import Link from "next/link";
import { BookOpen, Users, Calendar, ArrowRight, Layers, ShieldCheck } from "lucide-react";

export default async function FacultyClassesPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  // 1. STRICT STUDENT ISOLATION: Students cannot access faculty attendance marking
  const isStudentUser =
    session.roles.includes("STUDENT") &&
    !session.roles.includes("SUPER_ADMIN") &&
    !session.roles.includes("FACULTY");

  if (isStudentUser) {
    redirect("/student");
  }

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN");
  const { assignments, academicYear, error } = await getFacultyClasses();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
            {isSuperAdmin ? "Institutional Attendance Oversight" : "Faculty Academic Portal"}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {isSuperAdmin ? "University Class Offerings & Sessions" : "My Assigned Classes"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isSuperAdmin
              ? "Super Administrator monitoring — Inspect active sections or conduct administrative sessions."
              : "Select your assigned class below to record daily lecture or laboratory attendance."}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-[#0B2545]" />
          <span>Academic Year: <strong>{academicYear?.code || "2026-27"}</strong></span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments && assignments.length > 0 ? (
          assignments.map((assignment) => {
            const subject = assignment.subjectOffering.subject;
            const program = assignment.subjectOffering.program;
            const section = assignment.section;
            const isLab = subject.type === "LAB";

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-400"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        isLab
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {subject.type} • {subject.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {subject.credits} Credits
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {subject.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0B2545]" />
                      <span>{program.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <span>Year {assignment.subjectOffering.year}</span>
                      <span>•</span>
                      <span>Sem {assignment.subjectOffering.semester}</span>
                      <span>•</span>
                      <strong className="text-slate-800 font-bold">Section {section.name}</strong>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Faculty: <strong>{assignment.faculty.user.fullName}</strong></span>
                      <span className="text-[#8B1528] font-bold">({assignment.faculty.shortName})</span>
                    </div>

                    {isLab && section.labBatches && section.labBatches.length > 0 && (
                      <div className="mt-2 text-[11px] text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                        {section.labBatches.length} Configurable Lab Batches Available
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/attendance/mark/${assignment.id}`}
                    className="w-full py-2.5 px-4 bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                  >
                    <span>{isSuperAdmin ? "Monitor / Mark Attendance" : "Mark Attendance"}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No classes found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
