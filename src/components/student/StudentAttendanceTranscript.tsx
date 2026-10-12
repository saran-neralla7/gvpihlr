"use client";

import Image from "next/image";
import { Printer, X, Download, ShieldCheck, AlertTriangle, CheckCircle2, User, Phone, Mail } from "lucide-react";

export interface StudentTranscriptProps {
  student: {
    fullName: string;
    rollNumber: string;
    registerNumber?: string | null;
    programName: string;
    programCode?: string;
    schoolName?: string;
    year: number;
    semester: number;
    sectionName: string;
    academicYear?: string;
    email?: string | null;
    phone?: string | null;
    parentName?: string | null;
    parentPhone?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
  };
  attendance: {
    totalHeld: number;
    totalAttended: number;
    totalAbsent: number;
    overallPercentage: number;
    isDefaulter: boolean;
    subjectBreakdown: Array<{
      subjectId: string;
      code: string;
      name: string;
      type: string;
      facultyName: string;
      held: number;
      attended: number;
      absent: number;
      percentage: number;
    }>;
    absenceLog?: Array<{
      date: string;
      period: number;
      subjectName: string;
      subjectCode: string;
    }>;
  };
  onClose?: () => void;
}

export default function StudentAttendanceTranscript({
  student,
  attendance,
  onClose,
}: StudentTranscriptProps) {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isEligible = attendance.overallPercentage >= 75.0;
  const isCondonable = attendance.overallPercentage >= 60.0 && attendance.overallPercentage < 75.0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible">
      {/* Top Floating Action Bar (Hidden in Print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B2545] hover:bg-[#132E5C] text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Transcript</span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            title="Close Transcript"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Official Institutional Dossier Sheet (A4 Sheet Formatting) */}
      <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 my-auto text-slate-900 print:shadow-none print:border-none print:p-4 print:max-w-full print:rounded-none">
        {/* Style block dedicated to official transcript print */}
        <style jsx global>{`
          @media print {
            @page {
              size: portrait;
              margin: 10mm;
            }
            body {
              background: white !important;
            }
          }
        `}</style>

        {/* 1. Official Institutional Header with Logo */}
        <div className="border-b-2 border-[#0B2545] pb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
              <Image
                src="/gvpihlr.png"
                alt="GVPIHLR University Crest"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>

            <div className="text-center flex-1 space-y-1">
              <h1 className="text-base sm:text-xl font-black text-[#0B2545] tracking-tight uppercase">
                GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-600">
                (Deemed to be University under Section 3 of the UGC Act, 1956)
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                School of Medical Education &amp; Engineering Sciences • Visakhapatnam - 530048, AP, India
              </p>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-blue-50 border border-blue-200">
                <span className="text-[11px] sm:text-xs font-black tracking-wider text-blue-950 uppercase">
                  OFFICIAL STUDENT ATTENDANCE TRANSCRIPT &amp; STATUTORY COMPLIANCE DOSSIER
                </span>
              </div>
            </div>

            {/* Document Verification Seal Placeholder */}
            <div className="w-20 hidden sm:flex flex-col items-center justify-center text-center border border-slate-200 rounded-xl p-2 bg-slate-50 text-[9px] text-slate-400 font-mono">
              <span className="font-bold text-slate-600">ACADEMIC AUDIT</span>
              <span className="text-[8px] mt-0.5">VERIFIED</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-4 pt-2 border-t border-slate-100">
            <span>Ref No: GVPIHLR/ATT-TR/{student.rollNumber}/{new Date().getFullYear()}</span>
            <span>Date of Issue: {currentDate}</span>
          </div>
        </div>

        {/* 2. Student Bio & Academic Profile Metadata */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Name</span>
              <span className="font-black text-slate-900 text-sm block mt-0.5">{student.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Roll / Reg Number</span>
              <span className="font-mono font-black text-blue-900 text-sm block mt-0.5">{student.rollNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Program &amp; Branch</span>
              <span className="font-bold text-slate-800 block mt-0.5">{student.programName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Section</span>
              <span className="font-bold text-slate-800 block mt-0.5">
                Year {student.year} • Sem {student.semester} • Sec {student.sectionName}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Academic Year</span>
              <span className="font-bold text-slate-800 block mt-0.5">{student.academicYear || "2026-2027"}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Phone</span>
              <span className="font-mono font-medium text-slate-800 block mt-0.5">{student.phone || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Parent / Guardian Name</span>
              <span className="font-bold text-slate-800 block mt-0.5">{student.parentName || "Parent / Guardian"}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Parent Phone</span>
              <span className="font-mono font-medium text-slate-800 block mt-0.5">{student.parentPhone || "—"}</span>
            </div>
          </div>
        </div>

        {/* 3. Statutory Compliance Summary (Executive Box) */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Classes Held</span>
            <span className="text-xl font-black text-slate-900 font-mono block mt-1">{attendance.totalHeld}</span>
          </div>
          <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Attended</span>
            <span className="text-xl font-black text-emerald-700 font-mono block mt-1">{attendance.totalAttended}</span>
          </div>
          <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/60 text-center">
            <span className="text-[10px] font-bold uppercase text-rose-800 block">Absent</span>
            <span className="text-xl font-black text-rose-700 font-mono block mt-1">{attendance.totalAbsent}</span>
          </div>
          <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/60 text-center">
            <span className="text-[10px] font-bold uppercase text-blue-900 block">Aggregate Rate</span>
            <span className="text-xl font-black text-blue-900 font-mono block mt-1">{attendance.overallPercentage}%</span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-center flex flex-col justify-center">
            <span className="text-[9px] font-bold uppercase text-slate-500 block">Statutory Verdict</span>
            <span
              className={`text-xs font-black px-2 py-1 rounded-full mt-1 ${
                isEligible
                  ? "bg-emerald-100 text-emerald-800"
                  : isCondonable
                  ? "bg-amber-100 text-amber-900"
                  : "bg-rose-100 text-rose-900"
              }`}
            >
              {isEligible ? "ELIGIBLE" : isCondonable ? "CONDONABLE" : "DEFAULTER"}
            </span>
          </div>
        </div>

        {/* 4. Subject-Wise Compliance Ledger */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0B2545]">
              Course / Subject-Wise Attendance Breakdown
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">UGC 75% Statutory Standard</span>
          </div>

          <table className="w-full text-left text-xs border border-slate-300 rounded-xl overflow-hidden">
            <thead className="bg-[#0B2545] text-white uppercase text-[9px] font-bold">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3 w-20">Code</th>
                <th className="py-2.5 px-3">Faculty In-Charge</th>
                <th className="py-2.5 px-2 text-center w-14">Held</th>
                <th className="py-2.5 px-2 text-center w-14">Attended</th>
                <th className="py-2.5 px-2 text-center w-16">Percentage</th>
                <th className="py-2.5 px-3 text-center w-24">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {attendance.subjectBreakdown.map((sub, idx) => {
                const subEligible = sub.held > 0 ? sub.percentage >= 75.0 : true;
                return (
                  <tr key={sub.subjectId} className="even:bg-slate-50/50">
                    <td className="py-2 px-3 text-center font-mono text-slate-500 text-[10px]">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-2 px-3 font-mono text-slate-500 text-[10px]">{sub.code}</td>
                    <td className="py-2 px-3 text-slate-700">{sub.facultyName}</td>
                    <td className="py-2 px-2 text-center font-mono font-bold">{sub.held}</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700">{sub.attended}</td>
                    <td className="py-2 px-2 text-center font-mono font-black">
                      <span className={subEligible ? "text-emerald-700" : "text-rose-700"}>
                        {sub.percentage}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                          subEligible
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {subEligible ? "Qualified" : "Shortage"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Statutory Declaration Note */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-[10px] text-amber-900 space-y-1">
          <p className="font-bold">Institutional Statutory Attendance Regulation Note:</p>
          <p className="text-slate-600 leading-relaxed">
            As per the Academic Regulations of Gayatri Vidya Parishad Institute of Higher Learning and Research, a student is required to secure a minimum of 75% aggregate attendance to be eligible for Semester-End University Examinations. Condonation of attendance between 60% and 74% may be granted by the Academic Council strictly on valid medical grounds, accompanied by necessary medical certificates and payment of the prescribed condonation fee. Students with below 60% attendance are detained.
          </p>
        </div>

        {/* 6. Official Signatures Section */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-4 gap-6 text-center text-xs font-bold text-slate-800">
          <div className="space-y-12">
            <div className="h-10 border-b border-dashed border-slate-400" />
            <div>
              <p className="font-extrabold text-slate-900">Student Signature</p>
              <p className="text-[10px] font-normal text-slate-500">Acknowledged</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="h-10 border-b border-dashed border-slate-400" />
            <div>
              <p className="font-extrabold text-slate-900">Parent / Guardian</p>
              <p className="text-[10px] font-normal text-slate-500">Signature</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="h-10 border-b border-dashed border-slate-400" />
            <div>
              <p className="font-extrabold text-slate-900">Class In-Charge / Mentor</p>
              <p className="text-[10px] font-normal text-slate-500">Verified &amp; Counselled</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="h-10 border-b border-dashed border-slate-400" />
            <div>
              <p className="font-extrabold text-[#0B2545]">Head of Department (HOD)</p>
              <p className="text-[10px] font-normal text-slate-500">Dean of Academic Affairs</p>
            </div>
          </div>
        </div>

        {/* Official Footer Note */}
        <div className="mt-8 text-center text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-3">
          This transcript is an official computer-generated document issued by GVPIHLR Central Academic ERP Management System.
        </div>
      </div>
    </div>
  );
}
