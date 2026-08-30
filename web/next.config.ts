import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Admin-uploaded product images, served by the Express backend on Railway.
      { protocol: "https", hostname: "**.up.railway.app" },
      // Seed/demo images.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Local dev backend.
      { protocol: "http", hostname: "localhost", port: "4000" },
    ],
  },
};

export default nextConfig;
