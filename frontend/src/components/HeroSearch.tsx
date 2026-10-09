"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/LangProvider";
import { Search, Tag, SlidersHorizontal, Banknote } from "lucide-react";

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
    <div className="w-full bg-white/95 backdrop-blur-xl border border-gray-200/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_12px_35px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between">
      
      {/* CATEGORY SELECT */}
      <div className="flex-1 w-full px-3 py-2 border-b md:border-b-0 md:border-r border-gray-200 flex items-center gap-3">
        <Tag className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="w-full">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            {t.catalogue.category}
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="">{t.catalogue.allCategories}</option>
            <option value="casquettes">{t.home.catCaps}</option>
            <option value="bonnets">{t.home.catBeanies}</option>
            <option value="vetements">{t.home.catClothes}</option>
          </select>
        </div>
      </div>
      
      {/* CONDITION SELECT */}
      <div className="flex-1 w-full px-3 py-2 border-b md:border-b-0 md:border-r border-gray-200 flex items-center gap-3">
        <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="w-full">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            {t.catalogue.condition}
          </label>
          <select 
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="">{t.catalogue.allConditions}</option>
            <option value="NEUF">{t.catalogue.conditions.NEUF}</option>
            <option value="TRES_BON_ETAT">{t.catalogue.conditions.TRES_BON_ETAT}</option>
            <option value="BON_ETAT">{t.catalogue.conditions.BON_ETAT}</option>
            <option value="USE_VINTAGE">{t.catalogue.conditions.USE_VINTAGE}</option>
          </select>
        </div>
      </div>

      {/* MAX PRICE SELECT */}
      <div className="flex-1 w-full px-3 py-2 flex items-center gap-3">
        <Banknote className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="w-full">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            {t.catalogue.maxPrice}
          </label>
          <select 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="">{t.catalogue.anyPrice}</option>
            <option value="5000">{t.catalogue.underPrice.replace('{price}', '5 000').replace('{currency}', t.common.currency)}</option>
            <option value="10000">{t.catalogue.underPrice.replace('{price}', '10 000').replace('{currency}', t.common.currency)}</option>
            <option value="25000">{t.catalogue.underPrice.replace('{price}', '25 000').replace('{currency}', t.common.currency)}</option>
            <option value="50000">{t.catalogue.underPrice.replace('{price}', '50 000').replace('{currency}', t.common.currency)}</option>
          </select>
        </div>
      </div>

      {/* SEARCH BUTTON */}
      <div className="w-full md:w-auto shrink-0">
        <button 
          onClick={handleSearch}
          className="w-full md:w-auto bg-[#1f1e1a] hover:bg-[#d8b652] text-white hover:text-[#1f1e1a] px-7 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>{t.catalogue.searchBtn}</span>
        </button>
      </div>
    </div>
  );
}
