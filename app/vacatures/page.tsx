import type { Metadata } from "next";
import Link from "next/link";
import Pagina from "@/components/Pagina";
import VacaturesClient from "@/components/VacaturesClient";
import { JOBS } from "@/lib/inhoud";
import { getVacatures, dagenOnline } from "@/lib/vacatures";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Vacatures voor engineers — Specified",
  description:
    "Ingenieur jobs in Vlaanderen: word engineering consultant bij Specified. Vacatures voor civil, electrical, automation en mechanical engineers en projectleiders.",
  alternates: { canonical: "/vacatures" },
};

export default async function VacaturesPage() {
  const vacatures = await getVacatures();
  const open = vacatures.filter((v) => !v.ingevuld).length;

  return (
    <Pagina
      titel={JOBS.titel}
      inleiding={
        open > 0
          ? `${open} open vacature${open === 1 ? "" : "s"} als engineering consultant bij Specified.`
          : "Er staan op dit moment geen open vacatures online."
      }
    >
      <section className="blok blok--lijst">
        <div className="wrap">
          <VacaturesClient
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
          <div className="pagina__slot pagina__slot--links">
            <h2 className="display display-m">Staat jouw job er niet tussen?</h2>
            <p className="lead">We zoeken ook buiten de openstaande vacatures.</p>
            <Link href="/open-sollicitatie" className="btn btn-secondary">
              Stuur een open sollicitatie
            </Link>
          </div>
        </div>
      </section>
    </Pagina>
  );
}
