import type { Metadata } from "next";
import { Bebas_Neue, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import CursorGlow from "@/components/CursorGlow";
import AnalyticsGate from "@/components/AnalyticsGate";
import HashScroll from "@/components/HashScroll";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

// Tekst en UI. Vervangt Avenir, dat nooit als webfont geladen werd en op
// Windows terugviel op Century Gothic.
const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Alleen voor woorden over mensen (zie DESIGN.md), dus enkel de cursief.
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: "Specified — We Engineer Possibilities",
  description: "Engineering recruitment en talent development voor de meest ambitieuze bedrijven en kandidaten in België.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior is vereist sinds Next.js 16: het framework overschrijft
    // `scroll-behavior: smooth` niet langer zelf tijdens route-overgangen, waardoor
    // navigeren zonder dit attribuut traag naar boven glijdt in plaats van te springen.
    <html lang="nl" className={`${bebasNeue.variable} ${instrumentSans.variable} ${instrumentSerif.variable} h-full`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <CursorGlow />
        <HashScroll />
        {children}
        <CookieBanner />
        <AnalyticsGate />
      </body>
    </html>
  );
}
