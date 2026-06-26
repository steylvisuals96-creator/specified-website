import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
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
    <html lang="nl" className={`${bebasNeue.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
