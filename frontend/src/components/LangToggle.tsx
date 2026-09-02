"use client";

import React from "react";
import { useLang } from "@/lib/i18n/LangProvider";

interface LangToggleProps {
  /** Extra CSS classes for customisation */
  className?: string;
}

export function LangToggle({ className = "" }: LangToggleProps) {
  const { locale, toggleLocale } = useLang();

  return (
    <button
      onClick={toggleLocale}
      title={locale === "fr" ? "Switch to English" : "Passer en Français"}
      aria-label="Toggle language"
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
        border border-or/30 hover:border-or/60
        text-ivoire/70 hover:text-or
        transition-all duration-150 text-xs font-bold tracking-widest uppercase
        hover:bg-anthracite/40
        ${className}
      `}
    >
      {/* Flag emoji + label */}
      <span className="text-sm leading-none">
        {locale === "fr" ? "🇫🇷" : "🇬🇧"}
      </span>
      <span>{locale === "fr" ? "FR" : "EN"}</span>
    </button>
  );
}
