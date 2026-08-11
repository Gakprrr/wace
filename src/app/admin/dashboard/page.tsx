"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

interface Stats {
  totalArticles: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  newUsersToday: number;
}

interface UserStats {
  totalUsers: number;
  activeUsersLast30Days: number;
  registrationsByDay: Record<string, number>;
}

interface ArticleStat {
  id: string;
  title: string;
  price: number;
  views?: number;
  images: string[];
  _count?: {
    likes?: number;
    comments?: number;
  };
}

interface ArticleStats {
  mostViewed: ArticleStat[];
  mostLiked: ArticleStat[];
  mostCommented: ArticleStat[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [articleStats, setArticleStats] = useState<ArticleStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal comments state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedArticleTitle, setSelectedArticleTitle] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);

  // Dropdown state
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const statsRes = await fetch("/api/admin/stats");
        const articlesRes = await fetch("/api/admin/stats/articles");
        const usersRes = await fetch("/api/admin/stats/users");

        if (statsRes.ok && articlesRes.ok && usersRes.ok) {
          const statsData = await statsRes.json();
          const articlesData = await articlesRes.json();
          const usersData = await usersRes.json();
          setStats(statsData);
          setArticleStats(articlesData);
          setUserStats(usersData);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    window.open(`/api/admin/export/catalogue?format=${format}`, "_blank");
    setExportDropdownOpen(false);
  };

  const openComments = async (articleId: string, title: string) => {
    setSelectedArticleTitle(title);
    setIsCommentsOpen(true);
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data.comments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="animate-pulse font-medium text-or">Chargement des données du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 sm:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-beige/45 dark:border-anthracite/60">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Tableau de <span className="text-or italic font-light">Bord</span>
            </h1>
            <p className="text-sm text-encre/80 dark:text-ivoire/80 mt-1">
              Vue globale de l'activité de votre boutique WACE.
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center space-x-2 bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-3 px-6 rounded-full text-sm shadow-md transition-all"
            >
              <span>📥</span>
              <span>Exporter le Catalogue</span>
              <span className="text-[10px]">▼</span>
            </button>
            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 rounded-2xl shadow-xl z-50 overflow-hidden text-sm">
                <button onClick={() => handleExport("csv")} className="w-full text-left px-4 py-3 hover:bg-beige/20 dark:hover:bg-anthracite/80 transition-colors font-medium border-b border-beige/10">
                  📄 Format CSV
                </button>
                <button onClick={() => handleExport("excel")} className="w-full text-left px-4 py-3 hover:bg-beige/20 dark:hover:bg-anthracite/80 transition-colors font-medium border-b border-beige/10">
                  📊 Format Excel (.xlsx)
                </button>
                <button onClick={() => handleExport("pdf")} className="w-full text-left px-4 py-3 hover:bg-beige/20 dark:hover:bg-anthracite/80 transition-colors font-medium">
                  📕 Format PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-beige/5 dark:hover:bg-anthracite/80 hover:border-or/50 group cursor-default">
              <span className="text-3xl inline-block transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">🧥</span>
              <h3 className="text-encre/80 dark:text-ivoire/80 text-sm uppercase tracking-wider font-bold mt-4 group-hover:text-or transition-colors">
                Total Articles
              </h3>
              <p className="text-3xl font-black mt-1 group-hover:text-or">{stats.totalArticles}</p>
            </div>
            <div className="bg-white dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-beige/5 dark:hover:bg-anthracite/80 hover:border-or/50 group cursor-default">
              <span className="text-3xl inline-block transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">👥</span>
              <h3 className="text-encre/80 dark:text-ivoire/80 text-sm uppercase tracking-wider font-bold mt-4 group-hover:text-or transition-colors">
                Utilisateurs
              </h3>
              <p className="text-3xl font-black mt-1 group-hover:text-or">{stats.totalUsers}</p>
            </div>
            <div className="bg-white dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-beige/5 dark:hover:bg-anthracite/80 hover:border-or/50 group cursor-default">
              <span className="text-3xl inline-block transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">👁️</span>
              <h3 className="text-encre/80 dark:text-ivoire/80 text-sm uppercase tracking-wider font-bold mt-4 group-hover:text-or transition-colors">
                Vues de pages
              </h3>
              <p className="text-3xl font-black mt-1 group-hover:text-or">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-beige/5 dark:hover:bg-anthracite/80 hover:border-or/50 group cursor-default">
              <span className="text-3xl inline-block transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">📈</span>
              <h3 className="text-encre/80 dark:text-ivoire/80 text-sm uppercase tracking-wider font-bold mt-4 group-hover:text-or transition-colors">
                Inscrits ce jour
              </h3>
              <p className="text-3xl font-black mt-1 text-or">{stats.newUsersToday}</p>
            </div>
          </div>
        )}

        {/* User Stats Card */}
        {userStats && (
          <div className="mb-12 bg-white dark:bg-anthracite/40 border border-beige/45 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-or border-b border-beige/40 dark:border-anthracite/60 pb-3 mb-4 flex justify-between items-center">
              <span>Statistiques Utilisateurs Détaillées</span>
              <span className="text-lg opacity-50">👥</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-anthracite/80 border border-beige/30 dark:border-anthracite p-4 rounded-2xl flex flex-col justify-center">
                <p className="text-encre/60 dark:text-ivoire/60 text-xs font-semibold mb-1">Utilisateurs actifs (30 derniers jours)</p>
                <p className="text-3xl font-bold text-encre dark:text-ivoire">{userStats.activeUsersLast30Days}</p>
              </div>
              <div className="bg-gray-50 dark:bg-anthracite/80 border border-beige/30 dark:border-anthracite p-4 rounded-2xl flex flex-col justify-center relative">
                <p className="text-encre/60 dark:text-ivoire/60 text-xs font-semibold mb-2">Inscriptions (7 derniers jours)</p>
                <div className="flex items-end gap-2 h-24 w-full mt-2">
                  {(() => {
                    const maxCount = Math.max(1, ...Object.values(userStats.registrationsByDay));
                    return Object.entries(userStats.registrationsByDay).map(([day, count]) => (
                      <div key={day} className="flex flex-col items-center flex-1 gap-1 group h-full justify-end">
                        <div 
                          className="w-full bg-or rounded-t-md transition-all relative group-hover:bg-or/80 shadow-sm" 
                          style={{ height: `${Math.max((count / maxCount) * 100, 8)}%` }}
                        >
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-encre text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {count} inscrits
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-encre/70 dark:text-ivoire/70 mt-1">{day.slice(-2)}</span>
                      </div>
                    ));
                  })()}
                  {Object.keys(userStats.registrationsByDay).length === 0 && (
                    <p className="text-xs text-encre/40 dark:text-ivoire/40 mt-auto mb-auto w-full text-center">Aucune nouvelle inscription</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Lists */}
        {articleStats && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Most Viewed */}
            <div className="bg-white dark:bg-anthracite/40 border border-beige/45 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm transform transition-all duration-300 hover:shadow-lg hover:border-or/30">
              <h3 className="font-bold text-sm uppercase tracking-wider text-or border-b border-beige/40 dark:border-anthracite/60 pb-3 mb-4 flex justify-between items-center">
                <span>Articles les plus vus</span>
                <span className="text-lg opacity-50">🔥</span>
              </h3>
              <div className="flex flex-col gap-2">
                {articleStats.mostViewed.map((art) => (
                  <div key={art.id} className="flex items-center gap-3.5 p-2 -mx-2 rounded-2xl transition-colors duration-200 hover:bg-beige/20 dark:hover:bg-anthracite/60 group cursor-pointer">
                    <img
                      src={art.images[0] || "https://placehold.co/80x100/1a1a18/c8a96e?text=WACE"}
                      alt=""
                      className="w-10 h-12 object-cover rounded-lg bg-beige/20 border border-beige/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2 shadow-sm"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-sm font-bold truncate group-hover:text-or transition-colors">{art.title}</h4>
                      <span className="text-xs text-or font-semibold">{art.price.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <span className="text-xs text-encre/60 dark:text-encre dark:text-ivoire/60 font-semibold group-hover:text-or transition-colors">{art.views} vues</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Liked */}
            <div className="bg-white dark:bg-anthracite/40 border border-beige/45 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm transform transition-all duration-300 hover:shadow-lg hover:border-or/30">
              <h3 className="font-bold text-sm uppercase tracking-wider text-or border-b border-beige/40 dark:border-anthracite/60 pb-3 mb-4 flex justify-between items-center">
                <span>Articles les plus aimés</span>
                <span className="text-lg opacity-50">❤️</span>
              </h3>
              <div className="flex flex-col gap-2">
                {articleStats.mostLiked.map((art) => (
                  <div key={art.id} className="flex items-center gap-3.5 p-2 -mx-2 rounded-2xl transition-colors duration-200 hover:bg-beige/20 dark:hover:bg-anthracite/60 group cursor-pointer">
                    <img
                      src={art.images[0] || "https://placehold.co/80x100/1a1a18/c8a96e?text=WACE"}
                      alt=""
                      className="w-10 h-12 object-cover rounded-lg bg-beige/20 border border-beige/40 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2 shadow-sm"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-sm font-bold truncate group-hover:text-or transition-colors">{art.title}</h4>
                      <span className="text-xs text-or font-semibold">{art.price.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <span className="text-xs text-red-400 font-semibold flex items-center gap-1 group-hover:scale-110 transition-transform">
                      <span className="group-hover:animate-ping">❤️</span>
                      <span>{art._count?.likes ?? 0}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Commented */}
            <div className="bg-white dark:bg-anthracite/40 border border-beige/45 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm transform transition-all duration-300 hover:shadow-lg hover:border-or/30">
              <h3 className="font-bold text-sm uppercase tracking-wider text-or border-b border-beige/40 dark:border-anthracite/60 pb-3 mb-4 flex justify-between items-center">
                <span>Articles les plus commentés</span>
                <span className="text-lg opacity-50">💬</span>
              </h3>
              <div className="flex flex-col gap-2">
                {articleStats.mostCommented.map((art) => (
                  <div 
                    key={art.id} 
                    onClick={() => openComments(art.id, art.title)}
                    className="flex items-center gap-3.5 p-2 -mx-2 rounded-2xl transition-colors duration-200 hover:bg-beige/20 dark:hover:bg-anthracite/60 group cursor-pointer"
                  >
                    <img
                      src={art.images[0] || "https://placehold.co/80x100/1a1a18/c8a96e?text=WACE"}
                      alt=""
                      className="w-12 h-14 object-cover rounded-lg bg-beige/20 border border-beige/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2 shadow-sm"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-sm font-bold truncate group-hover:text-or transition-colors">{art.title}</h4>
                      <span className="text-sm text-or font-semibold">{art.price.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <span className="text-sm text-blue-500 font-bold flex items-center gap-1 group-hover:scale-110 transition-transform bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                      <span className="group-hover:animate-bounce">💬</span>
                      <span>{art._count?.comments ?? 0}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Commentaires */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-encre/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-anthracite w-full max-w-2xl rounded-3xl shadow-2xl border border-beige/50 dark:border-anthracite/80 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-beige/30 dark:border-anthracite/60 flex justify-between items-center bg-gray-50 dark:bg-anthracite/50">
              <h2 className="font-display text-xl font-bold">
                Commentaires : <span className="text-or italic font-light">{selectedArticleTitle}</span>
              </h2>
              <button 
                onClick={() => setIsCommentsOpen(false)}
                className="text-encre/50 hover:text-red-500 transition-colors"
              >
                ✖
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-anthracite">
              {commentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin text-4xl text-or">⏳</div>
                </div>
              ) : commentsList.length === 0 ? (
                <div className="text-center py-12 text-encre/50 dark:text-ivoire/50">
                  <span className="text-3xl block mb-3">👻</span>
                  Aucun commentaire pour cet article.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {commentsList.map((comment, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-anthracite/80 p-4 rounded-2xl border border-beige/20 dark:border-anthracite/40">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-or/20 flex items-center justify-center text-or font-bold text-xs uppercase">
                            {comment.user?.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight">{comment.user?.name || "Anonyme"}</p>
                            <p className="text-[10px] text-encre/50 dark:text-ivoire/50">
                              {new Date(comment.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {comment.rating && (
                          <div className="text-or font-bold text-sm bg-or/10 px-2 py-1 rounded-full">
                            ★ {comment.rating}/5
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-encre/80 dark:text-ivoire/80 ml-10 italic">"{comment.content}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
