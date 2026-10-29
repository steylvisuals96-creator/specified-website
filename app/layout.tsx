import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import VloeiendScrollen from "@/components/VloeiendScrollen";
import Vizier from "@/components/Vizier";
import { CONSENT_HEAD_SCRIPT } from "@/lib/consent";
import { SITE_URL } from "@/lib/site";
import AnalyticsGate from "@/components/AnalyticsGate";
import HashScroll from "@/components/HashScroll";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

// Tekst en UI: IBM Plex Sans (keuze Sam, 2026-10-29), technischer dan het
// eerdere Instrument Sans. Niet variabel, dus de gebruikte gewichten expliciet.
const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior is vereist sinds Next.js 16: het framework overschrijft
    // `scroll-behavior: smooth` niet langer zelf tijdens route-overgangen, waardoor
    // navigeren zonder dit attribuut traag naar boven glijdt in plaats van te springen.
    <html lang="nl" className={`${bebasNeue.variable} ${plexSans.variable} ${instrumentSerif.variable} h-full`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_HEAD_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#inhoud" className="skip-link">Naar de inhoud</a>
        <HashScroll />
        <VloeiendScrollen />
        <Vizier />
        {children}
        <CookieBanner />
        <AnalyticsGate />
      </body>
    </html>
  );
}
