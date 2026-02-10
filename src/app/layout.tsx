import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import NavBar from "./_components/NavBar";
import { ThemeProvider } from "./_components/ThemeProvider";
import { ThemedBackground } from "./_components/ThemedBackground";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"], // adjust weights as needed
  display: "swap",
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
    <html lang="en" className="w-full h-full" suppressHydrationWarning>
      <body
        className={`${lato.className} antialiased relative bg-background w-full h-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemedBackground />
          <NavBar />
          <div className="flex flex-col w-full px-2 lg:px-0 lg:max-w-10/12 min-w-96 mx-auto mt-4 gap-12 pb-20 md:pb-0">
            {children}
          </div>
          <Toaster richColors />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
