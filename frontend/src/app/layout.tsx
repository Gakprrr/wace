import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LangProvider } from "@/lib/i18n/LangProvider";
import { CartProvider } from "@/context/CartContext";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WACE — Wear The Energy",
  description: "Plateforme E-Commerce de Vente de Friperie (Seconde Main) de Luxe",
  manifest: "/manifest.json",
  themeColor: "#705C3B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WACE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#705C3B" />
      </head>
      <body className="min-h-full flex flex-col bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire transition-colors duration-200">
        <ThemeProvider>
          <LangProvider>
            <AuthProvider>
              <CartProvider>
                <PwaRegister />
                {children}
              </CartProvider>
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
