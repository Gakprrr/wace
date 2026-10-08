import React from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | string;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirmation",
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmer",
  cancelText = "Annuler"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-anthracite rounded-[1.5rem] shadow-2xl w-full max-w-md p-6 mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display font-bold text-encre dark:text-ivoire">{title}</h3>
          <button onClick={onCancel} className="text-encre/50 hover:text-encre dark:text-ivoire/50 dark:hover:text-ivoire transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-encre/70 dark:text-ivoire/70 mb-8 font-light text-sm">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-sm font-semibold border border-beige/60 dark:border-anthracite/60 text-encre/80 dark:text-ivoire/80 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#d8b652] text-white hover:bg-[#c3a242] transition-colors shadow-md"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
