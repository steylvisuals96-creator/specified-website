import { paginaMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { VacaturesWeergave } from "@/components/paginas/Weergaven";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { getVacatures, dagenOnline } from "@/lib/vacatures";

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return paginaMetadata("/vacatures", {
    title: "Vacatures voor engineers — Specified",
    description:
      "Ingenieur jobs in Vlaanderen: word engineering consultant bij Specified. Vacatures voor civil, electrical, automation en mechanical engineers en projectleiders.",
    alternates: { canonical: "/vacatures" },
  });
}

export default async function VacaturesPage() {
  const [vacatures, t, s] = await Promise.all([getVacatures(), getPagina("vacatures"), getSettings()]);
  return (
    <VacaturesWeergave
      t={t}
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
