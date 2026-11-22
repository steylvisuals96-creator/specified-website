import { paginaMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { VoorEngineersWeergave } from "@/components/paginas/Weergaven";
import { getPaginaMetAlgemeen } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { huidigeTaal } from "@/lib/taal-server";
import { lokaalPad, taalAlternates } from "@/lib/taal";

export const revalidate = 60;

const META = {
  nl: {
    title: "Werken als engineering consultant — Specified",
    description:
      "Word engineering consultant bij Specified. Ontdek projecten en sectoren in Vlaanderen, met een carrièrepartner die je keuzes begeleidt en je laat groeien.",
  },
  en: {
    title: "Working as an engineering consultant — Specified",
    description:
      "Become an engineering consultant at Specified. Discover projects and sectors in Flanders, with a career partner who guides your choices and helps you grow.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const taal = await huidigeTaal();
  return paginaMetadata(lokaalPad(taal, "/voor-engineers"), { ...META[taal], alternates: taalAlternates(taal, "/voor-engineers") });
}

// Teksten uit het beheer (Pagina's > Voor engineers), met de standaard uit lib/paginas.ts als terugval.
export default async function VoorEngineers() {
  const taal = await huidigeTaal();
  const [{ t, algemeen }, s] = await Promise.all([getPaginaMetAlgemeen("voor-engineers", taal), getSettings(taal)]);
  return <VoorEngineersWeergave t={t} a={algemeen} taal={taal} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
