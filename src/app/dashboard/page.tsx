import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import Link from "next/link";
import {
  GraduationCap,
  CheckSquare,
  FileText,
  Users,
  Calendar,
  Bookmark,
  Database,
  Shield,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  // 1. STRICT STUDENT ISOLATION: Students are always forwarded to their own portal
  const isStudentUser =
    session.roles.includes("STUDENT") &&
    !session.roles.includes("SUPER_ADMIN") &&
    !session.roles.includes("FACULTY");

  if (isStudentUser) {
    redirect("/student");
  }

  const isSuperAdmin = session.roles.includes("SUPER_ADMIN");
  const isFacultyUser = session.roles.includes("FACULTY") && !isSuperAdmin;

  // =========================================================================
  // VIEW A: SUPER ADMIN DASHBOARD (Only Active Modules In Use)
  // =========================================================================
  if (isSuperAdmin) {
    const adminCards = [
      {
        title: "Students",
        description: "Manage student profiles, enrollments, and attendance.",
        badgeColor: "bg-blue-600",
        icon: GraduationCap,
        link: "/admin/students",
      },
      {
        title: "Faculty",
        description: "Manage faculty records, assignments, and workload.",
        badgeColor: "bg-indigo-600",
        icon: Users,
        link: "/admin/faculty",
      },
      {
        title: "Mark Attendance",
        description: "Mark student attendance (Academic).",
        badgeColor: "bg-red-600",
        icon: CheckSquare,
        link: "/attendance",
      },
      {
        title: "Reports",
        description: "Daily consolidated and subject-wise attendance registers & exports.",
        badgeColor: "bg-teal-600",
        icon: FileText,
        link: "/reports",
      },
      {
        title: "Time Tables",
        description: "Manage class schedules, periods, and academic calendar.",
        badgeColor: "bg-purple-600",
        icon: Calendar,
        link: "/admin/master?tab=sections",
        hasModuleLink: true,
      },
      {
        title: "Subjects",
        description: "Manage course catalog, electives, and curriculum.",
        badgeColor: "bg-pink-600",
        icon: Bookmark,
        link: "/admin/master?tab=subjects",
      },
      {
        title: "User Management",
        description: "Manage faculty and student system user accounts, credentials, and roles.",
        badgeColor: "bg-purple-700",
        icon: Users,
        link: "/admin/users",
      },
      {
        title: "Master Governance",
        description: "Academic years, schools, departments, and degree programs.",
        badgeColor: "bg-[#0B2545]",
        icon: Database,
        link: "/admin/master",
      },
      {
        title: "System Audit Logs",
        description: "Inspect immutable security logs and attendance edit history.",
        badgeColor: "bg-slate-700",
        icon: Shield,
        link: "/admin/audit-logs",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Main Title */}
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Campus Management System
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Welcome back, <strong className="text-blue-600 font-bold">admin</strong>. University Governance &amp; Attendance Command Center.
          </p>
        </div>

        {/* Clean Card Grid matching Screenshot 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminCards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <Link
                key={idx}
                href={c.link}
                className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Top row: small colored icon box on left, faint watermark on right */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${c.badgeColor} shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <Icon className="w-7 h-7 text-slate-200/60 group-hover:text-slate-300 transition-colors" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-blue-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {c.hasModuleLink && (
                  <div className="mt-4 pt-2 text-xs font-bold text-blue-600 group-hover:underline">
                    Open Module →
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: FACULTY GATEWAY (ATTENDANCE MODULE ONLY)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Title & Welcome */}
      <div className="space-y-1">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Faculty Gateway
        </h2>
        <p className="text-sm sm:text-base font-bold text-blue-600">
          Welcome, {session.fullName} • Attendance Portal
        </p>
      </div>

      {/* Pure Attendance Cards for Faculty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/attendance"
          className="group bg-white rounded-2xl border border-slate-200/80 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                <CheckSquare className="w-5 h-5" />
              </div>
              <CheckSquare className="w-8 h-8 text-slate-200/60" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mt-5 group-hover:text-red-700 transition-colors">
              Mark Attendance
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Mark daily lecture and lab attendance for your assigned sections. Fast [ALL PRESENT] toggle and absentees marking.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Open Attendance Register →</span>
          </div>
        </Link>

        <Link
          href="/reports"
          className="group bg-white rounded-2xl border border-slate-200/80 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <FileText className="w-8 h-8 text-slate-200/60" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mt-5 group-hover:text-cyan-700 transition-colors">
              Attendance History &amp; Edits
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Review previously submitted session records and perform audited corrections with mandatory justification.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>View History &amp; Edit Logs →</span>
          </div>
        </Link>

        <Link
          href="/reports"
          className="group bg-white rounded-2xl border border-slate-200/80 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <FileText className="w-8 h-8 text-slate-200/60" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mt-5 group-hover:text-teal-700 transition-colors">
              Class Attendance Registers
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Generate cumulative attendance registers, view &lt;75% defaulters, and export official PDF / Excel registers.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Generate Reports &amp; Exports →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
