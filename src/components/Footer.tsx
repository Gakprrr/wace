"use client";

import React from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/LangProvider";
import { Shirt, ShoppingBag, Store, Tag, Crown, Ghost, Sparkles } from "lucide-react";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="w-full relative mt-40">
      {/* Vague supérieure & Icônes de vêtements dispersées */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform -translate-y-[99%]">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[80px] sm:h-[120px]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.42,126.8,198.81,115.11,241.6,107.82,284.14,84.14,321.39,56.44Z" className="fill-[#fef08a]"></path>
        </svg>

        {/* Icônes de Vêtements flattantes sur la vague */}
        <Shirt className="absolute bottom-[20px] left-[5%] text-[#ca8a04]/40 w-12 h-12 transform -rotate-12" />
        <Crown className="absolute bottom-[50px] left-[18%] text-[#ca8a04]/50 w-8 h-8" />
        <Tag className="absolute bottom-[80px] left-[28%] text-[#ca8a04]/40 w-6 h-6 transform rotate-45" />
        <Store className="absolute bottom-[10px] left-[42%] text-[#ca8a04]/30 w-14 h-14" />
        <Ghost className="absolute bottom-[50px] left-[52%] text-[#ca8a04]/40 w-10 h-10 transform -rotate-12" />
        <ShoppingBag className="absolute bottom-[60px] left-[65%] text-[#ca8a04]/30 w-10 h-10 transform -rotate-6" />
        <Sparkles className="absolute bottom-[30px] left-[78%] text-[#ca8a04]/50 w-6 h-6" />
        <Shirt className="absolute bottom-[10px] left-[85%] text-[#ca8a04]/40 w-16 h-16 transform rotate-12" />
        <Crown className="absolute bottom-[70px] left-[92%] text-[#ca8a04]/30 w-8 h-8 transform rotate-[25deg]" />
      </div>

      <div className="bg-[#fef08a] pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative">
          
          {/* 1. Anciennes informations : Logo + Tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 w-full md:w-1/3">
            <span className="font-display text-2xl font-black tracking-widest text-gray-800">WACE</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-600 mt-1 font-sans">
              {t.footer.tagline}
            </span>
          </div>

          {/* 2. Anciennes informations : Liens rapides (Parfaitement centré) */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-700 font-bold z-10 w-full md:w-1/3 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link href="/catalogue" className="hover:text-blue-700 transition-colors">
              {t.nav.catalogue}
            </Link>
            <Link href="/contact" className="hover:text-blue-700 transition-colors">
              {t.nav.contact}
            </Link>
            <Link href="/login" className="hover:text-blue-700 transition-colors">
              {t.footer.mySpace}
            </Link>
          </div>

          {/* 3. Suivez Wace (Facebook, Instagram, TikTok, WhatsApp) */}
          <div className="flex flex-col items-center md:items-end gap-3 z-10 w-full md:w-1/3">
            <h4 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Suivez Wace</h4>
            <div className="flex items-center gap-4 text-gray-700 justify-end">
              {/* Facebook */}
              <Link href="#" className="hover:text-blue-600 hover:scale-110 transition-all" title="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </Link>
              {/* Instagram */}
              <Link href="#" className="hover:text-pink-600 hover:scale-110 transition-all" title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </Link>
              {/* TikTok */}
              <Link href="#" className="hover:text-black hover:scale-110 transition-all" title="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a7 7 0 1 1-7-7v3a4 4 0 0 0-4 4z"/></svg>
              </Link>
              {/* WhatsApp */}
              <Link href="https://wa.me/22890383389" className="hover:text-green-600 hover:scale-110 transition-all" title="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M16.5 16c0 1.2-1.3 2.5-2.5 2.5-3.6 0-6.5-2.9-6.5-6.5C7.5 10.8 8.8 9.5 10 9.5c.3 0 .6.1.8.3.4.4.4 1 .2 1.4l-1.2 2c-.2.4-.1.8.2 1.2 1 1 2.2 2 3.2 3.2.4.3.8.4 1.2.2l2-1.2c.4-.2 1-.2 1.4.2.2.2.3.5.3.8z"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#eab308]/40 text-center text-xs text-gray-600 font-bold">
          <p>{t.footer.rights.replace("{year}", String(new Date().getFullYear()))}</p>
        </div>
      </div>
    </footer>
  );
}
