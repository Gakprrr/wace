"use client";

/**
 * FloatingControls — Barre flottante persistante (thème + langue)
 * Apparaît sur toutes les pages, y compris Auth et Admin.
 * Positionnée en bas à droite pour ne pas perturber le contenu.
 */
import React from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";

export function FloatingControls() {
  const pathname = usePathname();
  
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <div
      className="
        fixed bottom-6 right-6 z-[9999]
        flex items-center gap-2
        bg-encre/90 dark:bg-anthracite/90
        backdrop-blur-md
        border border-or/20
        rounded-full px-3 py-2 shadow-xl shadow-encre/20
      "
    >
      <LangToggle />
      <div className="w-px h-4 bg-or/20" />
      <ThemeToggle />
    </div>
  );
}
