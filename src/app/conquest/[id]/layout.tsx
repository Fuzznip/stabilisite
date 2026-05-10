import "leaflet/dist/leaflet.css";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

export default function ConquestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${cinzel.variable} pb-12`}>{children}</div>;
}
