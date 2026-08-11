import React, { useEffect } from "react";
import { X, AlertCircle, Info, CheckCircle } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  variant?: "danger" | "info" | "success" | "warning";
}

export default function AlertModal({
  isOpen,
  title,
  message,
  onClose,
  variant = "danger",
}: AlertModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variants = {
    danger: {
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-900/50",
      text: "text-red-600 dark:text-red-400",
      btn: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20",
      icon: <AlertCircle className="w-6 h-6 text-red-500" />
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-900/50",
      text: "text-amber-600 dark:text-amber-400",
      btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
      icon: <AlertCircle className="w-6 h-6 text-amber-500" />
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-900/50",
      text: "text-blue-600 dark:text-blue-400",
      btn: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20",
      icon: <Info className="w-6 h-6 text-blue-500" />
    },
    success: {
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-900/50",
      text: "text-green-600 dark:text-green-400",
      btn: "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    }
  };

  const active = variants[variant];
  const defaultTitle = variant === "danger" ? "Erreur" : variant === "warning" ? "Attention" : variant === "success" ? "Succès" : "Information";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-encre/40 dark:bg-encre/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-sm bg-white dark:bg-anthracite border border-beige/60 dark:border-anthracite/80 rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${active.bg} ${active.border} border`}>
                {active.icon}
              </div>
              <h3 className="text-lg font-bold text-encre dark:text-ivoire font-display">
                {title || defaultTitle}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="text-encre/40 hover:text-encre dark:text-ivoire/40 dark:hover:text-ivoire transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-encre/70 dark:text-ivoire/70 leading-relaxed mb-8 whitespace-pre-wrap">
            {message}
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95 ${active.btn}`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
