import type { Metadata } from "next";
import { FaqWeergave } from "@/components/paginas/Weergaven";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Veelgestelde vragen — Specified",
  description: "Antwoorden op veelgestelde vragen over werken bij Specified en over het inzetten van engineering consultants.",
  alternates: { canonical: "/faq" },
};

// Vragen uit het beheer (Pagina's > Veelgestelde vragen); ook als FAQPage-gegevens voor Google.
export default async function Faq() {
  const [t, s] = await Promise.all([getPagina("faq"), getSettings()]);
  return <FaqWeergave t={t} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
