import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Temporary allowed users for bingo
const ALLOWED_BINGO_USERS = [
  "Tboodle",
  "Funzip",
  "SuperShane",
  "CurrvyRabbit",
  "Gl0bl",
  "CrazyMuppets",
  "IronIcedteee",
  "SilentDDeath",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check bingo routes
  if (pathname.startsWith("/bingo")) {
    const userName = req.auth?.user?.name;
    if (!userName || !ALLOWED_BINGO_USERS.includes(userName)) {
      // Redirect to home or show unauthorized
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
