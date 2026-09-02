"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/lib/i18n/LangProvider";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function ClientNotificationsPage() {
  const { user } = useAuth();
  const { t, locale } = useLang();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/users/me/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/users/me/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
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
              <a href="/wishlist" className="flex items-center space-x-3 text-sm text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or hover:bg-anthracite/20 py-2 px-3 rounded-xl transition-all">
                <span>❤️</span>
                <span>{t.nav.wishlist}</span>
              </a>
              <a href="/notifications" className="flex items-center space-x-3 text-sm font-bold text-or py-2 px-3 bg-or/10 rounded-xl">
                <span>🔔</span>
                <span>{t.nav.notifications}</span>
              </a>
            </nav>
          </div>

          {/* Notifications List Area */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-8 rounded-3xl shadow-sm h-full min-h-[300px]">
              <h2 className="text-lg font-bold mb-6">{t.notifications.title} ({notifications.length})</h2>

              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-24 rounded-2xl bg-beige/30 dark:bg-anthracite/40 animate-pulse border border-beige/40 dark:border-anthracite/60"></div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-4">🔔</span>
                  <p className="text-sm text-encre/65 dark:text-encre dark:text-ivoire/65">
                    {t.notifications.empty}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        notif.isRead
                          ? "bg-beige/10 dark:bg-anthracite/10 border-beige/20 dark:border-anthracite/40 text-encre/60 dark:text-encre dark:text-ivoire/60"
                          : "bg-gray-50 dark:bg-anthracite border-beige dark:border-anthracite/80 text-encre dark:text-ivoire shadow-sm font-medium"
                      }`}
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          {!notif.isRead && (
                            <span className="w-2.5 h-2.5 bg-or rounded-full flex-shrink-0"></span>
                          )}
                          <h4 className="font-bold text-sm">{notif.title}</h4>
                        </div>
                        <p className="text-xs text-encre/70 dark:text-encre dark:text-ivoire/75 mt-1 leading-relaxed font-light">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-encre/40 dark:text-encre dark:text-ivoire/40 mt-2 block">
                          {new Date(notif.createdAt).toLocaleString(locale === 'fr' ? "fr-FR" : "en-US")}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs bg-or/10 text-or hover:bg-or hover:text-encre font-bold py-1.5 px-3 rounded-full border border-or/20 transition-all flex-shrink-0"
                        >
                          {t.notifications.markAllRead}
                        </button>
                      )}
                    </div>
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
