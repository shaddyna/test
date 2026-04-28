import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Actions (App Router)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Cloudinary image support
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;