import { paginaMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { VoorBedrijvenWeergave } from "@/components/paginas/Weergaven";
import { getPaginaMetAlgemeen } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return paginaMetadata("/voor-bedrijven", {
    title: "Engineering consultancy voor bedrijven — Specified",
    description:
      "Tijdelijke versterking voor projecten, onderhoud en studies. Specified zet eigen engineering consultants in bij bedrijven in farma, productie, bouw en infrastructuur in Vlaanderen.",
    alternates: { canonical: "/voor-bedrijven" },
  });
}

// Teksten uit het beheer (Pagina's > Voor bedrijven), met de standaard uit lib/paginas.ts als terugval.
export default async function VoorBedrijven() {
  const [{ t, algemeen }, s] = await Promise.all([getPaginaMetAlgemeen("voor-bedrijven"), getSettings()]);
  return <VoorBedrijvenWeergave t={t} a={algemeen} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
