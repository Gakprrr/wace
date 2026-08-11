"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useLang } from "@/lib/i18n/LangProvider";
import Logo from "./Logo";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminProfileModal from "./AdminProfileModal";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLang();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const links = [
    { label: t.admin.sidebar.dashboard, href: "/admin/dashboard", icon: "📊" },
    { label: t.admin.sidebar.articles, href: "/admin/articles", icon: "🧥" },
    { label: t.admin.sidebar.categories, href: "/admin/categories", icon: "📁" },
    { label: t.admin.sidebar.users, href: "/admin/users", icon: "👥" },
    { label: t.admin.sidebar.contacts, href: "/admin/contacts", icon: "📞" },
    { label: t.admin.sidebar.notifications, href: "/admin/notifications", icon: "🔔" },
  ];

  return (
    <aside 
      className={`sticky top-4 m-4 rounded-[2.5rem] bg-[#705C3B] backdrop-blur-2xl border border-white/20 flex flex-col h-[calc(100vh-2rem)] text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 ease-in-out self-start ${
        isCollapsed ? "w-24" : "w-64"
      }`}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white text-[#705C3B] rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Title / Logo */}
      <div className={`pt-10 pb-6 flex items-center justify-center transition-all duration-300 ${isCollapsed ? "px-2" : "px-6"}`}>
        <Link href="/" className="flex items-center justify-center">
          {isCollapsed ? (
            <span className="font-display font-bold text-xl tracking-widest text-white">W.</span>
          ) : (
            <Logo className="w-32 h-auto" />
          )}
        </Link>
      </div>

      {/* Nav Links */}
      <nav className={`flex-1 flex flex-col gap-3 mt-4 ${isCollapsed ? "px-3" : "px-5"}`}>
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-full transition-all duration-300 overflow-hidden ${
                isActive
                  ? "bg-white text-[#705C3B] shadow-sm font-bold"
                  : "text-white/70 hover:bg-white/20 hover:text-white"
              } ${isCollapsed ? "justify-center p-3" : "px-5 py-3.5 space-x-4"}`}
              title={isCollapsed ? link.label : undefined}
            >
              <span className={`text-xl transition-transform duration-300 ${isActive && !isCollapsed ? "scale-110" : ""}`}>
                {link.icon}
              </span>
              {!isCollapsed && (
                <span className="truncate tracking-wide text-sm">{link.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin details footer */}
      <div 
        onClick={() => setIsProfileModalOpen(true)}
        className={`mb-6 mt-4 flex items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-full cursor-pointer transition-all duration-300 ${isCollapsed ? "mx-3 p-2 justify-center" : "mx-5 p-3 space-x-3"}`}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white text-[#705C3B] flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-sm border border-white/40 group-hover:scale-105 transition-transform">
            {user?.name?.charAt(0) || "A"}
          </div>
        )}
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
            <span className="text-sm font-bold truncate text-white">{user?.name || "Admin"}</span>
            <span className="text-[10px] text-white/60 truncate uppercase tracking-wider">{user?.email || "admin@wace.com"}</span>
          </div>
        )}
      </div>

      <AdminProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </aside>
  );
}
