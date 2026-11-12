import type { Metadata } from "next";
import Link from "next/link";
import Pagina, { Blok, Kenmerken, Lijst, Stappen } from "@/components/Pagina";
import { CERTIFICATEN, PROFIELEN, SECTOREN, STAPPEN_ENGINEER, WAARDEN } from "@/lib/inhoud";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Werken als engineering consultant — Specified",
  description:
    "Word engineering consultant bij Specified. Ontdek projecten en sectoren in Vlaanderen, met een carrièrepartner die je keuzes begeleidt en je laat groeien.",
  alternates: { canonical: "/voor-engineers" },
};

export default function VoorEngineers() {
  return (
    <Pagina
      titel="Jouw career partner"
      inleiding="Als consultant bij Specified ontdek je verschillende projecten en sectoren zonder je hele carrière op één pad vast te leggen. We begeleiden je keuzes, blijven in gesprek over wat je wil en laten je groeien tot expert of veelzijdige generalist."
      acties={
        <>
          <Link href="/vacatures" className="btn btn-primary">
            Bekijk de vacatures
          </Link>
          <Link href="/open-sollicitatie" className="btn btn-secondary">
            Stuur een open sollicitatie
          </Link>
        </>
      }
    >
      <Blok kop="Waar we voor staan">
        <Lijst items={WAARDEN} />
      </Blok>

      <Blok kop="Wie we zoeken">
        <p className="blok__tekst">Ervaren engineers, maar ook studenten en starters die hun eerste stappen willen zetten.</p>
        <Kenmerken items={PROFIELEN} />
      </Blok>

      <Blok kop="Waar je werkt">
        <p className="blok__tekst">
          Bij onze partners in Vlaanderen, in deze sectoren. Onze consultants werken met attesten zoals {CERTIFICATEN.join(", ")}.
        </p>
        <Kenmerken items={SECTOREN} />
      </Blok>

      <Blok kop="Zo verloopt het">
        <Stappen items={STAPPEN_ENGINEER} />
        <p className="blok__tekst blok__na">Geen twee engineers zijn gelijk, dus we passen het traject aan waar dat nodig is.</p>
      </Blok>

      <section className="blok">
        <div className="wrap pagina__slot">
          <h2 className="display display-m">Staat jouw job er niet tussen?</h2>
          <p className="lead">We zoeken ook buiten de openstaande vacatures. Stuur ons je cv en vertel wat je zoekt.</p>
          <Link href="/open-sollicitatie" className="btn btn-primary">
            Stuur een open sollicitatie
          </Link>
        </div>
      </section>
    </Pagina>
  );
}
