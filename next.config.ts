import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/avatars/**",
      },
      {
        protocol: "https",
        hostname: "oldschool.runescape.wiki",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "stability-event.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "stability-event.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stability-diaries.s3.amazonaws.com",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        port: "",
        pathname: "**",
      },
    ],
  },
  experimental: {
    useCache: true,
    serverActions: {
      bodySizeLimit: "8mb",
    },
    staleTimes: {
      dynamic: 60, // Cache dynamic pages for 30 seconds on client-side navigation
    },
  },
};

export default nextConfig;
