"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/lib/i18n/LangProvider";
import HeroSearch from "@/components/HeroSearch";
import AnimatedBanner from "@/components/AnimatedBanner";
import {
  Crown,
  Moon,
  Shirt,
  ArrowRight,
  Heart,
  Tag,
  Sparkles,
  Flame,
  Store,
  Star,
  Leaf,
  Gem,
  Diamond,
  Scissors,
  Feather,
  Award,
} from "lucide-react";

export interface Article {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  state: string;
  category: {
    name: string;
    slug: string;
  };
}

interface HomePageClientProps {
  featuredArticles: Article[];
}

export default function HomePageClient({ featuredArticles }: HomePageClientProps) {
  const { t, locale } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [likedArticleIds, setLikedArticleIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUserLikes() {
      if (!user) return;
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("wace_token") : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("/api/users/me/likes", { credentials: "include", headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLikedArticleIds(data.map((art: any) => art.id));
          }
        }
      } catch (err) {
        console.error("Failed to load user likes:", err);
      }
    }
    fetchUserLikes();
  }, [user]);

  const handleHeartClick = async (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("wace_token") : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
        credentials: "include",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.liked) {
          setLikedArticleIds((prev) => [...prev, articleId]);
        } else {
          setLikedArticleIds((prev) => prev.filter((id) => id !== articleId));
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <main className="flex-1 w-[95%] max-w-7xl mx-auto relative flex flex-col px-4 sm:px-6 lg:px-8 mt-6">
      {/* HERO SECTION */}
      <section className="relative w-full rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#faf9f5] via-[#f3f0e6] to-[#e8e4d6] border border-[#e1dccb] shadow-[0_12px_40px_rgba(0,0,0,0.04)] overflow-hidden p-6 sm:p-10 lg:p-12">
        {/* Soft subtle ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d8b652]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-black/5 shadow-xs w-fit">
              <Sparkles className="w-4 h-4 text-[#d8b652]" />
              <span className="text-xs font-bold text-gray-800 tracking-wider uppercase">
                {t.home.newCollection}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1f1e1a] tracking-tight leading-[1.15]">
              {t.home.heroTitle1}
              <br />
              <span className="bg-gradient-to-r from-[#1f1e1a] via-[#4a4639] to-[#d8b652] bg-clip-text text-transparent">
                {t.home.heroTitle2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed max-w-xl">
              {t.home.heroDesc}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 bg-[#1f1e1a] hover:bg-[#d8b652] text-white hover:text-[#1f1e1a] px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>Découvrir la collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Image Card */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-4 border-white/90 group bg-white/60 p-1">
              <img
                src="/images/acceuil.jpeg"
                alt={t.home.newCollection}
                className="w-full h-auto max-h-[480px] object-contain rounded-xl sm:rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HERO SEARCH FILTER BAR */}
      <div className="w-full max-w-5xl mx-auto mt-6 sm:mt-8 mb-16 relative z-20 px-2 sm:px-0">
        <HeroSearch />
      </div>

      {/* INFINITE SCROLLING MARQUEE */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-transparent py-6 mb-24 border-y border-[#1f1e1a]/10">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-12 w-max hover:[animation-play-state:paused]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-12">
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Store className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.store}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Gem className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.couture}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Flame className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.streetwear}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Diamond className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.elegance}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Star className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.vintage}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Crown className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.prestige}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Sparkles className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.trendy}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Award className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.authenticity}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Scissors className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.craft}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Feather className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.timeless}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Tag className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.unique}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
              <span className="flex items-center gap-3 text-[#1f1e1a] text-lg font-bold tracking-widest uppercase"><Leaf className="text-[#d8b652] w-5 h-5" /> {t.home.marquee.eco}</span>
              <span className="text-[#d8b652] text-xl">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <section className="mb-24 text-center max-w-5xl mx-auto w-full">
        <div className="inline-block mb-12">
          <h2 className="text-4xl font-extrabold text-[#1f1e1a] tracking-tight relative">
            {t.home.categories}
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#d8b652] rounded-full"></span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 justify-center">
          <Link
            href="/catalogue?category=casquettes"
            className="bg-gradient-to-b from-[#1f1e1a] to-[#2a2924] rounded-[2rem] p-8 shadow-xl hover:shadow-[0_15px_40px_rgba(216,182,82,0.25)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-5 group border border-white/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#d8b652]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-20 h-20 bg-[#d8b652]/10 rounded-full flex items-center justify-center text-[#d8b652] group-hover:scale-110 group-hover:bg-[#d8b652] group-hover:text-[#1f1e1a] transition-all duration-300 shadow-[0_0_20px_rgba(216,182,82,0.15)] z-10">
              <Crown className="w-10 h-10" />
            </div>
            <span className="font-bold text-white text-lg z-10">
              {t.home.catCaps}
            </span>
          </Link>

          <Link
            href="/catalogue?category=bonnets"
            className="bg-gradient-to-b from-[#1f1e1a] to-[#2a2924] rounded-[2rem] p-8 shadow-xl hover:shadow-[0_15px_40px_rgba(216,182,82,0.25)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-5 group border border-white/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#d8b652]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-20 h-20 bg-[#d8b652]/10 rounded-full flex items-center justify-center text-[#d8b652] group-hover:scale-110 group-hover:bg-[#d8b652] group-hover:text-[#1f1e1a] transition-all duration-300 shadow-[0_0_20px_rgba(216,182,82,0.15)] z-10">
              <Moon className="w-10 h-10" />
            </div>
            <span className="font-bold text-white text-lg z-10">
              {t.home.catBeanies}
            </span>
          </Link>

          <Link
            href="/catalogue?category=vetements"
            className="bg-gradient-to-b from-[#1f1e1a] to-[#2a2924] rounded-[2rem] p-8 shadow-xl hover:shadow-[0_15px_40px_rgba(216,182,82,0.25)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-5 group col-span-2 md:col-span-1 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#d8b652]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-20 h-20 bg-[#d8b652]/10 rounded-full flex items-center justify-center text-[#d8b652] group-hover:scale-110 group-hover:bg-[#d8b652] group-hover:text-[#1f1e1a] transition-all duration-300 shadow-[0_0_20px_rgba(216,182,82,0.15)] z-10">
              <Shirt className="w-10 h-10" />
            </div>
            <span className="font-bold text-white text-lg z-10">
              {t.home.catClothes}
            </span>
          </Link>
        </div>
      </section>

      {/* Banner Section */}
      <AnimatedBanner />

      {/* FEATURED ARTICLES SECTION */}
      <section className="mb-24 w-full">
        <h2 className="text-3xl font-bold text-[#1f1e1a] text-center mb-12">
          {t.home.featured}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredArticles.length > 0 ? (
            featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/catalogue/${article.id}`}
                className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col group"
              >
                <div className="relative aspect-[4/3] w-full mb-6 bg-gray-50 rounded-2xl overflow-hidden">
                  {article.images.length > 0 ? (
                    <Image
                      src={article.images[0]}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📷
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleHeartClick(e, article.id)}
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur p-2 rounded-full transition-colors z-10 hover:scale-110"
                    title={likedArticleIds.includes(article.id) ? "Je n'aime plus" : "J'aime"}
                  >
                    <Heart className={`h-5 w-5 transition-colors ${likedArticleIds.includes(article.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
                  </button>
                </div>

                <div className="px-2 pb-2">
                  <h3 className="font-bold text-lg text-[#1f1e1a] mb-1 line-clamp-1">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {article.description}
                  </p>

                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-black text-xl text-[#d8b652]">
                      {article.price.toLocaleString()} {t.common.currency}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-[#d8b652]/30 flex flex-col items-center justify-center gap-4 shadow-sm col-span-full">
              <div className="w-16 h-16 bg-[#d8b652]/10 rounded-full flex items-center justify-center">
                <span className="text-[#d8b652] text-2xl">✨</span>
              </div>
              <h3 className="font-bold text-xl text-[#1f1e1a]">
                {t.home.noFeatured}
              </h3>
              <p className="text-gray-500 font-medium">
                {t.home.noFeaturedDesc}
              </p>
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/catalogue"
            className="bg-gradient-to-r from-[#1f1e1a] to-[#2d2c26] text-white px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-[0_10px_20px_rgba(31,30,26,0.2)] hover:shadow-[0_15px_30px_rgba(216,182,82,0.3)] inline-flex items-center justify-center gap-3 group"
          >
            {t.cart.discoverCatalogue}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </main>
  );
}
