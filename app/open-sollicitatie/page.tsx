import type { Metadata } from "next";
import { OpenSollicitatieWeergave } from "@/components/paginas/Weergaven";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Open sollicitatie — Specified",
  description: "Geen passende vacature gevonden? Stuur Specified je cv en vertel wat je zoekt als engineer.",
  alternates: { canonical: "/open-sollicitatie" },
};

export default async function OpenSollicitatie() {
  const [t, s] = await Promise.all([getPagina("open-sollicitatie"), getSettings()]);
  return <OpenSollicitatieWeergave t={t} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
