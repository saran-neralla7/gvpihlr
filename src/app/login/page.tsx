"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, ArrowRight, Lock, User, AlertCircle, Loader2, Eye, EyeOff, Smartphone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [selectedPortal, setSelectedPortal] = useState<"FACULTY" | "STUDENT" | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [takeoverInfo, setTakeoverInfo] = useState<{
    activeDevice: string;
    activeSince: string;
  } | null>(null);

  useEffect(() => {
    try {
      const savedRemember = localStorage.getItem("gvpihlr_remember_me") === "true";
      if (savedRemember) {
        setRememberMe(true);
        const savedUser = localStorage.getItem("gvpihlr_saved_user");
        const savedPass = localStorage.getItem("gvpihlr_saved_pass");
        if (savedUser) setUsername(savedUser);
        if (savedPass) setPassword(savedPass);
      }
    } catch {}
  }, []);

  const handlePortalSelect = (portal: "FACULTY" | "STUDENT") => {
    setSelectedPortal(portal);
    setErrorMessage(null);
    setUsername("");
    setPassword("");
  };

  const handleLogin = async (e?: React.FormEvent, forceTakeover: boolean = false) => {
    if (e) e.preventDefault();
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
          forceTakeover,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.requiresTakeover) {
        setTakeoverInfo({
          activeDevice: data.activeDevice || "Another Device",
          activeSince: data.activeSince || "recently",
        });
        setIsLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      setTakeoverInfo(null);

      if (rememberMe) {
        try {
          localStorage.setItem("gvpihlr_remember_me", "true");
          localStorage.setItem("gvpihlr_saved_user", username.trim());
          localStorage.setItem("gvpihlr_saved_pass", password);
        } catch {}
      } else {
        try {
          localStorage.removeItem("gvpihlr_remember_me");
          localStorage.removeItem("gvpihlr_saved_user");
          localStorage.removeItem("gvpihlr_saved_pass");
        } catch {}
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
      {/* Institutional Title & Subtitle matching user specification */}
      <div className="text-center mb-8 sm:mb-12 max-w-4xl px-4 space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B2545] tracking-tight uppercase">
          GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH
        </h1>
        <p className="text-base sm:text-xl font-bold text-slate-700 tracking-wide">
          (Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956)
        </p>
        <div className="pt-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs sm:text-sm font-extrabold text-blue-950 uppercase tracking-wider shadow-2xs">
            LEARNING MANAGEMENT SYSTEM (LMS)
          </span>
        </div>
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
                    selectedPortal === "FACULTY" ? "e.g. KR, PS, VN, or admin" : "e.g. 26UECHE0001 or Roll Number"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-transparent font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "View password"}
                  title={showPassword ? "Hide password" : "View password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember password checkbox below the password field */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545] cursor-pointer"
                  />
                  <span>Remember password</span>
                </label>
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
        </div>
      )}

      {/* Single Device Session Takeover Modal */}
      {takeoverInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">Active Session Detected</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You are currently logged in from <strong className="text-slate-900">{takeoverInfo.activeDevice}</strong> (active since {takeoverInfo.activeSince}).
              </p>
              <p className="text-xs text-slate-500 mt-2 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl">
                University security policy restricts student logins to <strong>one active device</strong> at a time. Logging in here will immediately disconnect the other device.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTakeoverInfo(null);
                  setIsLoading(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLogin(undefined, true)}
                className="flex-1 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#132E5C] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>End &amp; Log In Here</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
