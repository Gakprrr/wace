import type { NextConfig } from "next";

const API_BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const nextConfig: NextConfig = {
  turbopack: {
    // Point Turbopack to the project root to avoid workspace root inference warnings
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Cloudinary — production image hosting
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Unsplash — used in seed data / demo articles
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Placeholder — used in mock/dev upload mode
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
