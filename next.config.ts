import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo placeholder host + future media hosts (R2 / Cloudflare Images).
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "imagedelivery.net" }, // Cloudflare Images
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
