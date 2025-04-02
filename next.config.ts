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
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
