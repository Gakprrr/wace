"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/LangProvider";
import { Search, Shirt, Tag, Coins } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const { t } = useLang();
  
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (state) query.set("state", state);
    if (maxPrice) query.set("maxPrice", maxPrice);

    router.push(`/catalogue?${query.toString()}`);
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-2xl border-2 border-white/90 ring-1 ring-black/5 p-4 sm:p-5 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between z-40 transition-all">
      
      {/* Category Dropdown */}
      <div className="flex-1 w-full bg-gray-50/90 hover:bg-white border border-gray-200/70 hover:border-blue-400/50 rounded-2xl p-3 transition-all duration-300 group">
        <div className="flex items-center gap-2 mb-1">
          <Shirt className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer">
            {t.catalogue.category}
          </label>
        </div>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
        >
          <option value="">{t.catalogue.allCategories}</option>
          <option value="casquettes">{t.home.catCaps}</option>
          <option value="bonnets">{t.home.catBeanies}</option>
          <option value="vetements">{t.home.catClothes}</option>
        </select>
      </div>

      {/* Condition Dropdown */}
      <div className="flex-1 w-full bg-gray-50/90 hover:bg-white border border-gray-200/70 hover:border-blue-400/50 rounded-2xl p-3 transition-all duration-300 group">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer">
            {t.catalogue.condition}
          </label>
        </div>
        <select 
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
        >
          <option value="">{t.catalogue.allConditions}</option>
          <option value="NEUF">{t.catalogue.conditions.NEUF}</option>
          <option value="TRES_BON_ETAT">{t.catalogue.conditions.TRES_BON_ETAT}</option>
          <option value="BON_ETAT">{t.catalogue.conditions.BON_ETAT}</option>
          <option value="USE_VINTAGE">{t.catalogue.conditions.USE_VINTAGE}</option>
        </select>
      </div>

      {/* Max Price Dropdown */}
      <div className="flex-1 w-full bg-gray-50/90 hover:bg-white border border-gray-200/70 hover:border-blue-400/50 rounded-2xl p-3 transition-all duration-300 group">
        <div className="flex items-center gap-2 mb-1">
          <Coins className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer">
            {t.catalogue.maxPrice}
          </label>
        </div>
        <select 
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
        >
          <option value="">{t.catalogue.anyPrice}</option>
          <option value="5000">{t.catalogue.underPrice.replace('{price}', '5 000').replace('{currency}', t.common.currency)}</option>
          <option value="10000">{t.catalogue.underPrice.replace('{price}', '10 000').replace('{currency}', t.common.currency)}</option>
          <option value="25000">{t.catalogue.underPrice.replace('{price}', '25 000').replace('{currency}', t.common.currency)}</option>
          <option value="50000">{t.catalogue.underPrice.replace('{price}', '50 000').replace('{currency}', t.common.currency)}</option>
        </select>
      </div>

      {/* Search Button */}
      <div className="w-full lg:w-auto">
        <button 
          onClick={handleSearch}
          className="w-full lg:w-auto bg-[#1f1e1a] hover:bg-[#d8b652] text-white hover:text-[#1f1e1a] px-8 py-4 rounded-2xl font-extrabold text-sm tracking-wide shadow-[0_10px_25px_rgba(31,30,26,0.25)] hover:shadow-[0_12px_30px_rgba(216,182,82,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group cursor-pointer"
        >
          <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>{t.catalogue.searchBtn}</span>
        </button>
      </div>
    </div>
  );
}
