"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, ArrowRight, Lock, User, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [selectedPortal, setSelectedPortal] = useState<"FACULTY" | "STUDENT" | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePortalSelect = (portal: "FACULTY" | "STUDENT") => {
    setSelectedPortal(portal);
    setErrorMessage(null);
    if (portal === "FACULTY") {
      setUsername("admin");
      setPassword("Admin@1234");
    } else {
      setUsername("5241411014");
      setPassword("Student@1234");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          loginType: selectedPortal || "FACULTY",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-12">
      {/* Title as in official portal screenshot */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight uppercase">
          CAMPUS MANAGEMENT SYSTEM
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
          Gayatri Vidya Parishad Institute of Higher Learning & Research (GVPIHLR)
        </p>
      </div>

      {/* Dual Portal Selection Cards (Matching Screenshot) */}
      {!selectedPortal ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl w-full">
          {/* Card 1: Faculty / Staff Login */}
          <div
            onClick={() => handlePortalSelect("FACULTY")}
            className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center hover:border-blue-400"
          >
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Faculty Login
            </h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Access for Staff and Administrators
            </p>
            <div className="mt-6 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Proceed to Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 2: Student / Parent Login */}
          <div
            onClick={() => handlePortalSelect("STUDENT")}
            className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center hover:border-rose-400"
          >
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
              Student Login
            </h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Access for Students and Parents
            </p>
            <div className="mt-6 flex items-center text-xs font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
              <span>Proceed to Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Authentication Form */
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedPortal === "FACULTY"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {selectedPortal === "FACULTY" ? (
                  <Users className="w-5 h-5" />
                ) : (
                  <GraduationCap className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedPortal === "FACULTY" ? "Faculty & Staff Login" : "Student & Parent Login"}
                </h3>
                <p className="text-xs text-slate-500">GVPIHLR University ERP</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPortal(null)}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 underline"
            >
              Change
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {selectedPortal === "FACULTY"
                  ? "Faculty Short Name (e.g. KR, PS) or Username"
                  : "Student Roll Number"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedPortal === "FACULTY" ? "e.g. KR, PS, VN, or admin" : "e.g. 5241411014"
                  }
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#0B2545] hover:bg-[#132E5C] text-white text-sm font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <span>Sign In Securely</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel for Evaluators */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Instant Demo Access:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedPortal("FACULTY");
                  setUsername("admin");
                  setPassword("Admin@1234");
                }}
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left font-medium text-slate-700"
              >
                <div className="font-bold text-[#0B2545]">Super Admin</div>
                <div className="text-[10px] text-slate-400">admin / Admin@1234</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPortal("FACULTY");
                  setUsername("KR");
                  setPassword("Faculty@1234");
                }}
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left font-medium text-slate-700"
              >
                <div className="font-bold text-[#0B2545]">Dr. KR (Math)</div>
                <div className="text-[10px] text-emerald-700 font-bold">KR / Faculty@1234</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPortal("FACULTY");
                  setUsername("PS");
                  setPassword("Faculty@1234");
                }}
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left font-medium text-slate-700"
              >
                <div className="font-bold text-[#0B2545]">Dr. PS (CSE)</div>
                <div className="text-[10px] text-emerald-700 font-bold">PS / Faculty@1234</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPortal("STUDENT");
                  setUsername("5241411014");
                  setPassword("Student@1234");
                }}
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left font-medium text-slate-700"
              >
                <div className="font-bold text-[#8B1528]">Student Siddartha</div>
                <div className="text-[10px] text-slate-400">5241411014 / Student@1234</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
