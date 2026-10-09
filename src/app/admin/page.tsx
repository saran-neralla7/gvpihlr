import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import Link from "next/link";
import {
  Calendar,
  Layers,
  GraduationCap,
  Building2,
  Users,
  BookOpen,
  CheckSquare,
  BarChart3,
  Shield,
  Key,
  Clock,
  Award,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function AdminHubPage() {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    redirect("/dashboard");
  }

  const adminCards = [
    {
      title: "Academic Years",
      description: "Manage academic years, terms, and active university sessions.",
      icon: Calendar,
      iconColor: "text-emerald-600 bg-emerald-50",
      link: "/admin/master?tab=sections",
    },
    {
      title: "Schools",
      description: "Manage university schools (SCSE, SENG, SSCI) and deaneries.",
      icon: Building2,
      iconColor: "text-indigo-600 bg-indigo-50",
      link: "/admin/master?tab=schools",
    },
    {
      title: "Departments",
      description: "Manage academic and common service teaching departments.",
      icon: Building2,
      iconColor: "text-blue-600 bg-blue-50",
      link: "/admin/master?tab=departments",
    },
    {
      title: "Degree Programs",
      description: "Manage undergraduate and postgraduate degree programs.",
      icon: BookOpen,
      iconColor: "text-purple-600 bg-purple-50",
      link: "/admin/master?tab=programs",
    },
    {
      title: "Sections",
      description: "Manage class sections, student capacity, and semester offerings.",
      icon: Layers,
      iconColor: "text-rose-600 bg-rose-50",
      link: "/admin/master?tab=sections",
    },
    {
      title: "Lab Batches",
      description: "Manage practical and laboratory batches per section.",
      icon: Layers,
      iconColor: "text-fuchsia-600 bg-fuchsia-50",
      link: "/admin/master?tab=sections",
    },
    {
      title: "Curriculum Subjects",
      description: "Manage theory and laboratory subjects, credits, and syllabus.",
      icon: BookOpen,
      iconColor: "text-cyan-600 bg-cyan-50",
      link: "/admin/master?tab=subjects",
    },
    {
      title: "Faculty Master",
      description: "Manage teaching faculty, short names (KR, PS), and assignments.",
      icon: Users,
      iconColor: "text-amber-600 bg-amber-50",
      link: "/admin/master?tab=faculty",
    },
    {
      title: "Students Master",
      description: "Manage enrolled student profiles, roll numbers, and admissions.",
      icon: GraduationCap,
      iconColor: "text-rose-600 bg-rose-50",
      link: "/admin/master?tab=students",
    },
    {
      title: "Mark Attendance",
      description: "Super Admin university oversight to mark or review live sessions.",
      icon: CheckSquare,
      iconColor: "text-emerald-600 bg-emerald-50",
      link: "/attendance",
    },
    {
      title: "Attendance Reports",
      description: "Generate section registers, < 75% defaulters, PDF & Excel export.",
      icon: BarChart3,
      iconColor: "text-blue-600 bg-blue-50",
      link: "/reports",
    },
    {
      title: "System Audit Logs",
      description: "Inspect immutable security logs and attendance edit history.",
      icon: Shield,
      iconColor: "text-slate-700 bg-slate-100",
      link: "/admin/audit-logs",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B2545]">
            University Administration &amp; Governance
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Administration Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Institutional master controls for academic structure, faculty assignments, and attendance governance.
          </p>
        </div>

        <Link
          href="/admin/master"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-bold shadow-xs transition"
        >
          <Database className="w-4 h-4" />
          <span>Open Master Data Manager</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>

      {/* Grid of Administration Cards (Matching Screenshot 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {adminCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all hover:border-blue-400 flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${card.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                <span>Manage &amp; Configure →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
