"use client";

import React, { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  articles: Article[];
}

export default function CategorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  // Filter state for Item condition
  const [selectedState, setSelectedState] = useState<string>("");

  useEffect(() => {
    async function loadCategoryArticles() {
      try {
        const res = await fetch(`/api/categories/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCategoryData(data);
          document.title = `WACE | ${data.name} - Archives & Collections`;
        }
      } catch (err) {
        console.error("Failed to load category articles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryArticles();
  }, [slug]);

  const stateColors: Record<string, string> = {
    NEUF: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40",
    TRES_BON_ETAT: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
    BON_ETAT: "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-or/10 dark:text-or dark:border-or/30",
    USE_VINTAGE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
  };

  const stateLabels: Record<string, string> = {
    NEUF: t.catalogue.conditions.NEUF,
    TRES_BON_ETAT: t.catalogue.conditions.TRES_BON_ETAT,
    BON_ETAT: t.catalogue.conditions.BON_ETAT,
    USE_VINTAGE: t.catalogue.conditions.USE_VINTAGE,
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <p className="animate-pulse font-medium text-or">{t.catalogue.loadingCategory}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <span className="text-4xl mb-4">📂</span>
          <h2 className="text-xl font-bold mb-2">{t.catalogue.categoryNotFound}</h2>
          <p className="text-encre/65 dark:text-encre dark:text-ivoire/65 mb-6">{t.catalogue.categoryNotFoundDesc}</p>
          <a href="/catalogue" className="text-sm font-bold text-or hover:underline">{t.catalogue.backToCatalogue}</a>
        </div>
        <Footer />
      </div>
    );
  }

  const allArticles = categoryData.articles || [];
  const filteredArticles = selectedState
    ? allArticles.filter((a) => a.state === selectedState)
    : allArticles;

  return (
    <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-12 text-xs uppercase tracking-wider text-encre/60 dark:text-encre dark:text-ivoire/60 font-medium">
          <a className="hover:text-or transition-colors" href="/">{t.nav.home}</a>
          <span className="opacity-50">/</span>
          <a className="hover:text-or transition-colors" href="/catalogue">{t.nav.catalogue}</a>
          <span className="opacity-50">/</span>
          <span className="text-or">{categoryData.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-encre dark:text-ivoire mb-2">
            {categoryData.name}
          </h2>
          <p className="text-xs uppercase tracking-widest text-encre/60 dark:text-encre dark:text-ivoire/60">
            {allArticles.length} {allArticles.length > 1 ? t.catalogue.articlesFoundPlural : t.catalogue.articlesFoundSingle}
          </p>
        </div>

        {/* Product Grid & Filter Layout */}
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filter */}
          <aside className="bg-white dark:bg-anthracite/40 border border-beige/60 dark:border-anthracite/60 rounded-3xl p-6 lg:sticky lg:top-28">
            <div className="flex justify-between items-center pb-4 border-b border-beige/65 dark:border-anthracite/60 mb-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-or">{t.catalogue.filterBy}</h3>
              {selectedState && (
                <button
                  onClick={() => setSelectedState("")}
                  className="text-xs text-encre/50 dark:text-encre dark:text-ivoire/50 hover:text-or transition-colors"
                >
                  {t.catalogue.reset}
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider mb-3 text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                  {t.catalogue.condition}
                </span>
                <div className="flex flex-col gap-2.5">
                  {Object.entries(stateLabels).map(([value, label]) => (
                    <label key={value} className="flex items-center space-x-3 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="state"
                        value={value}
                        checked={selectedState === value}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="accent-or"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="lg:col-span-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-anthracite/20 border border-beige/40 dark:border-anthracite/60 rounded-3xl">
                <span className="text-3xl mb-4 block">🔍</span>
                <p className="text-encre/65 dark:text-encre dark:text-ivoire/65 font-medium">
                  {t.catalogue.noMatchFilter}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <a
                    key={article.id}
                    href={`/catalogue/${article.id}`}
                    className="group flex flex-col bg-white dark:bg-anthracite/40 rounded-3xl overflow-hidden border border-beige/40 dark:border-anthracite/60 hover:border-or/40 hover:shadow-gold transition-all duration-300"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-beige/10 dark:bg-anthracite/60">
                      <img
                        src={article.images[0] || "https://placehold.co/300x400/1a1a18/c8a96e?text=WACE"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            stateColors[article.state] || "bg-anthracite/60 text-encre dark:text-ivoire border border-ivoire/20"
                          }`}
                        >
                          {stateLabels[article.state] || article.state}
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
                            {article.price.toLocaleString("fr-FR")} FCFA
                          </span>
                          {article.oldPrice && (
                            <span className="text-xs text-encre/40 dark:text-encre dark:text-ivoire/40 line-through">
                              {article.oldPrice.toLocaleString("fr-FR")} FCFA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
