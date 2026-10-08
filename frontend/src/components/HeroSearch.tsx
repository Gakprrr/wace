"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/LangProvider";

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
    <div className="w-full bg-white/95 backdrop-blur-2xl border-2 border-white/90 ring-1 ring-gray-200/50 p-5 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row gap-4 items-center justify-between z-40">
      
      <div className="flex-1 w-full px-4 border-b sm:border-b-0 sm:border-r border-gray-300/60 pb-3 sm:pb-0">
        <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">{t.catalogue.category}</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="">{t.catalogue.allCategories}</option>
          <option value="casquettes">{t.home.catCaps}</option>
          <option value="bonnets">{t.home.catBeanies}</option>
          <option value="vetements">{t.home.catClothes}</option>
        </select>
      </div>
      
      <div className="flex-1 w-full px-4 border-b sm:border-b-0 sm:border-r border-gray-300/60 pb-3 sm:pb-0">
        <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">{t.catalogue.condition}</label>
        <select 
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="">{t.catalogue.allConditions}</option>
          <option value="NEUF">{t.catalogue.conditions.NEUF}</option>
          <option value="TRES_BON_ETAT">{t.catalogue.conditions.TRES_BON_ETAT}</option>
          <option value="BON_ETAT">{t.catalogue.conditions.BON_ETAT}</option>
          <option value="USE_VINTAGE">{t.catalogue.conditions.USE_VINTAGE}</option>
        </select>
      </div>

      <div className="flex-1 w-full px-4 pb-3 sm:pb-0">
        <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">{t.catalogue.maxPrice}</label>
        <select 
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="">{t.catalogue.anyPrice}</option>
          <option value="5000">{t.catalogue.underPrice.replace('{price}', '5 000').replace('{currency}', t.common.currency)}</option>
          <option value="10000">{t.catalogue.underPrice.replace('{price}', '10 000').replace('{currency}', t.common.currency)}</option>
          <option value="25000">{t.catalogue.underPrice.replace('{price}', '25 000').replace('{currency}', t.common.currency)}</option>
          <option value="50000">{t.catalogue.underPrice.replace('{price}', '50 000').replace('{currency}', t.common.currency)}</option>
        </select>
      </div>

      <div className="w-full sm:w-auto mt-3 sm:mt-0 px-2 sm:px-0">
        <button 
          onClick={handleSearch}
          className="w-full sm:w-auto bg-[#1f1e1a] hover:bg-[#d8b652] text-white hover:text-[#1f1e1a] px-10 py-4 rounded-2xl font-bold shadow-[0_8px_20px_rgba(31,30,26,0.3)] hover:shadow-[0_12px_25px_rgba(216,182,82,0.4)] transition-all duration-300 transform hover:-translate-y-1"
        >
          {t.catalogue.searchBtn}
        </button>
      </div>
    </div>
  );
}
