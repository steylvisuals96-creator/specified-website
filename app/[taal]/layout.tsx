import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import VloeiendScrollen from "@/components/VloeiendScrollen";
import Vizier from "@/components/Vizier";
import { CONSENT_HEAD_SCRIPT } from "@/lib/consent";
import { actiefSeizoen } from "@/lib/seizoen-server";
import { THEMA_HEAD_SCRIPT } from "@/lib/thema";
import { SITE_URL } from "@/lib/site";
import AnalyticsGate from "@/components/AnalyticsGate";
import HashScroll from "@/components/HashScroll";
import { TaalProvider } from "@/components/TaalContext";
import { huidigeTaal } from "@/lib/taal-server";
import { TALEN } from "@/lib/taal";
import { ui } from "@/lib/teksten";

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

// Twee talen (app/[taal]): beide vooraf gebouwd, een ander voorvoegsel bestaat niet.
// proxy.ts zet de publieke adressen om (Nederlands zonder voorvoegsel, Engels onder /en).
export function generateStaticParams() {
  return TALEN.map((taal) => ({ taal }));
}
export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const en = (await huidigeTaal()) === "en";
  return {
    metadataBase: new URL(SITE_URL),
    title: "Specified — We Engineer Possibilities",
    description: en
      ? "Engineering consultancy from Kontich: our own consultants for projects, maintenance and studies in Flanders."
      : "Engineering consultancy uit Kontich: eigen consultants voor projecten, onderhoud en studies in Vlaanderen.",
    openGraph: {
      type: "website",
      locale: en ? "en_GB" : "nl_BE",
      alternateLocale: en ? "nl_BE" : "en_GB",
      siteName: "Specified",
      url: en ? "/en" : "/",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [seizoen, taal] = await Promise.all([actiefSeizoen(), huidigeTaal()]);
  return (
    // data-scroll-behavior is vereist sinds Next.js 16: het framework overschrijft
    // `scroll-behavior: smooth` niet langer zelf tijdens route-overgangen, waardoor
    // navigeren zonder dit attribuut traag naar boven glijdt in plaats van te springen.
    <html lang={taal} className={`${bebasNeue.variable} ${plexSans.variable} ${instrumentSerif.variable} h-full`} data-scroll-behavior="smooth" data-seizoen={seizoen === "standaard" ? undefined : seizoen} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_HEAD_SCRIPT + ";" + THEMA_HEAD_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TaalProvider taal={taal}>
        <a href="#inhoud" className="skip-link">{ui(taal).naarInhoud}</a>
        {/* Vroeg in de DOM: de banner staat visueel onderaan, maar wie met het
            toetsenbord werkt, komt hem meteen na de skip-link tegen. */}
        <CookieBanner />
        <HashScroll />
        <VloeiendScrollen />
        <Vizier />
        {children}
        <AnalyticsGate />
        </TaalProvider>
      </body>
    </html>
  );
}
