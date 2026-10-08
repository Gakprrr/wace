"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/lib/i18n/LangProvider";
import Logo from "@/components/Logo";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, LogOut, X, Menu as MenuIcon, Bell } from "lucide-react";
import { useCart } from "@/context/CartContext";
import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, locale, toggleLocale } = useLang();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    fetch("/api/users/me/notifications")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        }
      })
      .catch(console.error);

    const eventSource = new EventSource("/api/notifications/subscribe");
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.id) {
          setUnreadCount(prev => prev + 1);
        }
      } catch {}
    };
    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6 lg:px-8 pb-4">
      <div className="max-w-[98%] mx-auto bg-white/95 backdrop-blur-xl rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.08)] border-2 border-white/80 ring-1 ring-gray-200/50 px-6 sm:px-10 py-3 flex items-center justify-between">

        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center justify-center group">
            <Logo className="w-28 sm:w-32 h-auto transition-transform group-hover:scale-105" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
          <Link
            href="/"
            className={`font-sans text-sm transition-colors ${pathname === "/" ? "text-[#d8b652] font-bold" : "text-gray-600 hover:text-[#d8b652] font-medium"
              }`}
          >
            {t.nav.home}
          </Link>
          <Link
            href="/catalogue"
            className={`font-sans text-sm transition-colors ${pathname.startsWith("/catalogue") ? "text-[#d8b652] font-bold" : "text-gray-600 hover:text-[#d8b652] font-medium"
              }`}
          >
            {t.nav.catalogue}
          </Link>
          <Link
            href="/about"
            className={`font-sans text-sm transition-colors whitespace-nowrap ${pathname.startsWith("/about") ? "text-[#d8b652] font-bold" : "text-gray-600 hover:text-[#d8b652] font-medium"
              }`}
          >
            {t.nav.about}
          </Link>
          <Link
            href="/contact"
            className={`font-sans text-sm transition-colors ${pathname.startsWith("/contact") ? "text-[#d8b652] font-bold" : "text-gray-600 hover:text-[#d8b652] font-medium"
              }`}
          >
            {t.nav.contact}
          </Link>
        </nav>

        {/* Right side — Auth Controls */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
          <SearchBar />
          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="relative flex items-center w-[4.5rem] h-8 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-inner bg-gradient-to-r from-[#d8b652] to-[#c3a242] overflow-hidden"
            title={locale === 'en' ? 'Passer en Français' : 'Switch to English'}
          >
            <span
              className={`absolute text-xs font-extrabold text-white transition-all duration-300 ${locale === 'en' ? 'left-2.5' : 'right-2.5'
                }`}
            >
              {locale === 'en' ? 'FR' : 'EN'}
            </span>
            <div
              className={`absolute w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 z-10 ${locale === 'en' ? 'translate-x-[2.1rem]' : 'translate-x-0'
                }`}
            >
              <span className="text-[10px] font-black text-[#d8b652] mt-[1px]">
                {locale === 'en' ? 'EN' : 'FR'}
              </span>
            </div>
          </button>

          <Link href="/cart" className="flex items-center gap-1 text-gray-700 hover:text-[#d8b652] transition-colors mr-2 ml-1 whitespace-nowrap">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-medium">{t.nav.cart} ({totalItems})</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/wishlist"
                className="text-gray-600 hover:text-red-500 transition-colors p-2"
                title="Wishlist"
              >
                ♥️
              </Link>
              <Link
                href="/notifications"
                className="relative text-gray-600 hover:text-[#d8b652] transition-colors p-2"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Link>
              <Link
                href={user.role === "ADMIN" ? "/admin/dashboard" : "/profile"}
                className="bg-[#d8b652] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#c3a242] transition-all shadow-md shadow-[#d8b652]/20 whitespace-nowrap"
              >
                {user.role === "ADMIN" ? t.nav.adminDashboard : t.nav.profile}
              </Link>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title={t.nav.logout}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="bg-[#d8b652] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#c3a242] transition-all shadow-md shadow-[#d8b652]/20"
              >
                {t.nav.login}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-7xl bg-white/95 backdrop-blur-md rounded-2xl p-4 space-y-3 shadow-lg border border-white/50">
          <Link
            href="/catalogue"
            className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-[#d8b652] font-medium transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t.nav.catalogue}
          </Link>
          <Link
            href="/contact"
            className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-[#d8b652] font-medium transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t.nav.contact}
          </Link>
          {user && (
            <>
              <Link
                href="/wishlist"
                className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-[#d8b652] font-medium transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {t.nav.wishlist}
              </Link>
              <Link
                href={user.role === "ADMIN" ? "/admin/dashboard" : "/profile"}
                className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-[#d8b652] font-medium transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {user.role === "ADMIN" ? t.nav.adminDashboard : t.nav.profile}
              </Link>
            </>
          )}


          {/* Mobile Language Toggle */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 mt-2">
            <span className="text-gray-700 font-medium">Langue / Language</span>
            <button
              onClick={toggleLocale}
              className="relative flex items-center w-[4.5rem] h-8 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-inner bg-gradient-to-r from-[#d8b652] to-[#c3a242] overflow-hidden"
            >
              <span
                className={`absolute text-xs font-extrabold text-white transition-all duration-300 ${locale === 'en' ? 'left-2.5' : 'right-2.5'
                  }`}
              >
                {locale === 'en' ? 'FR' : 'EN'}
              </span>
              <div
                className={`absolute w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 z-10 ${locale === 'en' ? 'translate-x-[2.1rem]' : 'translate-x-0'
                  }`}
              >
                <span className="text-[10px] font-black text-[#d8b652] mt-[1px]">
                  {locale === 'en' ? 'EN' : 'FR'}
                </span>
              </div>
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="w-full text-center bg-gray-100 text-gray-600 font-semibold py-3 px-4 rounded-xl transition-colors hover:bg-gray-200"
              >
                {t.nav.logout}
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full text-center bg-[#d8b652] text-white font-semibold py-3 px-4 rounded-xl transition-colors hover:bg-[#c3a242] shadow-sm"
                onClick={() => setMenuOpen(false)}
              >
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
