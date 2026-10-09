"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle, Loader2 } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  type?: "info" | "warning" | "danger" | "success";
  isLoading?: boolean;
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  type = "info",
  isLoading = false,
}: CustomModalProps) {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      btnColor: "bg-[#0B2545] hover:bg-[#132E5C] text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      btnColor: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    danger: {
      icon: XCircle,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      btnColor: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  }[type];

  const IconComponent = typeConfig.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.bgColor} ${typeConfig.iconColor}`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-slate-900 leading-snug">{title}</h3>
            {description && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
          >
            {cancelText}
          </button>

          {onConfirm && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`px-5 py-2 text-xs font-black rounded-xl shadow-sm transition flex items-center gap-2 ${typeConfig.btnColor} disabled:opacity-50`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{confirmText || "Confirm"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
