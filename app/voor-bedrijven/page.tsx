import type { Metadata } from "next";
import Link from "next/link";
import Pagina, { Blok, Kenmerken, Lijst, Stappen } from "@/components/Pagina";
import Formulier from "@/components/Formulier";
import { CERTIFICATEN, CIJFERS, DIENSTENLIJST, PROFIELEN, SECTOREN } from "@/lib/inhoud";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Engineering consultancy voor bedrijven — Specified",
  description:
    "Tijdelijke versterking voor projecten, onderhoud en studies. Specified zet eigen engineering consultants in bij bedrijven in farma, productie, bouw en infrastructuur in Vlaanderen.",
  alternates: { canonical: "/voor-bedrijven" },
};

const STAPPEN = [
  { titel: "Je vraag", tekst: "Je vertelt welk project, welke installatie of welke studie versterking nodig heeft." },
  { titel: "Ons voorstel", tekst: "We stellen een consultant voor met de juiste specialisatie en ervaring." },
  { titel: "De start", tekst: "De consultant begint bij jou. Wij blijven bereikbaar en volgen de samenwerking op." },
];

export default function VoorBedrijven() {
  return (
    <Pagina
      titel="Jouw engineering partner"
      inleiding="Tijdelijke versterking nodig voor een project, onderhoud of een studie? Specified zet een eigen consultant in: de juiste persoon op de juiste plek, op het juiste moment. Lokaal talent voor lokale partners, met een transparante aanpak waarin communicatie centraal staat."
      acties={
        <>
          <a href="#aanvraag" className="btn btn-primary">
            Vraag een consultant aan
          </a>
          <Link href="/contact" className="btn btn-secondary">
            Neem contact op
          </Link>
        </>
      }
    >
      <Blok kop="Wat we doen">
        <Lijst items={DIENSTENLIJST} />
      </Blok>

      <Blok kop="Profielen">
        <p className="blok__tekst">Onze consultants zijn engineers met een eigen specialisatie. Deze profielen zetten we in.</p>
        <Kenmerken items={PROFIELEN} />
      </Blok>

      <Blok kop="Sectoren">
        <p className="blok__tekst">We werken voor bedrijven in Vlaanderen, in deze sectoren.</p>
        <Kenmerken items={SECTOREN} />
      </Blok>

      <Blok kop="Zo werkt het">
        <Stappen items={STAPPEN} />
      </Blok>

      <Blok kop="In cijfers">
        <dl className="cijfers">
          {CIJFERS.map((c) => (
            <div key={c.label}>
              <dd className="display">{c.waarde}</dd>
              <dt>{c.label}</dt>
            </div>
          ))}
        </dl>
        <p className="blok__tekst cijfers__cert">Onze consultants werken met deze attesten: {CERTIFICATEN.join(", ")}.</p>
      </Blok>

      <Blok kop="Vraag een consultant aan" id="aanvraag">
        <p className="blok__tekst">Vertel kort wat je zoekt. We nemen contact op om je vraag te bespreken.</p>
        <Formulier soort="aanvraag" />
      </Blok>
    </Pagina>
  );
}
