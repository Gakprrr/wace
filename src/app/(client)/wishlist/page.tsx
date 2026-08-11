"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
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
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { t, locale } = useLang();
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLikes = async () => {
    try {
      const res = await fetch("/api/users/me/likes");
      if (res.ok) {
        const data = await res.json();
        setLikedArticles(data || []);
      }
    } catch (err) {
      console.error("Failed to load liked articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadLikes();
    }
  }, [user]);

  const stateColors: Record<string, string> = {
    NEUF: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40",
    TRES_BON_ETAT: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
    BON_ETAT: "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-or/10 dark:text-or dark:border-or/30",
    USE_VINTAGE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-8">
          {t.profile.mySpace}
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Navigation/Sidebar */}
          <div className="md:col-span-1 bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-6 rounded-3xl h-fit">
            <div className="flex flex-col items-center text-center pb-6 border-b border-beige/45 dark:border-anthracite/60 mb-6">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-20 h-20 rounded-full border border-or object-cover mb-4" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-encre border-2 border-or flex items-center justify-center text-or font-bold text-2xl uppercase mb-4">
                  {user.name.charAt(0)}
                </div>
              )}
              <h3 className="font-bold text-lg">{user.name}</h3>
              <span className="text-xs text-or font-semibold tracking-wider mt-1">{user.role === 'ADMIN' ? t.profile.admin : t.profile.client}</span>
            </div>
            <nav className="flex flex-col gap-2">
              <a href="/profile" className="flex items-center space-x-3 text-sm text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or hover:bg-anthracite/20 py-2 px-3 rounded-xl transition-all">
                <span>👤</span>
                <span>{t.nav.profile}</span>
              </a>
              <a href="/wishlist" className="flex items-center space-x-3 text-sm font-bold text-or py-2 px-3 bg-or/10 rounded-xl">
                <span>❤️</span>
                <span>{t.nav.wishlist}</span>
              </a>
              <a href="/notifications" className="flex items-center space-x-3 text-sm text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or hover:bg-anthracite/20 py-2 px-3 rounded-xl transition-all">
                <span>🔔</span>
                <span>{t.nav.notifications}</span>
              </a>
            </nav>
          </div>

          {/* Wishlist Grid */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-8 rounded-3xl shadow-sm h-full min-h-[300px]">
              <h2 className="text-lg font-bold mb-6">{t.wishlist.title} ({likedArticles.length})</h2>

              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-64 rounded-2xl bg-beige/30 dark:bg-anthracite/40 animate-pulse border border-beige/40 dark:border-anthracite/60"></div>
                  ))}
                </div>
              ) : likedArticles.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-4">❤️</span>
                  <p className="text-sm text-encre/65 dark:text-encre dark:text-ivoire/65">
                    {t.wishlist.empty}
                  </p>
                  <a
                    href="/catalogue"
                    className="mt-4 bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold text-xs py-2.5 px-6 rounded-full transition-colors"
                  >
                    {t.wishlist.browseCatalogue}
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {likedArticles.map((article) => (
                    <a
                      key={article.id}
                      href={`/catalogue/${article.id}`}
                      className="group flex flex-col bg-white dark:bg-anthracite/40 rounded-3xl overflow-hidden border border-beige/45 dark:border-anthracite/60 hover:border-or/40 hover:shadow-gold transition-all duration-300"
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
                            {article.state.replace(/_/g, " ")}
                          </span>
                        </div>
                        {article.stock === 0 && (
                          <div className="absolute inset-0 bg-encre/65 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-950/80 text-red-400 border border-red-800/40 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                              {t.wishlist.outOfStock}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between gap-2 bg-white dark:bg-anthracite/20 text-left">
                        <div>
                          <h3 className="font-display font-semibold text-sm tracking-wide text-encre dark:text-ivoire group-hover:text-or transition-colors line-clamp-1">
                            {article.title}
                          </h3>
                        </div>
                        <div className="flex items-baseline justify-between pt-2 border-t border-beige/40 dark:border-anthracite/60">
                          <span className="text-sm font-bold text-or">
                            {article.price.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} {t.common.currency}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
