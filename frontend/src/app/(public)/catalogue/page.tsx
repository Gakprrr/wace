"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LangProvider";

interface Article {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  state: string;
  images: string[];
  isAvailable: boolean;
  isNew: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function CatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLang();

  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch articles on filter change
  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.set("search", search);
        if (category) query.set("categorySlug", category);
        if (state) query.set("state", state);
        if (minPrice) query.set("minPrice", minPrice);
        if (maxPrice) query.set("maxPrice", maxPrice);
        query.set("page", String(page));
        query.set("limit", "12");

        const res = await fetch(`/api/articles?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    }

    // Sync URL
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    if (state) query.set("state", state);
    if (minPrice) query.set("minPrice", minPrice);
    if (maxPrice) query.set("maxPrice", maxPrice);
    query.set("page", String(page));
    router.replace(`/catalogue?${query.toString()}`, { scroll: false });

    fetchArticles();
  }, [search, category, state, minPrice, maxPrice, page]);

  const stateColors: Record<string, string> = {
    NEUF: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40",
    TRES_BON_ETAT: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
    BON_ETAT: "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-or/10 dark:text-or dark:border-or/30",
    USE_VINTAGE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
  };

  const states = [
    { label: t.catalogue.conditions.NEUF, value: "NEUF" },
    { label: t.catalogue.conditions.TRES_BON_ETAT, value: "TRES_BON_ETAT" },
    { label: t.catalogue.conditions.BON_ETAT, value: "BON_ETAT" },
    { label: t.catalogue.conditions.USE_VINTAGE, value: "USE_VINTAGE" },
  ];

  const totalPages = Math.ceil(total / 12);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setState("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex-1 flex flex-col">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {t.catalogue.title.split(' ')[0]} <span className="text-or italic font-light">{t.catalogue.title.split(' ')[1] || ''}</span>
          </h1>
          <p className="text-sm text-encre/65 dark:text-encre dark:text-ivoire/65 mt-1">
            {t.catalogue.subtitle}
          </p>
        </div>
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder={t.catalogue.search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full py-3.5 pl-12 pr-4 rounded-full bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/65 focus:outline-none transition-all shadow-sm text-sm"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-encre/40 dark:text-encre dark:text-ivoire/40" />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 flex-1 items-start">
        {/* Filters Sidebar */}
        <aside className="bg-white dark:bg-anthracite border border-beige dark:border-anthracite/80 rounded-[2rem] p-8 lg:sticky lg:top-28 shadow-[0_15px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_40px_rgba(216,182,82,0.05)]">
          <div className="flex justify-between items-center pb-4 border-b border-beige/65 dark:border-anthracite/60 mb-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-or">{t.catalogue.filters}</h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-encre/50 dark:text-encre dark:text-ivoire/50 hover:text-or transition-colors"
            >
              {t.catalogue.reset}
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
              {t.catalogue.category}
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
            >
              <option value="">{t.catalogue.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition State Filter */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
              {t.catalogue.condition}
            </label>
            <div className="flex flex-col gap-2.5">
              {states.map((st) => (
                <label key={st.value} className="flex items-center space-x-3 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="state"
                    value={st.value}
                    checked={state === st.value}
                    onChange={(e) => {
                      setState(e.target.value);
                      setPage(1);
                    }}
                    className="accent-or"
                  />
                  <span>{st.label}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 flex-1 flex flex-col justify-between h-full">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-96 rounded-3xl bg-beige/30 dark:bg-anthracite/40 animate-pulse border border-beige/40 dark:border-anthracite/60"
                ></div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-anthracite border border-beige dark:border-anthracite/80 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_40px_rgba(216,182,82,0.05)] flex-1 flex flex-col items-center justify-center">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-encre/65 dark:text-encre dark:text-ivoire/65 font-medium">
                {t.catalogue.noResults}
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-sm font-bold text-or hover:text-or-dark transition-colors"
              >
                {t.catalogue.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/catalogue/${article.id}`}
                  className="group flex flex-col bg-white dark:bg-anthracite/40 rounded-3xl overflow-hidden border border-beige/40 dark:border-anthracite/60 hover:border-or/40 hover:shadow-gold transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-beige/10 dark:bg-anthracite/60">
                    <Image
                      src={article.images[0] || "https://placehold.co/300x400/1a1a18/c8a96e?text=WACE"}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          stateColors[article.state] || "bg-anthracite/60 text-encre dark:text-ivoire border border-ivoire/20"
                        }`}
                      >
                        {article.state.replace(/_/g, " ")}
                      </span>
                    </div>
                    {article.stock === 0 && (
                      <div className="absolute inset-0 bg-encre/65 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-950/80 text-red-400 border border-red-800/40 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                          {t.catalogue.outOfStock}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between gap-3 bg-white dark:bg-anthracite/20">
                    <div>
                      <h3 className="font-display font-semibold text-base tracking-wide text-encre dark:text-ivoire group-hover:text-or transition-colors line-clamp-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-encre/60 dark:text-encre dark:text-ivoire/60 line-clamp-2 mt-1">
                        {article.description}
                      </p>
                    </div>
                    <div className="flex items-baseline justify-between pt-2 border-t border-beige/40 dark:border-anthracite/60">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-or">
                          {article.price.toLocaleString(locale === 'fr' ? "fr-FR" : "en-US")} {t.common.currency}
                        </span>
                        {article.oldPrice && (
                          <span className="text-xs text-encre/40 dark:text-encre dark:text-ivoire/40 line-through">
                            {article.oldPrice.toLocaleString(locale === 'fr' ? "fr-FR" : "en-US")} {t.common.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-12 pt-6 border-t border-beige/40 dark:border-anthracite/60">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-beige dark:border-anthracite hover:border-or/60 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">
                {t.catalogue.page} {page} {t.catalogue.of} {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-beige dark:border-anthracite hover:border-or/60 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CataloguePage() {
  const { t } = useLang();

  return (
    <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="animate-pulse">{t.catalogue.loading}</p>
        </div>
      }>
        <CatalogueContent />
      </Suspense>
      <Footer />
    </div>
  );
}
