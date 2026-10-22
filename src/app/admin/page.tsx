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
  CreditCard,
} from "lucide-react";

export default async function AdminHubPage() {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");
  const isAcademicAdminUser = session?.roles.includes("ACADEMIC_ADMIN") || session?.roles.includes("DEAN");

  if (!session || (!isSuperAdminUser && !isOfficeUser && !isAcademicAdminUser)) {
    redirect("/dashboard");
  }

  const allAdminCards = [
    {
      title: "Administration",
      description: "University academic structure, terms, and optional Lab Batches (default: no batches, add Batch 1/Batch 2 as needed).",
      icon: Layers,
      iconColor: "text-indigo-600 bg-indigo-50",
      link: "/admin/master",
      officeAllowed: true,
      badge: "Batches & Structure",
    },
    {
      title: "Attendance Reports",
      description: "Generate section registers, multi-level defaulters (<75%, <60%), and export PDF & Excel.",
      icon: BarChart3,
      iconColor: "text-blue-600 bg-blue-50",
      link: "/reports",
      officeAllowed: true,
    },
    {
      title: "Day-Wise Analytics",
      description: "Live daily present & absent counts across all sections with hour-by-hour period drilldown.",
      icon: BarChart3,
      iconColor: "text-emerald-600 bg-emerald-50",
      link: "/admin/day-analytics",
      officeAllowed: true,
      badge: "Hourly Breakdown",
    },
    {
      title: "Manage Students",
      description: "Dedicated student directory, search, category filters, and student profile inspection.",
      icon: GraduationCap,
      iconColor: "text-blue-600 bg-blue-50",
      link: "/admin/students",
      officeAllowed: true,
    },
    {
      title: "ID Cards",
      description: "Official student identity cards generator. Preview sample ID card, single student search by roll number, or bulk print by school & program.",
      icon: CreditCard,
      iconColor: "text-rose-600 bg-rose-50",
      link: "/admin/id-cards",
      officeAllowed: true,
      badge: "Official PVC Generator",
    },
    {
      title: "Manage Faculty",
      description: "Dedicated faculty profiles, designations, department filter, and assigned subjects.",
      icon: Users,
      iconColor: "text-purple-600 bg-purple-50",
      link: "/admin/faculty",
      officeAllowed: true,
    },
    {
      title: "Class Timetables",
      description: "Master weekly schedules, lecture periods, and laboratory practical allocations.",
      icon: Clock,
      iconColor: "text-amber-600 bg-amber-50",
      link: "/admin/timetable",
      officeAllowed: true,
    },
    {
      title: "Subject Catalog",
      description: "Curriculum course codes, short names, theory and lab subjects, and credits under R1.",
      icon: BookOpen,
      iconColor: "text-cyan-600 bg-cyan-50",
      link: "/admin/subjects",
      officeAllowed: true,
    },
    {
      title: "LMS & Syllabus Speedometer",
      description: "Institutional syllabus completion rate, unit lecture progress, study materials, and student audit telemetry.",
      icon: BookOpen,
      iconColor: "text-indigo-600 bg-indigo-50",
      link: "/admin/lms",
      officeAllowed: true,
      badge: "HOD Speedometer",
    },
    {
      title: "Academic Years & Sections",
      description: "Manage university terms, class sections, capacity, and semester offerings.",
      icon: Calendar,
      iconColor: "text-emerald-600 bg-emerald-50",
      link: "/admin/master?tab=sections",
      officeAllowed: true,
    },
    {
      title: "Schools & Departments",
      description: "Manage university schools (SCSE, SENG, SSCI) and teaching departments.",
      icon: Building2,
      iconColor: "text-indigo-600 bg-indigo-50",
      link: "/admin/master?tab=departments",
      officeAllowed: true,
    },
    {
      title: "Degree Programs",
      description: "Manage undergraduate and postgraduate degree programs.",
      icon: Award,
      iconColor: "text-purple-600 bg-purple-50",
      link: "/admin/master?tab=programs",
      officeAllowed: true,
    },
    {
      title: "Mark Attendance",
      description: "Institutional university oversight to conduct or review live sessions.",
      icon: CheckSquare,
      iconColor: "text-emerald-600 bg-emerald-50",
      link: "/attendance",
      officeAllowed: false,
    },
    {
      title: "User Management",
      description: "Manage faculty and student accounts, reset passwords, and system user roles.",
      icon: Users,
      iconColor: "text-purple-600 bg-purple-50",
      link: "/admin/users",
      officeAllowed: false,
    },
    {
      title: "System Audit Logs",
      description: "Real-time tamper-resistant activity logs, IP address, device, and timestamp tracking.",
      icon: Shield,
      iconColor: "text-slate-700 bg-slate-100",
      link: "/admin/audit-logs",
      officeAllowed: isSuperAdminUser,
    },
  ];

  const adminCards = (isSuperAdminUser || isAcademicAdminUser)
    ? allAdminCards
    : allAdminCards.filter((c) => c.officeAllowed);

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
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform ${card.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {card.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {card.badge}
                    </span>
                  )}
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
