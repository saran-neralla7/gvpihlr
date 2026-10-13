"use client";

import React from "react";
import Image from "next/image";
import { User, Phone, Calendar, Hash, Building2 } from "lucide-react";

export interface StudentIdCardData {
  fullName: string;
  rollNumber: string;
  branch: string;
  parentName?: string | null;
  dateOfBirth?: string | null; // Formatted DD-MM-YYYY
  mobile?: string | null;
  photoUrl?: string | null;
  serialNumber?: string;
  signatureUrl?: string;
}

interface StudentIdCardProps {
  student: StudentIdCardData;
  className?: string;
}

export default function StudentIdCard({
  student,
  className = "",
}: StudentIdCardProps) {
  const {
    fullName = "GUDALA PAVANI",
    rollNumber = "26UEECE0053",
    branch = "ECE (VLSI Design and Technology)",
    parentName = "Gudala Kannarao",
    dateOfBirth = "22-11-2008",
    mobile = "7995414517",
    photoUrl = "/sample-student-pavani.jpg",
    serialNumber = `GVPIHLR${rollNumber ? rollNumber.replace(/[^a-zA-Z0-9]/g, "") : "202600446"}`,
    signatureUrl = "/sample-registrar-signature.png",
  } = student;

  return (
    <div
      className={`student-id-card relative bg-white border border-slate-300 rounded-[18px] shadow-lg overflow-hidden flex flex-col justify-between select-none print:shadow-none print:border-slate-400 ${className}`}
      style={{
        width: "330px",
        height: "520px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* =========================================================================
          TOP HEADER: Deep Royal Navy with Curved Bottom Wave
          ========================================================================= */}
      <div className="relative bg-[#0F2C59] text-white pt-2.5 pb-5 px-3 text-center overflow-hidden">
        {/* Estd. 2026 on Top Right */}
        <div className="absolute top-2 right-3 text-[10px] font-bold text-slate-100 tracking-wider">
          Estd. 2026
        </div>

        {/* University Crest / Emblem */}
        <div className="flex justify-center mb-1">
          <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-xs flex items-center justify-center">
            <img
              src="/gvpihlr.png"
              alt="GVPIHLR Crest"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Institution Title */}
        <h1 className="text-[19px] font-black tracking-wide text-white leading-tight uppercase">
          GVPIHLR
        </h1>

        {/* UGC Act Subtitle */}
        <p className="text-[8.5px] font-semibold text-slate-200 leading-tight mt-0.5">
          (Deemed to be University Under Distinct Category
          <br />
          Under Section 3 of the UGC Act, 1956)
        </p>

        {/* Campus Address & Contact */}
        <p className="text-[7.5px] font-medium text-slate-300 leading-tight mt-1">
          Kommadi, Madhurawada, Visakhapatnam - 530 048, A.P
        </p>
        <p className="text-[7.5px] font-medium text-slate-300 leading-tight">
          Ph: 0891-2739507, Email: office@gvpihlr.in
        </p>

        {/* Smooth Curved Wave Graphic Cutout Transition into White */}
        <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            viewBox="0 0 330 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-5 text-white"
            preserveAspectRatio="none"
          >
            <path
              d="M0 24C80 2 180 26 330 8V24H0Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          MIDDLE SECTION: Photo, Student Name, Details
          ========================================================================= */}
      <div className="flex-1 px-4 pt-1 pb-2 flex flex-col justify-between">
        {/* Passport Photo Frame */}
        <div className="flex justify-center -mt-2">
          <div className="w-[104px] h-[126px] bg-slate-100 rounded-xl border-2 border-[#0F2C59] shadow-xs overflow-hidden flex items-center justify-center relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <User className="w-10 h-10 text-slate-300 mb-1" />
                <span className="text-[9px] font-bold uppercase text-slate-400">Photo</span>
              </div>
            )}
          </div>
        </div>

        {/* Student Full Name in Bold Crimson */}
        <div className="text-center mt-2 mb-2">
          <h2 className="text-[15px] font-black text-[#991B1B] tracking-wider uppercase leading-tight truncate px-1">
            {fullName}
          </h2>
        </div>

        {/* Key-Value Details Table */}
        <div className="space-y-1.5 text-[11px] font-semibold text-slate-900 border-t border-b border-slate-100 py-2">
          {/* Branch */}
          <div className="flex items-start">
            <span className="w-28 font-bold text-[#0F2C59] flex-shrink-0">
              Branch
            </span>
            <span className="font-bold text-[#0F2C59] mr-2">:</span>
            <span className="font-bold text-[#1E3A8A] leading-tight flex-1">
              {branch}
            </span>
          </div>

          {/* Roll No. */}
          <div className="flex items-center">
            <span className="w-28 font-bold text-[#0F2C59] flex-shrink-0">
              Roll No.
            </span>
            <span className="font-bold text-[#0F2C59] mr-2">:</span>
            <span className="font-black text-[#1E3A8A] tracking-wide flex-1 font-mono">
              {rollNumber}
            </span>
          </div>

          {/* Parent's Name */}
          <div className="flex items-center">
            <span className="w-28 font-bold text-[#0F2C59] flex-shrink-0">
              Parent&apos;s Name
            </span>
            <span className="font-bold text-[#0F2C59] mr-2">:</span>
            <span className="font-bold text-[#1E3A8A] truncate flex-1">
              {parentName || "—"}
            </span>
          </div>

          {/* D.O.B */}
          <div className="flex items-center">
            <span className="w-28 font-bold text-[#0F2C59] flex-shrink-0">
              D.O.B
            </span>
            <span className="font-bold text-[#0F2C59] mr-2">:</span>
            <span className="font-bold text-[#1E3A8A] flex-1 font-mono">
              {dateOfBirth || "—"}
            </span>
          </div>

          {/* Mobile */}
          <div className="flex items-center">
            <span className="w-28 font-bold text-[#0F2C59] flex-shrink-0">
              Mobile
            </span>
            <span className="font-bold text-[#0F2C59] mr-2">:</span>
            <span className="font-bold text-[#1E3A8A] flex-1 font-mono">
              {mobile || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM FOOTER: Watermark, Registrar Signature & Curved Blue Wave
          ========================================================================= */}
      <div className="relative pt-1 pb-3 px-4 flex items-end justify-between bg-white">
        {/* Left: Watermark Serial Number */}
        <div className="text-left z-10">
          <span className="text-[8px] font-mono font-bold text-slate-400 tracking-wider">
            {serialNumber}
          </span>
        </div>

        {/* Right: Signature and Registrar-I/C text */}
        <div className="text-center flex flex-col items-center z-10">
          <div className="h-6 flex items-center justify-center">
            {signatureUrl ? (
              <img
                src={signatureUrl}
                alt="Registrar Signature"
                className="h-6 max-w-[90px] object-contain"
              />
            ) : (
              <div className="font-serif italic font-bold text-emerald-800 text-xs">
                Dr. Registrar
              </div>
            )}
          </div>
          <span className="text-[8.5px] font-extrabold text-[#0F2C59] tracking-wider uppercase mt-0.5">
            Registrar-I/C
          </span>
        </div>

        {/* Left Curved Wave Accent in Royal Navy */}
        <div className="absolute bottom-0 left-0 w-24 h-6 pointer-events-none opacity-90 overflow-hidden">
          <svg
            viewBox="0 0 100 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-[#0F2C59]"
          >
            <path
              d="M0 25C30 25 50 15 80 0H0V25Z"
              fill="#0F2C59"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
