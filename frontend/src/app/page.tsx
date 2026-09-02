import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api-client";
import HomePageClient, { Article } from "@/components/HomePageClient";



export default async function HomePage() {
  let featuredArticles: Article[] = [];

  try {
    const articlesRes = await apiClient.getFeaturedArticles();
    featuredArticles = articlesRes || [];
  } catch (error) {
    console.error("Failed to load homepage data:", error);
  }

  return (
    <div className="min-h-screen bg-gray-200 relative flex flex-col font-sans overflow-x-hidden selection:bg-[#d8b652] selection:text-[#1f1e1a]">
      {/* Premium Background Canvas: Subtle Dot Pattern & Ambient Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-300/20 rounded-full blur-[150px]" />
      </div>

      {/* Main Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <HomePageClient featuredArticles={featuredArticles} />

        <Footer />
      </div>
    </div>
  );
}
