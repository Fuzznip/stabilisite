import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./_components/theme.provider";
import NavBar from "./_components/NavBar";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stability",
  description: "The webpage for all things Stability OSRS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative bg-background w-full h-full`}
      >
        <FlickeringGrid
          className="absolute inset-0 -z-10 size-full [mask-image:radial-gradient(1100px_circle_at_center,white,transparent)]"
          squareSize={4}
          gridGap={12}
          color="#A52D2A"
          maxOpacity={0.3}
          flickerChance={0.2}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NavBar />
          <main className="p-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
