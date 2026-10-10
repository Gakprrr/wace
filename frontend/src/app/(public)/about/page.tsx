"use client";

import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/lib/i18n/LangProvider";

export default function AboutPage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-10 w-full max-w-[90rem] mx-auto">
        <section className="relative w-full py-12 sm:py-16 md:py-20 min-h-[380px] sm:min-h-[440px] bg-encre text-ivoire flex flex-col justify-center items-center overflow-hidden rounded-[2.5rem] border border-[#d8b652]/50 shadow-2xl shadow-[#d8b652]/10 ring-8 ring-[#d8b652]/5">
          {/* Background Image */}
          <Image
            src="/images/fond.jpeg"
            alt="L'Âme du Vintage"
            fill
            className="object-cover scale-105 filter blur-[4px]"
            priority
            unoptimized
          />
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"></div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,182,82,0.25),transparent_70%)]"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#d8b652]/20 rounded-full blur-[100px]"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#d8b652]/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 text-center px-6 sm:px-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
            <span className="text-[#d8b652] font-extrabold tracking-[0.25em] uppercase text-xs sm:text-sm mb-3 block drop-shadow-sm">
              {t.about.history}
            </span>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-4 text-white drop-shadow-md">
              {t.about.title} <span className="text-[#d8b652] italic font-light">{t.about.titleHighlight}</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/95 font-normal leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              {t.about.subtitle}
            </p>
          </div>
        </section>
      </div>

      {/* Main Content */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-encre mb-6 leading-tight">
            {t.about.redefineTitle} <br/><span className="text-[#d8b652]">{t.about.redefineHighlight}</span>
          </h2>
          <div className="space-y-4 text-lg text-encre/70 font-light">
            <p>
              {t.about.p1}
            </p>
            <p>
              {t.about.p2}
            </p>
            <p>
              {t.about.p3}
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-encre mb-12">
            {t.about.valuesTitle}
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-beige/50 border-2 border-[#d8b652]/40 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-or/10 text-or rounded-full flex items-center justify-center text-3xl mb-6">
                💎
              </div>
              <h3 className="text-xl font-bold text-encre mb-3">{t.about.v1Title}</h3>
              <p className="text-sm text-encre/60">
                {t.about.v1Desc}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-beige/50 border-2 border-[#d8b652]/40 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-or/10 text-or rounded-full flex items-center justify-center text-3xl mb-6">
                🌍
              </div>
              <h3 className="text-xl font-bold text-encre mb-3">{t.about.v2Title}</h3>
              <p className="text-sm text-encre/60">
                {t.about.v2Desc}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-beige/50 border-2 border-[#d8b652]/40 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-or/10 text-or rounded-full flex items-center justify-center text-3xl mb-6">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-encre mb-3">{t.about.v3Title}</h3>
              <p className="text-sm text-encre/60">
                {t.about.v3Desc}
              </p>
            </div>
          </div>
        </div>

      </section>
      <Footer />
    </div>
  );
}
