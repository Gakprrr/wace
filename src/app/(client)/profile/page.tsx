"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/lib/i18n/LangProvider";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProfilePage() {
  const { user, refreshSession } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  // Profile Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", isError: false });

  // 2FA Setup states
  const [setup2FA, setSetup2FA] = useState<{ secret: string; qrCode: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [loading2FA, setLoading2FA] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setProfileMessage({ text: "", isError: false });

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatar }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de mise à jour");

      setProfileMessage({ text: t.profile.updateSuccess, isError: false });
      await refreshSession();
    } catch (err: any) {
      setProfileMessage({ text: err.message, isError: true });
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading2FA(true);
    setTwoFactorError("");
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'initialisation 2FA");

      setSetup2FA({ secret: data.secret, qrCode: data.qrCode });
    } catch (err: any) {
      setTwoFactorError(err.message);
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || loading2FA) return;

    setLoading2FA(true);
    setTwoFactorError("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Code invalide.");

      setSetup2FA(null);
      setVerificationCode("");
      await refreshSession();
    } catch (err: any) {
      setTwoFactorError(err.message);
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FAClick = () => {
    setIsConfirmOpen(true);
  };

  const executeDisable2FA = async () => {
    setLoading2FA(true);
    setTwoFactorError("");
    try {
      const res = await fetch("/api/auth/2fa/disable", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de désactivation 2FA");

      await refreshSession();
    } catch (err: any) {
      setTwoFactorError(err.message);
    } finally {
      setLoading2FA(false);
      setIsConfirmOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-8">
          {t.profile.mySpace} <span className="text-or italic font-light">{user.role === "ADMIN" ? t.profile.admin : t.profile.client}</span>
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
              <span className="text-xs text-or font-semibold tracking-wider mt-1">{user.role}</span>
            </div>
            <nav className="flex flex-col gap-2">
              <a href="/profile" className="flex items-center space-x-3 text-sm font-bold text-or py-2 px-3 bg-or/10 rounded-xl">
                <span>👤</span>
                <span>{t.nav.profile}</span>
              </a>
              <a href="/wishlist" className="flex items-center space-x-3 text-sm text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or hover:bg-anthracite/20 py-2 px-3 rounded-xl transition-all">
                <span>❤️</span>
                <span>{t.nav.wishlist}</span>
              </a>
              <a href="/notifications" className="flex items-center space-x-3 text-sm text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or hover:bg-anthracite/20 py-2 px-3 rounded-xl transition-all">
                <span>🔔</span>
                <span>{t.nav.notifications}</span>
              </a>
            </nav>
          </div>

          {/* Form / Content area */}
          <div className="md:col-span-2 flex flex-col gap-8">
            {/* Profile editing card */}
            <div className="bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-8 rounded-3xl shadow-sm">
              <h2 className="text-lg font-bold mb-6">{t.profile.personalInfo}</h2>

              {profileMessage.text && (
                <div className={`p-4 rounded-2xl mb-6 text-xs font-medium border ${
                  profileMessage.isError 
                    ? "bg-red-950/20 border-red-900/30 text-red-400" 
                    : "bg-green-950/20 border-green-900/30 text-green-400"
                }`}>
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                    {t.profile.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                    {t.profile.phone}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                    {t.profile.avatarUrl}
                  </label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-3.5 px-6 rounded-full transition-colors flex items-center justify-center text-sm disabled:opacity-40 self-start mt-2"
                >
                  {submittingProfile ? t.profile.saving : t.profile.saveChanges}
                </button>
              </form>
            </div>

            {/* 2FA Card */}
            <div className="bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-8 rounded-3xl shadow-sm">
              <h2 className="text-lg font-bold mb-4">{t.profile.accountSecurity}</h2>
              <p className="text-xs text-encre/65 dark:text-encre dark:text-ivoire/65 mb-6">
                {t.profile.enable2FA_desc}
              </p>

              {twoFactorError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-medium">
                  {twoFactorError}
                </div>
              )}

              {user.twoFactorEnabled ? (
                <div>
                  <div className="flex items-center space-x-2 text-green-500 text-sm font-bold mb-6">
                    <span>🛡️</span>
                    <span>{t.profile.twoFA_enabled}</span>
                  </div>
                  <button
                    onClick={handleDisable2FAClick}
                    disabled={loading2FA}
                    className="bg-red-950/40 text-red-400 border border-red-900/40 font-bold py-3 px-6 rounded-full transition-colors text-sm hover:bg-red-900/40"
                  >
                    {loading2FA ? t.profile.disabling : t.profile.disable2FA}
                  </button>
                </div>
              ) : setup2FA ? (
                <div className="flex flex-col items-center bg-beige/10 dark:bg-anthracite/20 p-6 border border-beige/45 dark:border-anthracite/60 rounded-2xl gap-5">
                  <div className="text-center text-xs">
                    <p className="font-bold">{t.profile.scanQR}</p>
                  </div>
                  <img src={setup2FA.qrCode} alt="QR Code 2FA" className="border-4 border-white rounded-lg w-44 h-44 shadow-sm" />
                  <div className="w-full">
                    <p className="text-[10px] text-center text-encre/60 dark:text-encre dark:text-ivoire/60 mb-4">
                      {t.profile.enterKey} <strong className="text-or select-all">{setup2FA.secret}</strong>
                    </p>
                    <form onSubmit={handleVerify2FA} className="flex gap-3 justify-center items-center max-w-xs mx-auto">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        className="py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 text-center font-bold tracking-[0.2em] focus:outline-none focus:border-or/60 w-36 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={loading2FA || verificationCode.length !== 6}
                        className="bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors"
                      >
                        {loading2FA ? t.profile.sending : t.profile.verify}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSetup2FA}
                  disabled={loading2FA}
                  className="bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-3.5 px-6 rounded-full transition-colors text-sm"
                >
                  {loading2FA ? t.profile.configuring : t.profile.enable2FA}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={t.profile.disable2FA_title}
        message={t.profile.disable2FA_msg}
        confirmText={t.profile.disable}
        cancelText={t.profile.cancel}
        onConfirm={executeDisable2FA}
        onCancel={() => setIsConfirmOpen(false)}
        variant="danger"
      />
    </div>
  );
}
