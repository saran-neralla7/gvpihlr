"use client";

import Image from "next/image";

interface GVPLoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "fullscreen";
  message?: string;
  subtext?: string;
}

export default function GVPLoadingSpinner({
  size = "md",
  message = "Loading...",
  subtext = "Gayatri Vidya Parishad Institute of Higher Learning & Research",
}: GVPLoadingSpinnerProps) {
  // Dimensions based on size
  const logoDimensions = {
    sm: { box: "w-14 h-14", img: 32, ring: "w-16 h-16", border: "border-2" },
    md: { box: "w-20 h-20", img: 48, ring: "w-24 h-24", border: "border-[3px]" },
    lg: { box: "w-28 h-28", img: 68, ring: "w-32 h-32", border: "border-4" },
    fullscreen: { box: "w-24 h-24", img: 56, ring: "w-28 h-28", border: "border-[3px]" },
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner & Logo Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Dual-Color Ring */}
        <div
          className={`absolute ${logoDimensions.ring} rounded-full ${logoDimensions.border} border-slate-200 border-t-[#0B2545] border-r-[#8B1528] animate-spin`}
          style={{ animationDuration: "1.1s" }}
        />

        {/* Outer Secondary Glowing Pulse Ring */}
        <div
          className={`absolute ${logoDimensions.ring} rounded-full border border-blue-500/20 animate-ping opacity-40`}
          style={{ animationDuration: "2.4s" }}
        />

        {/* Center Logo Card with Soft Shadow */}
        <div
          className={`${logoDimensions.box} rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center p-2 transition-transform`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/gvpihlr.png"
              alt="GVPIHLR University Crest"
              width={logoDimensions.img}
              height={logoDimensions.img}
              className="object-contain drop-shadow-xs"
              priority
            />
          </div>
        </div>
      </div>

      {/* Typography */}
      {message && (
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-tight text-slate-800 animate-pulse">
            {message}
          </p>
          {subtext && size !== "sm" && (
            <p className="text-[11px] font-medium text-slate-400 max-w-xs">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (size === "fullscreen") {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center py-12">
        {content}
      </div>
    );
  }

  return content;
}
