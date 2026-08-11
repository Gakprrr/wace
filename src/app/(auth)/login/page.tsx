"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Globe } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/lib/i18n/LangProvider";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [code2FA, setCode2FA] = useState("");

  const { login } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      if (data.requires2FA) {
        setStep(2);
      } else {
        login(data.user);
        if (data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code2FA.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code2FA }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Code invalide");
      }

      login(data.user);
      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Code invalide");
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNF7ezU74URa5aFUqp2DcOeswb9qxH9jBj-xOaLDCUh_UqX7xWaX4jbbP1Lv3mrGJ6OOU4NicxQkKF5ubvSK40RZmKaxDN_XA5SViAP0CWRiEV1UuBiyOa9BCNxuGaJP6lJlzdTBwFTv-LJ0qe44fDtISabqd3diobQxMiV9gA5gPvtHpO-jga6sYAj6db_2OE2eBDwfIF-JTNYtfDwsNO_d1TkuTW_GgeqQIA5l-poIm0_2AvXlHMr32cpQlLMY9IbYokob1RaKs=s2048"
            alt="Fashion model"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-8">
              <img src="/logo-simple.png" alt="WACE Logo" className="w-48 md:w-56 h-auto object-contain drop-shadow-md" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {step === 1 ? t.auth.loginTitle : t.auth.verify2FA}
            </h1>
            <p className="text-gray-500 text-sm">
              {step === 1
                ? t.auth.loginSubtitle
                : t.auth.verify2FASubtitle}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 mb-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">{t.auth.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.email}
                  required
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-base font-medium"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="block text-sm font-medium text-gray-700">{t.auth.password}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.password}
                    required
                    className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-base font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#d8b652] focus:ring-[#d8b652] w-4 h-4 border-gray-300" />
                  <span className="text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#d8b652] font-semibold hover:underline">
                  {t.auth.forgotPassword}
                </Link>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#d8b652] text-white rounded-full py-3.5 font-semibold hover:bg-[#c3a242] transition-colors disabled:opacity-50"
                >
                  {loading ? t.auth.loggingIn : t.auth.loginBtn}
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
                {t.auth.noAccount} <Link href="/register" className="text-[#d8b652] font-semibold hover:underline">{t.auth.loginLink}</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 text-center">{t.auth.authCode}</label>
                <input
                  type="text"
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d8b652] focus:border-transparent transition-all text-center text-3xl tracking-[0.5em] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code2FA.length !== 6}
                className="w-full bg-[#d8b652] text-white rounded-full py-3.5 font-semibold hover:bg-[#c3a242] transition-colors disabled:opacity-50"
              >
                {loading ? t.auth.loggingIn : t.auth.verify}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-800"
              >
                {t.auth.backToLogin}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}