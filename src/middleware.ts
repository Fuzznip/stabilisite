import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Temporary allowed Discord IDs for bingo
const ALLOWED_BINGO_DISCORD_IDS = [
  "156543787882119168", // Tboodle
  "88087113626587136", // Funzip - not found in database
  "298216403666993155", // SuperShane
  "646445353356361728", // CurrvyRabbit
  "144607395459366912", // Gl0bl
  "120691356925427712", // CrazyMuppets
  "104680242672566272", // IronIcedteee
  "334409893685624833", // SilentDDeath
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check bingo routes
  if (pathname.startsWith("/bingo")) {
    const discordId = req.auth?.user?.id;
    if (!discordId || !ALLOWED_BINGO_DISCORD_IDS.includes(discordId)) {
      // Redirect to home or show unauthorized
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
