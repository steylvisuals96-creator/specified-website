import { paginaMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { VoorBedrijvenWeergave } from "@/components/paginas/Weergaven";
import { getPaginaMetAlgemeen } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { huidigeTaal } from "@/lib/taal-server";
import { lokaalPad, taalAlternates } from "@/lib/taal";

export const revalidate = 60;

const META = {
  nl: {
    title: "Engineering consultancy voor bedrijven | Specified",
    description:
      "Tijdelijke versterking voor projecten, onderhoud en studies. Specified zet eigen engineering consultants in bij bedrijven in farma, productie, bouw en infrastructuur in Vlaanderen.",
  },
  en: {
    title: "Engineering consultancy for companies | Specified",
    description:
      "Temporary reinforcement for projects, maintenance and studies. Specified deploys its own engineering consultants at companies in pharma, manufacturing, construction and infrastructure in Flanders.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const taal = await huidigeTaal();
  return paginaMetadata(lokaalPad(taal, "/voor-bedrijven"), { ...META[taal], alternates: taalAlternates(taal, "/voor-bedrijven") });
}

// Teksten uit het beheer (Pagina's > Voor bedrijven), met de standaard uit lib/paginas.ts als terugval.
export default async function VoorBedrijven() {
  const taal = await huidigeTaal();
  const [{ t, algemeen }, s] = await Promise.all([getPaginaMetAlgemeen("voor-bedrijven", taal), getSettings(taal)]);
  return <VoorBedrijvenWeergave t={t} a={algemeen} taal={taal} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
