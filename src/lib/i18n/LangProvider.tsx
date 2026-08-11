"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Locale } from "./translations";

interface LangContextType {
  locale: Locale;
  t: (typeof translations)['fr'];
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LangContext = createContext<LangContextType | null>(null);

const STORAGE_KEY = "wace-locale";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "fr" || saved === "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(saved);
      }
    } catch {}
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {}
  };

  const toggleLocale = () => {
    setLocale(locale === "fr" ? "en" : "fr");
  };

  const t = translations[locale] as (typeof translations)['fr'];

  return (
    <LangContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within a LangProvider");
  }
  return ctx;
}
