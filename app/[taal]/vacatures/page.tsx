import { paginaMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { VacaturesWeergave } from "@/components/paginas/Weergaven";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { getVacatures, dagenOnline } from "@/lib/vacatures";
import { huidigeTaal } from "@/lib/taal-server";
import { lokaalPad, taalAlternates } from "@/lib/taal";

export const revalidate = 60;

const META = {
  nl: {
    title: "Vacatures voor engineers — Specified",
    description:
      "Ingenieur jobs in Vlaanderen: word engineering consultant bij Specified. Vacatures voor civil, electrical, automation en mechanical engineers en projectleiders.",
  },
  en: {
    title: "Engineering jobs — Specified",
    description:
      "Engineering jobs in Flanders: become an engineering consultant at Specified. Vacancies for civil, electrical, automation and mechanical engineers and project managers.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const taal = await huidigeTaal();
  return paginaMetadata(lokaalPad(taal, "/vacatures"), { ...META[taal], alternates: taalAlternates(taal, "/vacatures") });
}

export default async function VacaturesPage() {
  const taal = await huidigeTaal();
  const [vacatures, t, s] = await Promise.all([getVacatures(100, taal), getPagina("vacatures", taal), getSettings(taal)]);
  return (
    <VacaturesWeergave
      t={t}
      taal={taal}
      footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }}
      vacatures={vacatures.map((v) => ({
        slug: v.slug,
        titel: v.titel,
        vakgebied: v.vakgebied,
        locatie: v.locatie,
        uren: v.uren,
        ervaring: v.ervaring,
        ingevuld: v.ingevuld,
        dagen: dagenOnline(v),
      }))}
    />
  );
}
