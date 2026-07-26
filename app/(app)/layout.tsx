import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "../globals.css";

// Dezelfde display-letter als de website. Stond al in DashboardShell, maar
// werd hier nooit geladen — de koppen vielen daardoor stil terug op Avenir.
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Specified CMS",
  description: "Interne recruitmentomgeving van Specified.",
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
      className={`${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
