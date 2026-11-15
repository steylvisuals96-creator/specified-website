import type { Metadata, Viewport } from "next";
import { Bebas_Neue, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-serif" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: { default: "Beheer | Specified", template: "%s | Specified beheer" },
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Specified", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#141416",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl-BE" className={`${bebas.variable} ${serif.variable} ${plex.variable}`}>
      <body>{children}</body>
    </html>
  );
}
