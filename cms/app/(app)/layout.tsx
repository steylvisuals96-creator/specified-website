import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import "../globals.css";

// Dezelfde letters als de website (specified-website/DESIGN.md).
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});
// Tekst en UI: IBM Plex Sans, zoals de website (2026-10-29).
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: "Specified CMS",
  description: "Beheer van de website van Specified.",
  // Interne omgeving: hoort niet in zoekresultaten.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${bebasNeue.variable} ${plexSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
