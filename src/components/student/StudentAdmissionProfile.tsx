"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  Lock,
  Unlock,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap,
  MapPin,
  Users,
  Bus,
  Award,
  Loader2,
} from "lucide-react";

interface StudentAdmissionProfileProps {
  initialData: any;
  isEditable: boolean;
}

export default function StudentAdmissionProfile({
  initialData,
  isEditable,
}: StudentAdmissionProfileProps) {
  const [formData, setFormData] = useState<any>({ ...initialData });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (field: string, value: any) => {
    if (!isEditable) return;
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Admission profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit Status Banner */}
      {isEditable ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Profile Editing is Active</div>
              <div className="text-xs text-emerald-700/90 font-medium">
                The administration has opened profile editing. You may update your admission and personal details below.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            EDITABLE
          </span>
        </div>
      ) : (
        <div className="bg-slate-100 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Profile Editing is Locked</div>
              <div className="text-xs text-slate-500 font-medium">
                Your admission details are locked by the administration. Contact the academic office if any details are incorrect.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-700 border border-slate-300">
            READ-ONLY
          </span>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal & Demographics */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal & Demographic Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Roll Number</label>
              <input
                type="text"
                disabled
                value={formData.rollNumber || ""}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={formData.fullName || ""}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Aadhaar Number</label>
              <input
                type="text"
                disabled={!isEditable}
                maxLength={12}
                placeholder="12-digit Aadhaar"
                value={formData.registerNumber || ""}
                onChange={(e) => handleChange("registerNumber", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Date of Birth</label>
              <input
                type="date"
                disabled={!isEditable}
                value={formData.dateOfBirth ? String(formData.dateOfBirth).slice(0, 10) : ""}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Gender</label>
              <select
                disabled={!isEditable}
                value={formData.gender || "MALE"}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Blood Group</label>
              <select
                disabled={!isEditable}
                value={formData.bloodGroup || ""}
                onChange={(e) => handleChange("bloodGroup", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Caste Category</label>
              <select
                disabled={!isEditable}
                value={formData.casteCategory || "OC"}
                onChange={(e) => handleChange("casteCategory", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              >
                {["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST", "OTHER"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">EWS Category</label>
              <select
                disabled={!isEditable}
                value={formData.ews || "NO"}
                onChange={(e) => handleChange("ews", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Special Category (PH/NCC/CAP)</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="e.g. NCC / Sports / None"
                value={formData.specialCategory || ""}
                onChange={(e) => handleChange("specialCategory", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Nationality</label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.nationality || "Indian"}
                onChange={(e) => handleChange("nationality", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Religion</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="e.g. Hindu / Muslim / Christian"
                value={formData.religion || ""}
                onChange={(e) => handleChange("religion", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">State / Region</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={!isEditable}
                  placeholder="State"
                  value={formData.state || "Andhra Pradesh"}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
                <input
                  type="text"
                  disabled={!isEditable}
                  placeholder="Region (AU/SVU)"
                  value={formData.region || "AU"}
                  onChange={(e) => handleChange("region", e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: College Facilities */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Bus className="w-4 h-4 text-indigo-600" />
            <span>Campus Facilities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Transport Facility (College Bus)</div>
                <div className="text-[11px] text-slate-500">Do you commute using the college bus service?</div>
              </div>
              <select
                disabled={!isEditable}
                value={formData.transportFacility ? "YES" : "NO"}
                onChange={(e) => handleChange("transportFacility", e.target.value === "YES")}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700"
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Hostel Facility</div>
                <div className="text-[11px] text-slate-500">Are you staying at the campus hostel?</div>
              </div>
              <select
                disabled={!isEditable}
                value={formData.hostelFacility ? "YES" : "NO"}
                onChange={(e) => handleChange("hostelFacility", e.target.value === "YES")}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700"
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Parents Information */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Parents Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Father's Name</label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.fatherName || formData.parentName || ""}
                onChange={(e) => handleChange("fatherName", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Father's Occupation</label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.fatherOccupation || ""}
                onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Father's Aadhaar Number</label>
              <input
                type="text"
                disabled={!isEditable}
                maxLength={12}
                value={formData.fatherAadhaar || ""}
                onChange={(e) => handleChange("fatherAadhaar", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Mother's Name</label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.motherName || ""}
                onChange={(e) => handleChange("motherName", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Mother's Occupation</label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.motherOccupation || ""}
                onChange={(e) => handleChange("motherOccupation", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Mother's Aadhaar Number</label>
              <input
                type="text"
                disabled={!isEditable}
                maxLength={12}
                value={formData.motherAadhaar || ""}
                onChange={(e) => handleChange("motherAadhaar", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Parent Mobile Number</label>
              <input
                type="text"
                disabled={!isEditable}
                maxLength={15}
                value={formData.parentPhone || ""}
                onChange={(e) => handleChange("parentPhone", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Parent Email</label>
              <input
                type="email"
                disabled={!isEditable}
                value={formData.parentEmail || ""}
                onChange={(e) => handleChange("parentEmail", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Student Personal Mobile</label>
              <input
                type="text"
                disabled={!isEditable}
                maxLength={15}
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Residential & Permanent Addresses */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Addresses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">Permanent Address</label>
              <textarea
                rows={3}
                disabled={!isEditable}
                placeholder="House No, Street, Village/Town, District"
                value={formData.permanentAddress || ""}
                onChange={(e) => handleChange("permanentAddress", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Pincode:</span>
                <input
                  type="text"
                  disabled={!isEditable}
                  maxLength={6}
                  placeholder="6 digits"
                  value={formData.permanentPincode || ""}
                  onChange={(e) => handleChange("permanentPincode", e.target.value)}
                  className="w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700">Correspondence Address</label>
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("correspondenceAddress", formData.permanentAddress);
                      handleChange("correspondencePincode", formData.permanentPincode);
                    }}
                    className="text-[11px] text-blue-600 font-bold hover:underline"
                  >
                    Same as Permanent
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                disabled={!isEditable}
                placeholder="Current Address for postal communication"
                value={formData.correspondenceAddress || ""}
                onChange={(e) => handleChange("correspondenceAddress", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Pincode:</span>
                <input
                  type="text"
                  disabled={!isEditable}
                  maxLength={6}
                  placeholder="6 digits"
                  value={formData.correspondencePincode || ""}
                  onChange={(e) => handleChange("correspondencePincode", e.target.value)}
                  className="w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Previous Academic Details (10th & 12th) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Previous Education (10th SSC & 12th Intermediate)</span>
          </div>

          <div className="space-y-4">
            {/* 10th Standard */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="font-bold text-slate-800 text-xs mb-2">10th Class (SSC / Matriculation)</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Board / Council</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="e.g. AP SSC / CBSE / ICSE"
                    value={formData.tenthBoard || ""}
                    onChange={(e) => handleChange("tenthBoard", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Medium of Study</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="English / Telugu"
                    value={formData.tenthMedium || "English"}
                    onChange={(e) => handleChange("tenthMedium", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Marks % or CGPA</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="e.g. 92.5 / 10.0"
                    value={formData.tenthPercentage || ""}
                    onChange={(e) => handleChange("tenthPercentage", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Year of Passing</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="e.g. 2022"
                    value={formData.tenthPassYear || ""}
                    onChange={(e) => handleChange("tenthPassYear", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* 12th Standard */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="font-bold text-slate-800 text-xs mb-2">12th Class (Intermediate / +2)</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Board / Council</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="e.g. BIE AP / CBSE / TS BIE"
                    value={formData.twelfthBoard || ""}
                    onChange={(e) => handleChange("twelfthBoard", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Medium of Study</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="English / Telugu"
                    value={formData.twelfthMedium || "English"}
                    onChange={(e) => handleChange("twelfthMedium", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Inter Percentage / Marks</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="e.g. 95.4%"
                    value={formData.interPercentage || ""}
                    onChange={(e) => handleChange("interPercentage", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Year of Passing</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="e.g. 2024"
                    value={formData.twelfthPassYear || ""}
                    onChange={(e) => handleChange("twelfthPassYear", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Entrance Exam Qualifications */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Award className="w-4 h-4 text-rose-600" />
            <span>Entrance Examination & Admission Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Qualifying Exam</label>
              <select
                disabled={!isEditable}
                value={formData.qualifyingExam || "EAPCET"}
                onChange={(e) => handleChange("qualifyingExam", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="EAPCET">AP EAPCET</option>
                <option value="JEE">JEE Main</option>
                <option value="MANAGEMENT">Management Quota</option>
                <option value="NRI">NRI Quota</option>
                <option value="OTHER">Other Entrance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">EAPCET Rank</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="e.g. 14500"
                value={formData.eapcetRank || ""}
                onChange={(e) => handleChange("eapcetRank", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">EAPCET Hall Ticket No.</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="Hall Ticket No."
                value={formData.eapcetHallTicket || ""}
                onChange={(e) => handleChange("eapcetHallTicket", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">JEE Main Rank</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="AIR Rank"
                value={formData.jeeRank || ""}
                onChange={(e) => handleChange("jeeRank", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">JEE NTA Score / Percentile</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="e.g. 91.24"
                value={formData.jeeScore || formData.jeePercentile || ""}
                onChange={(e) => handleChange("jeeScore", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">JEE Hall Ticket No.</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="JEE Admit Card / Roll No."
                value={formData.jeeHallTicket || ""}
                onChange={(e) => handleChange("jeeHallTicket", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button (Only when editable) */}
        {isEditable && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Admission Profile</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
