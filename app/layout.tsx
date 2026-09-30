import type { Metadata } from "next";
import { Bebas_Neue, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import VloeiendScrollen from "@/components/VloeiendScrollen";
import Vizier from "@/components/Vizier";
import { CONSENT_HEAD_SCRIPT } from "@/lib/consent";
import { SITE_URL } from "@/lib/site";
import AnalyticsGate from "@/components/AnalyticsGate";
import HashScroll from "@/components/HashScroll";
import TeksProvider from "@/components/admin/TeksProvider";
import { haalTeksten } from "@/lib/tekstenServer";

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
  // Alleen een accent (handtekening-woorden); niet laten concurreren met het
  // hoofdbeeld bij het laden. Met display swap verschijnt het even later.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Specified — We Engineer Possibilities",
  description: "Engineering recruitment en talent development voor de meest ambitieuze bedrijven en kandidaten in België.",
  openGraph: {
    type: "website",
    locale: "nl_BE",
    siteName: "Specified",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Aanpassingen uit het CRM (leeg als er geen zijn of het CRM niet bereikbaar is).
  const teksten = await haalTeksten();

  return (
    // data-scroll-behavior is vereist sinds Next.js 16: het framework overschrijft
    // `scroll-behavior: smooth` niet langer zelf tijdens route-overgangen, waardoor
    // navigeren zonder dit attribuut traag naar boven glijdt in plaats van te springen.
    <html lang="nl" className={`${bebasNeue.variable} ${instrumentSans.variable} ${instrumentSerif.variable} h-full`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_HEAD_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <HashScroll />
        <VloeiendScrollen />
        <Vizier />
        <TeksProvider waarden={teksten}>{children}</TeksProvider>
        <CookieBanner />
        <AnalyticsGate />
      </body>
    </html>
  );
}
