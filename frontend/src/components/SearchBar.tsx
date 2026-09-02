"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Article {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data || []);
          setOpen(true);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/catalogue?search=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  return (
    <div ref={wrapperRef} className="relative hidden lg:flex items-center">
      <form onSubmit={handleSubmit} className="relative w-56 xl:w-64">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 dark:bg-anthracite/50 border border-beige/40 dark:border-anthracite rounded-full focus:outline-none focus:ring-1 focus:ring-or focus:bg-white dark:focus:bg-anthracite transition-all text-encre dark:text-ivoire"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-encre/40 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-encre/40 dark:text-ivoire/40" />
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 w-80 right-0 xl:right-auto xl:left-0 bg-white dark:bg-anthracite border border-beige/60 dark:border-anthracite/80 shadow-xl rounded-2xl overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-center text-encre/60 dark:text-ivoire/60">
              Aucun résultat pour "{query}"
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {results.slice(0, 5).map((article) => (
                <Link
                  key={article.id}
                  href={`/catalogue/${article.id}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-anthracite/80 transition-colors border-b border-gray-100 dark:border-anthracite/60 last:border-0"
                >
                  <img
                    src={article.images[0] || "https://placehold.co/100x100/1a1a18/c8a96e?text=WACE"}
                    alt={article.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-encre dark:text-ivoire truncate">
                      {article.title}
                    </p>
                    <p className="text-xs font-bold text-or">
                      {article.price.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </Link>
              ))}
              {results.length > 5 && (
                <button
                  onClick={handleSubmit}
                  className="w-full p-3 text-sm font-medium text-center text-or hover:bg-or/5 transition-colors"
                >
                  Voir tous les résultats ({results.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
