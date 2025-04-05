import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import NavBar from "./_components/NavBar";
import { ThemeProvider } from "./_components/ThemeProvider";
import { Toaster } from "sonner";

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
    <html lang="en" className="w-full h-full">
      <body
        className={`${lato.className} antialiased relative bg-background w-full h-full`}
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
          <div className="flex flex-col w-full px-8 lg:px-0 lg:w-4/5 xl:w-2/3 min-w-96 mx-auto mt-12 gap-12">
            {children}
          </div>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
