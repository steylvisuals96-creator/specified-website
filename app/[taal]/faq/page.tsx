import { paginaMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { FaqWeergave } from "@/components/paginas/Weergaven";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { huidigeTaal } from "@/lib/taal-server";
import { lokaalPad, taalAlternates } from "@/lib/taal";

export const revalidate = 60;

const META = {
  nl: {
    title: "Veelgestelde vragen | Specified",
    description: "Antwoorden op veelgestelde vragen over werken bij Specified en over het inzetten van engineering consultants.",
  },
  en: {
    title: "Frequently asked questions | Specified",
    description: "Answers to frequently asked questions about working at Specified and about deploying engineering consultants.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const taal = await huidigeTaal();
  return paginaMetadata(lokaalPad(taal, "/faq"), { ...META[taal], alternates: taalAlternates(taal, "/faq") });
}

// Vragen uit het beheer (Pagina's > Veelgestelde vragen); ook als FAQPage-gegevens voor Google.
export default async function Faq() {
  const taal = await huidigeTaal();
  const [t, s] = await Promise.all([getPagina("faq", taal), getSettings(taal)]);
  return <FaqWeergave t={t} taal={taal} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
