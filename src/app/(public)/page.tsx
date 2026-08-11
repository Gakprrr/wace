"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
}

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; icon?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const articlesRes = await fetch("/api/articles/featured");
        const categoriesRes = await fetch("/api/categories");

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setFeaturedArticles(data.articles || []);
        }

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCategories(catData || []);
        }
      } catch (err) {
        console.error("Failed to fetch featured articles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const stateColors: Record<string, string> = {
    NEUF: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40",
    TRES_BON_ETAT: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
    BON_ETAT: "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-or/10 dark:text-or dark:border-or/30",
    USE_VINTAGE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
  };


  return (
    <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-encre text-encre dark:text-ivoire py-28 sm:py-36 border-b border-anthracite/60">
        {/* Background Decorative Gradients */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,rgba(200,169,110,0.15),transparent_50%)]"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 rounded-full bg-or/5 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-or bg-or/10 border border-or/20 mb-8 animate-pulse">
            Collection Vintage Exclusive
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Wear The <span className="text-or font-light italic">Energy</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-encre dark:text-ivoire/75 mb-12 font-sans font-light leading-relaxed">
            Exprimez votre style unique avec des pièces sélectionnées à la main. 
            La friperie haut de gamme qui donne une seconde vie aux vêtements d'exception.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/catalogue"
              className="w-full sm:w-auto bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-4 px-8 rounded-full transition-all shadow-gold hover:scale-[1.03] active:scale-[0.97]"
            >
              Découvrir le Catalogue
            </a>
            <a
              href="/contact"
              className="w-full sm:w-auto border border-ivoire/20 hover:border-or/60 hover:bg-anthracite/40 text-encre dark:text-ivoire font-medium py-4 px-8 rounded-full transition-all"
            >
              Nous Contacter
            </a>
          </div>
        </div>
      </section>

      {/* Category Chips Bar */}
      <section className="py-12 border-b border-beige dark:border-anthracite/60 bg-white/40 dark:bg-anthracite/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-or font-semibold mb-6 text-center md:text-left">
            Explorer par Catégorie
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/catalogue?category=${cat.slug}`}
                className="flex items-center space-x-2.5 bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 py-3 px-6 rounded-full hover:border-or/60 hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-lg">{cat.icon || "🏷️"}</span>
                <span className="font-medium text-sm tracking-wide">{cat.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="w-full md:w-2/3 h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-anthracite/60 group">
            <img 
              src="/new-hero.png" 
              alt="Wear The Energy Banner"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start">
            <h2 className="font-display text-5xl md:text-6xl lg:text-[5rem] font-bold tracking-tight leading-[1.1] text-center md:text-left">
              Wear<br/>
              The<br/>
              <span className="text-or italic font-light">Energy</span>
            </h2>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Pièces <span className="text-or italic font-light">Vedettes</span>
            </h2>
            <p className="text-sm text-encre/65 dark:text-encre dark:text-ivoire/65 mt-2 max-w-md">
              Ne manquez pas ces vêtements uniques sélectionnés spécialement pour leur style et leur qualité.
            </p>
          </div>
          <a
            href="/catalogue"
            className="group flex items-center space-x-2 text-sm font-bold text-or hover:text-or-dark transition-colors"
          >
            <span>Voir tout le catalogue</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-96 rounded-3xl bg-beige/30 dark:bg-anthracite/40 animate-pulse border border-beige/40 dark:border-anthracite/60"
              ></div>
            ))}
          </div>
        ) : featuredArticles.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 rounded-3xl">
            <p className="text-encre/60 dark:text-encre dark:text-ivoire/60">Aucun article disponible pour le moment.</p>
            <a href="/catalogue" className="mt-4 inline-block text-or font-bold text-sm">
              Visiter la boutique
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArticles.map((article) => (
              <a
                key={article.id}
                href={`/catalogue/${article.id}`}
                className="group flex flex-col bg-white dark:bg-anthracite/40 rounded-3xl overflow-hidden border border-beige/40 dark:border-anthracite/60 hover:border-or/40 hover:shadow-gold transition-all duration-300"
              >
                {/* Image Container */}
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
                      <span className="bg-red-950/80 text-red-400 border border-red-800/40 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                        Épuisé
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
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
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-encre text-encre dark:text-ivoire border-t border-anthracite/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-or">
                Notre Philosophie
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-4 mb-6 leading-tight">
                Consommer la Mode autrement
              </h2>
              <p className="text-encre dark:text-ivoire/75 font-sans leading-relaxed mb-6 font-light">
                Chez WACE, nous pensons que chaque vêtement a une âme et une histoire. Choisir le vintage et la friperie n'est pas seulement un choix esthétique, c'est un acte engagé pour la planète.
              </p>
              <p className="text-encre dark:text-ivoire/75 font-sans leading-relaxed mb-8 font-light">
                Nous sélectionnons minutieusement chaque pièce pour vous garantir un état exceptionnel et un style intemporel. Soyez unique, réduisez votre empreinte carbone et portez l'énergie du changement.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h4 className="font-display text-3xl font-bold text-or">100%</h4>
                  <p className="text-xs text-encre dark:text-ivoire/50 mt-1">Authentique</p>
                </div>
                <div>
                  <h4 className="font-display text-3xl font-bold text-or">Unique</h4>
                  <p className="text-xs text-encre dark:text-ivoire/50 mt-1">Une seule pièce</p>
                </div>
                <div>
                  <h4 className="font-display text-3xl font-bold text-or">Eco</h4>
                  <p className="text-xs text-encre dark:text-ivoire/50 mt-1">Responsable</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-anthracite border border-or/20 group">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop"
                alt="Wace vintage fashion"
                className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-encre via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <blockquote className="font-display text-lg italic text-encre dark:text-ivoire/90">
                  "Le vêtement le plus durable est celui qui existe déjà."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Widget */}
      <a
        href="https://wa.me/22890000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba56] text-white p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        title="Discuter sur WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 1.968 14.117.942 11.999.942 6.566.942 2.143 5.311 2.138 10.74c-.002 1.712.457 3.385 1.332 4.887l-1.015 3.708 3.807-.981zM17.89 14.47c-.319-.16-1.884-.93-2.176-1.037-.291-.106-.504-.16-.717.16-.213.32-.823 1.037-1.009 1.25-.186.213-.372.24-.69.08-.319-.16-1.348-.497-2.568-1.586-.949-.846-1.59-1.892-1.776-2.213-.186-.32-.02-.493.14-.652.144-.143.319-.372.479-.558.16-.186.213-.32.319-.53.106-.213.053-.4-.027-.558-.08-.16-.717-1.726-.982-2.364-.258-.62-.52-.536-.717-.546-.186-.01-.399-.01-.611-.01-.213 0-.558.08-.85.399-.291.32-1.115 1.09-1.115 2.66 0 1.569 1.143 3.085 1.302 3.3.16.213 2.25 3.435 5.451 4.82.761.329 1.355.525 1.817.672.764.243 1.46.21 2.01.127.613-.09 1.884-.77 2.15-1.513.266-.744.266-1.383.186-1.513-.08-.13-.298-.21-.617-.37z" />
        </svg>
      </a>

      <Footer />
    </div>
  );
}
