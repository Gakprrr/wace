"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/lib/i18n/LangProvider";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Eye, EyeOff, Globe } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Automatically log in the user after registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (loginRes.ok) {
        login(loginData.user);
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen bg-[#d8d6d4] flex items-center justify-center p-3 sm:p-4 md:p-6 font-sans overflow-hidden">
      <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-[820px] flex flex-col md:flex-row p-2.5 sm:p-3 max-h-[96vh]">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 relative min-h-[200px] md:min-h-[420px] rounded-[1.5rem] overflow-hidden bg-[#a4afd5] flex items-center justify-center">
          <img
            src="/images/login.jpeg"
            alt="WACE Fashion"
            className="w-full h-full object-contain p-1 rounded-[1.5rem]"
          />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-center">
          <div className="text-center mb-4 sm:mb-5">
            <div className="flex items-center justify-center mb-3">
              <Link href="/" title="Retour à l'accueil" className="cursor-pointer hover:opacity-90 transition-opacity">
                <Logo imgClassName="h-12 sm:h-14 md:h-16 w-auto" />
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {t.auth.registerTitle}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              {t.auth.registerSubtitle}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-2 mb-3 rounded-xl text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">{t.auth.fullName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.fullName}
                required
                className="w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-xs sm:text-sm font-semibold shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">{t.auth.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.email}
                required
                className="w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-xs sm:text-sm font-semibold shadow-xs"
              />
            </div>

            <div className="flex gap-2.5">
              <div className="space-y-1 w-1/2 relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">{t.auth.password}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.password}
                    required
                    className="w-full pl-3.5 pr-8 py-2 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-xs sm:text-sm font-semibold shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 w-1/2 relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">{t.auth.confirm}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.auth.confirmPassword}
                    required
                    className="w-full pl-3.5 pr-8 py-2 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-xs sm:text-sm font-semibold shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d8b652] text-white rounded-full py-2.5 text-xs sm:text-sm font-semibold hover:bg-[#c3a242] transition-colors disabled:opacity-50 shadow-xs"
              >
                {loading ? t.auth.registering : t.auth.registerBtn}
              </button>

              <button
                type="button"
                onClick={() => {
                  import("next-auth/react").then(({ signIn }) => signIn("google", { callbackUrl: "/" }));
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#f4f4f5] text-gray-900 rounded-full py-2.5 text-xs sm:text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                <Globe className="w-4 h-4 text-blue-500" />
                {t.auth.google}
              </button>
            </div>

            <p className="text-center text-xs sm:text-sm text-gray-600 mt-3">
              {t.auth.hasAccount} <Link href="/login" className="text-[#d8b652] font-semibold hover:underline">{t.auth.registerLink}</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
