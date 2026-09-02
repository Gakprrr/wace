"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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

  return (
    <main className="flex-1 w-[95%] mx-auto relative flex flex-col px-4 sm:px-6 lg:px-8 mt-6">
      {/* HERO SECTION */}
      <section className="relative w-full h-[50vh] sm:h-[55vh] mb-24 sm:mb-32 flex flex-col md:flex-row items-center rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/80 ring-1 ring-gray-200/60">
        <div className="absolute inset-0 pointer-events-none bg-[#e8e6d1] rounded-[2rem] sm:rounded-[3rem] overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute bottom-[-15%] right-[5%] w-[450px] h-[450px] bg-blue-400/20 rounded-full blur-[90px]" />

          <div className="absolute top-1/3 right-[10%] w-[350px] h-2 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent transform rotate-45 blur-[2px] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
          <div className="absolute bottom-[30%] right-[15%] w-[500px] h-2 bg-gradient-to-r from-transparent via-blue-300/40 to-transparent transform -rotate-[15deg] blur-[3px] shadow-[0_0_25px_rgba(59,130,246,0.4)]" />

          <div className="absolute top-[12%] right-[15%] w-40 h-40 border-2 border-blue-500/30 rounded-full" />
          <div className="absolute top-[40%] right-[5%] w-[350px] h-[350px] border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_40s_linear_infinite]" />
          <div className="absolute bottom-[20%] right-[25%] w-32 h-32 bg-blue-500/10 rounded-full blur-[15px]" />

          <div className="absolute top-[25%] right-[12%] text-blue-400/50 text-2xl font-bold tracking-widest">
            + + +
          </div>
          <div className="absolute bottom-[40%] right-[18%] w-16 h-16 border-t-2 border-l-2 border-blue-400/40 transform rotate-45" />
          <div className="absolute top-[50%] right-[8%] flex gap-2">
            <span className="w-2 h-2 bg-blue-400/50 rounded-full"></span>
            <span className="w-2 h-2 bg-blue-400/50 rounded-full"></span>
            <span className="w-2 h-2 bg-blue-400/50 rounded-full"></span>
          </div>
        </div>

        <div className="relative z-20 w-full h-full flex flex-col md:flex-row items-center px-4 md:px-8 lg:px-16 gap-6">
          <div className="w-full md:w-[40%] h-full flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/60 mb-4 w-fit shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-sm font-bold text-gray-700 tracking-wide uppercase">
                {t.home.newCollection}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1f1e1a] leading-[1.1] mb-4 drop-shadow-sm">
              {t.home.heroTitle1}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                {t.home.heroTitle2}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-700 font-medium bg-white/30 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm relative z-20">
              {t.home.heroDesc}
            </p>
          </div>

          <div className="w-full md:w-[35%] h-[75%] md:h-[85%] relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white/80 z-20 transform hover:scale-[1.02] transition-transform duration-500">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
              alt={t.home.newCollection}
              fill
              className="object-cover object-center"
              priority
              unoptimized
            />
          </div>

          <div className="hidden md:flex w-[25%] h-full relative z-10 flex-col justify-center items-center pointer-events-none">
            <div className="absolute top-[15%] left-[20%] text-7xl lg:text-8xl font-black text-[#d8b652]/70 transform -rotate-12 drop-shadow-md select-none">
              W
            </div>
            <div className="absolute top-[40%] right-[10%] text-8xl lg:text-9xl font-black text-[#d8b652]/60 transform rotate-[15deg] drop-shadow-md select-none">
              A
            </div>
            <div className="absolute bottom-[20%] left-[10%] text-6xl lg:text-7xl font-black text-[#d8b652]/75 transform rotate-[45deg] drop-shadow-md select-none">
              C
            </div>
            <div className="absolute top-[65%] left-[45%] text-7xl lg:text-8xl font-black text-[#d8b652]/80 transform rotate-[75deg] drop-shadow-md select-none">
              E
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-6xl">
          <HeroSearch />
        </div>
      </section>

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
                  <button className="absolute top-3 right-3 bg-white/80 backdrop-blur p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
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
