"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  ChevronDown,
  Bell,
  KeyRound,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Database,
  Shield,
  GraduationCap,
  ArrowLeft,
  Home,
} from "lucide-react";

interface HeaderProps {
  user?: {
    fullName: string;
    username: string;
    roles: string[];
    facultyId?: string | null;
    studentId?: string | null;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAcademicYearMenu, setShowAcademicYearMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/login";
    }
  };

  const isSuperAdmin = user?.roles.includes("SUPER_ADMIN");
  const isFacultyUser = user?.roles.includes("FACULTY") && !isSuperAdmin;
  const isStudentUser =
    user?.roles.includes("STUDENT") && !isSuperAdmin && !user?.roles.includes("FACULTY");

  // Determine user pill display text
  let userPillText = user?.username || "Guest";
  if (isSuperAdmin) {
    userPillText = "admin";
  } else if (isFacultyUser) {
    // If faculty, display initials/short name like GKC or KR
    const initials = user?.fullName
      ? user.fullName
          .replace("Dr. ", "")
          .replace("Mr. ", "")
          .replace("Mrs. ", "")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 3)
      : "FAC";
    userPillText = initials || "FAC";
  } else if (isStudentUser) {
    userPillText = user?.username || "5241411095";
  }

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      {/* Main Single-Line Clean Institutional Topbar matching screenshots */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Left: University Seal & Campus Management System branding */}
        <Link
          href={isStudentUser ? "/student" : user ? "/dashboard" : "/login"}
          className="flex items-center gap-3 group flex-shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/gvpihlr.png"
              alt="GVPIHLR University Crest"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors">
              GVPIHLR<span className="text-blue-600 font-black">(A)</span>
            </span>
            <span className="hidden md:inline-block text-[11px] font-semibold text-slate-400 border-l border-slate-200 pl-2">
              Campus Management System
            </span>
          </div>
        </Link>

        {/* Right side controls matching screenshots */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Academic Year Dropdown Pill (Hidden on tiny screens) */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setShowAcademicYearMenu(!showAcademicYearMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-semibold text-slate-700 transition"
              >
                <span>2026-2027</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showAcademicYearMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs">
                  <div className="px-3 py-1 font-bold text-slate-400 text-[10px] uppercase">
                    Academic Year
                  </div>
                  <button
                    onClick={() => setShowAcademicYearMenu(false)}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 font-semibold text-blue-700 flex items-center justify-between"
                  >
                    <span>2026-2027</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  </button>
                  <button
                    onClick={() => setShowAcademicYearMenu(false)}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-500 font-medium"
                  >
                    2025-2026 (Archive)
                  </button>
                </div>
              )}
            </div>

            {/* Back & Home buttons matching Screenshot 2 */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Back</span>
              </button>

              <Link
                href="/dashboard"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 transition"
                title="Dashboard Home"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </div>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
                aria-label="Notifications"
                title="6 unread notifications"
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center border border-white">
                  6
                </span>
              </button>
            </div>

            {/* User Identifier Pill (e.g. admin, GKC, 5241411095) */}
            <div className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 tracking-wide select-none">
              {userPillText}
            </div>

            {/* Key Icon (Change Password / Security) */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition hidden xs:flex items-center justify-center"
              title="Account Security & Password"
              aria-label="Security"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Red Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 border border-rose-200 rounded-xl transition shadow-xs"
              title="Sign Out of Campus Management System"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile Hamburger (Only on mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition sm:hidden ml-1"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#132E5C] transition"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && user && (
        <div className="sm:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-900">{user.fullName}</div>
              <div className="text-[10px] text-slate-500">{user.username}</div>
            </div>
            <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              AY 2026-27
            </div>
          </div>

          <div className="space-y-1 text-xs font-semibold">
            {isSuperAdmin && (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  <span>Executive Dashboard</span>
                </Link>
                <Link
                  href="/attendance"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Mark Attendance</span>
                </Link>
                <Link
                  href="/admin/master"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <Database className="w-4 h-4 text-[#0B2545]" />
                  <span>Master Data Governance</span>
                </Link>
                <Link
                  href="/reports"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>University Reports</span>
                </Link>
                <Link
                  href="/admin/audit-logs"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <Shield className="w-4 h-4 text-[#8B1528]" />
                  <span>Audit Logs</span>
                </Link>
              </>
            )}

            {isFacultyUser && (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  <span>Faculty Gateway</span>
                </Link>
                <Link
                  href="/attendance"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Mark Attendance</span>
                </Link>
                <Link
                  href="/reports"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Class Registers</span>
                </Link>
              </>
            )}

            {isStudentUser && (
              <Link
                href="/student"
                onClick={closeMobile}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <GraduationCap className="w-4 h-4 text-rose-600" />
                <span>My Profile &amp; Attendance</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
