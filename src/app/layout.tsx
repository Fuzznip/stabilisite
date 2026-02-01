import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import NavBar from "./_components/NavBar";
import { ThemeProvider } from "./_components/ThemeProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

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
        <FlickeringGrid
          className="fixed inset-0 -z-10 size-full [mask-image:radial-gradient(90%_90%_at_center,white,transparent)]"
          squareSize={4}
          gridGap={10}
          color="#A52D2A"
          maxOpacity={0.25}
          flickerChance={0.25}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NavBar />
          <div className="flex flex-col w-full px-8 lg:px-0 lg:max-w-10/12 min-w-96 mx-auto mt-8 sm:mt-12 gap-12 pb-20 md:pb-0">
            {children}
          </div>
          <Toaster richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
