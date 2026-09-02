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
    <main className="min-h-screen bg-[#d8d6d4] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-[850px] flex flex-col md:flex-row p-3">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[500px] rounded-[1.5rem] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
            alt="Fashion layout"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Logo Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <Logo className="w-[85%] max-w-[300px]" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-8">
              <Logo className="w-48 md:w-56 h-auto" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {t.auth.registerTitle}
            </h1>
            <p className="text-gray-500 text-sm">
              {t.auth.registerSubtitle}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 mb-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">{t.auth.fullName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.fullName}
                required
                className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-base font-semibold shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">{t.auth.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.email}
                required
                className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-base font-semibold shadow-sm"
              />
            </div>

            <div className="flex gap-3">
              <div className="space-y-1.5 w-1/2 relative">
                <label className="block text-sm font-medium text-gray-700">{t.auth.password}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.password}
                    required
                    className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-base font-semibold shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 w-1/2 relative">
                <label className="block text-sm font-medium text-gray-700">Confirmer</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.auth.password}
                    required
                    className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-base font-semibold shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d8b652] text-white rounded-full py-3.5 font-semibold hover:bg-[#c3a242] transition-colors disabled:opacity-50"
              >
                {loading ? t.auth.registering : t.auth.registerBtn}
              </button>

              <button
                type="button"
                onClick={() => {
                  import("next-auth/react").then(({ signIn }) => signIn("google", { callbackUrl: "/" }));
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#f4f4f5] text-gray-900 rounded-full py-3.5 font-semibold hover:bg-gray-200 transition-colors"
              >
                <Globe className="w-5 h-5 text-blue-500" />
                Google
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              {t.auth.hasAccount} <Link href="/login" className="text-[#d8b652] font-semibold hover:underline">{t.auth.registerLink}</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
