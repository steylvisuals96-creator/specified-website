import type { Metadata } from "next";
import { VoorEngineersWeergave } from "@/components/paginas/Weergaven";
import { getPaginaMetAlgemeen } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Werken als engineering consultant — Specified",
  description:
    "Word engineering consultant bij Specified. Ontdek projecten en sectoren in Vlaanderen, met een carrièrepartner die je keuzes begeleidt en je laat groeien.",
  alternates: { canonical: "/voor-engineers" },
};

// Teksten uit het beheer (Pagina's > Voor engineers), met de standaard uit lib/paginas.ts als terugval.
export default async function VoorEngineers() {
  const [{ t, algemeen }, s] = await Promise.all([getPaginaMetAlgemeen("voor-engineers"), getSettings()]);
  return <VoorEngineersWeergave t={t} a={algemeen} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
