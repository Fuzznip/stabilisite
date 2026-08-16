import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a build run against a throwaway output directory so it can't disturb
  // a dev server using the default .next (mixing the two corrupts its cache).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typescript: {
    ignoreBuildErrors: false,
  },
images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/avatars/**",
      },
      {
        // Proof screenshots from manual bot submissions are stored as the
        // Discord attachment URL rather than being re-uploaded to S3.
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/attachments/**",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
        port: "",
        pathname: "/attachments/**",
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
    minimumCacheTTL: 2678400, // 31 days
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
    staleTimes: {
      dynamic: 60, // Cache dynamic pages for 30 seconds on client-side navigation
    },
  },
};

export default nextConfig;
