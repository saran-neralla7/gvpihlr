"use client";

import React from "react";
import { User } from "lucide-react";

export interface StudentIdCardData {
  fullName: string;
  rollNumber: string;
  branch: string;
  parentName?: string | null;
  dateOfBirth?: string | null; // Formatted DD-MM-YYYY
  mobile?: string | null;
  photoUrl?: string | null;
  serialNumber?: string;
  signatureUrl?: string | null;
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
    fullName = "SAMPLE STUDENT NAME",
    rollNumber = "26UCS0001",
    branch = "Computer Science and Engineering",
    parentName = "Sample Parent Name",
    dateOfBirth = "15-08-2008",
    mobile = "9876543210",
    photoUrl = null,
    serialNumber = `GVPIHLR${rollNumber ? rollNumber.replace(/[^a-zA-Z0-9]/g, "") : "202600001"}`,
    signatureUrl = null,
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
          TOP HEADER SECTION: Deep Royal Blue with Asymmetric Left Sweep Curve
          ========================================================================= */}
      <div className="relative bg-[#1A4384] text-white pt-2.5 pb-2 px-3 text-center overflow-hidden">
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

        {/* UGC Act Subtitle in Golden Yellow */}
        <p className="text-[8px] font-semibold text-[#FDE047] leading-tight mt-0.5">
          (Deemed to be University Under Distinct Category
          <br />
          Under Section 3 of the UGC Act, 1956)
        </p>

        {/* Campus Address & Contact */}
        <p className="text-[7.5px] font-medium text-slate-100 leading-tight mt-1">
          Kommadi, Madhurawada, Visakhapatnam - 530 048, A.P
        </p>
        <p className="text-[7.5px] font-medium text-slate-100 leading-tight">
          Ph: 0891-2739507, Email: office@gvpihlr.in
        </p>

        {/* Smooth Asymmetric Wave Cutout (curves lower on left, higher on right) */}
        <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            viewBox="0 0 330 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-7 text-white"
            preserveAspectRatio="none"
          >
            <path
              d="M0 35 C60 30 120 10 210 5 C270 2 310 8 330 0 L330 35 L0 35 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>

      {/* Blue side curve extending down on left behind photo */}
      <div className="absolute top-[148px] left-0 w-24 h-24 pointer-events-none z-0">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M0 0 C40 10 70 35 60 70 C50 95 20 100 0 100 Z"
            fill="#1A4384"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* =========================================================================
          MIDDLE SECTION: Photo, Student Name, Details Table
          ========================================================================= */}
      <div className="flex-1 px-4 pt-1 pb-1 flex flex-col justify-between relative z-10">
        {/* Passport Photo Frame */}
        <div className="flex justify-center -mt-2">
          <div className="w-[104px] h-[126px] bg-slate-50 rounded-[4px] border-[1.5px] border-[#475569] shadow-xs overflow-hidden flex items-center justify-center relative bg-white">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              /* Clean Neutral Avatar Placeholder (No Girl's Photo) */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 text-slate-400 p-2 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-300/80 flex items-center justify-center mb-1 shadow-inner">
                  <User className="w-9 h-9 text-slate-500" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                  PHOTO
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Student Full Name in Bold Red/Crimson */}
        <div className="text-center mt-1.5 mb-1">
          <h2 className="text-[15px] font-black text-[#B91C1C] tracking-wider uppercase leading-tight truncate px-1">
            {fullName}
          </h2>
        </div>

        {/* Key-Value Details Table */}
        <div className="space-y-1.5 text-[11px] font-semibold text-slate-900 border-t border-b border-slate-100 py-2">
          {/* Branch */}
          <div className="flex items-start">
            <span className="w-28 font-bold text-[#0F172A] flex-shrink-0">
              Branch
            </span>
            <span className="font-bold text-[#0F172A] mr-2">:</span>
            <span className="font-bold text-[#1D4ED8] leading-tight flex-1">
              {branch}
            </span>
          </div>

          {/* Roll No. */}
          <div className="flex items-center">
            <span className="w-28 font-bold text-[#0F172A] flex-shrink-0">
              Roll No.
            </span>
            <span className="font-bold text-[#0F172A] mr-2">:</span>
            <span className="font-black text-[#1D4ED8] tracking-wide flex-1 font-mono">
              {rollNumber}
            </span>
          </div>

          {/* Parent's Name */}
          <div className="flex items-center">
            <span className="w-28 font-bold text-[#0F172A] flex-shrink-0">
              Parent&apos;s Name
            </span>
            <span className="font-bold text-[#0F172A] mr-2">:</span>
            <span className="font-bold text-[#1D4ED8] truncate flex-1">
              {parentName || "—"}
            </span>
          </div>

          {/* D.O.B */}
          <div className="flex items-center">
            <span className="w-28 font-bold text-[#0F172A] flex-shrink-0">
              D.O.B
            </span>
            <span className="font-bold text-[#0F172A] mr-2">:</span>
            <span className="font-bold text-[#1D4ED8] flex-1 font-mono">
              {dateOfBirth || "—"}
            </span>
          </div>

          {/* Mobile */}
          <div className="flex items-center">
            <span className="w-28 font-bold text-[#0F172A] flex-shrink-0">
              Mobile
            </span>
            <span className="font-bold text-[#0F172A] mr-2">:</span>
            <span className="font-bold text-[#1D4ED8] flex-1 font-mono">
              {mobile || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM FOOTER: Clean Registrar-I/C & Bottom Blue Arc with Serial
          ========================================================================= */}
      <div className="relative pt-1 pb-1 px-4 flex items-end justify-between bg-white z-10">
        {/* Left: Empty space (serial number printed inside bottom blue bar below) */}
        <div className="text-left z-20 pb-2">
          {/* Left spacing */}
        </div>

        {/* Right: Signature Space (Blank for now) & Registrar-I/C */}
        <div className="text-center flex flex-col items-center z-20 pb-2">
          <div className="h-6 flex items-center justify-center">
            {signatureUrl ? (
              <img
                src={signatureUrl}
                alt="Registrar Signature"
                className="h-6 max-w-[90px] object-contain"
              />
            ) : (
              /* Clean blank space as instructed: signature will be provided later */
              <div className="h-5 w-16" />
            )}
          </div>
          <span className="text-[8.5px] font-extrabold text-[#0F172A] tracking-wider uppercase">
            Registrar-I/C
          </span>
        </div>

        {/* Bottom Curved Wave Band in Royal Blue */}
        <div className="absolute bottom-0 left-0 right-0 h-6 overflow-hidden pointer-events-none z-10">
          <svg
            viewBox="0 0 330 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-[#1A4384]"
            preserveAspectRatio="none"
          >
            <path
              d="M0 24 L0 4 C40 2 80 12 140 18 C200 24 280 16 330 20 L330 24 Z"
              fill="#1A4384"
            />
          </svg>
          {/* Serial Number in White Text inside bottom left blue band */}
          <div className="absolute bottom-0.5 left-3 text-[7.5px] font-mono font-bold text-white tracking-wider">
            {serialNumber}
          </div>
        </div>
      </div>
    </div>
  );
}
