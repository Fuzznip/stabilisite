// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    discordId?: string;
    inStabilityDiscord?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string;
    inStabilityDiscord?: boolean;
  }
}
