import type { Metadata } from "next";
import Link from "next/link";
import Pagina from "@/components/Pagina";
import { PROFIELEN, SECTOREN } from "@/lib/inhoud";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Veelgestelde vragen — Specified",
  description: "Antwoorden op veelgestelde vragen over werken bij Specified en over het inzetten van engineering consultants.",
  alternates: { canonical: "/faq" },
};

type Vraag = { vraag: string; antwoord: string; link?: { href: string; tekst: string } };

const opsomming = (l: string[]) => l.slice(0, -1).join(", ").toLowerCase() + " en " + l[l.length - 1].toLowerCase();

const GROEPEN: { kop: string; vragen: Vraag[] }[] = [
  {
    kop: "Over Specified",
    vragen: [
      {
        vraag: "Wat doet Specified?",
        antwoord:
          "Specified is een engineering consultancy uit Kontich. Onze consultants versterken tijdelijk de projecten, het onderhoud en de studies van bedrijven. We koppelen lokaal talent aan lokale partners.",
      },
      { vraag: "In welke sectoren werken jullie?", antwoord: `Onze klanten zijn actief in ${opsomming(SECTOREN)}.` },
      { vraag: "In welke regio zijn jullie actief?", antwoord: "In Vlaanderen. Ons kantoor ligt in Kontich, bij Antwerpen." },
    ],
  },
  {
    kop: "Voor engineers",
    vragen: [
      { vraag: "Welke profielen zoeken jullie?", antwoord: `We werken met deze profielen: ${opsomming(PROFIELEN)}. Zowel ervaren engineers als studenten en starters zijn welkom.` },
      {
        vraag: "Hoe verloopt een sollicitatie?",
        antwoord:
          "We bekijken eerst je cv. Daarna volgt een eerste gesprek via Teams en een tweede gesprek bij ons in Kontich, met Tom en Simon. Waar nodig passen we het traject aan.",
      },
      {
        vraag: "Mijn job staat er niet tussen. Kan ik toch solliciteren?",
        antwoord: "Ja. We zoeken ook buiten de openstaande vacatures.",
        link: { href: "/open-sollicitatie", tekst: "Stuur een open sollicitatie" },
      },
      { vraag: "Waarom staat er geen salaris bij de vacatures?", antwoord: "Een loonpakket hangt af van je ervaring en van het project. We bespreken het in een persoonlijk gesprek." },
      {
        vraag: "Wat gebeurt er met mijn gegevens?",
        antwoord: "We gebruiken je gegevens alleen om je sollicitatie te behandelen.",
        link: { href: "/privacy", tekst: "Lees de privacyverklaring" },
      },
    ],
  },
  {
    kop: "Voor bedrijven",
    vragen: [
      {
        vraag: "Hoe vraag ik een consultant aan?",
        antwoord: "Via het aanvraagformulier. Vertel kort wat je zoekt, dan nemen we contact op om je vraag te bespreken.",
        link: { href: "/voor-bedrijven#aanvraag", tekst: "Vraag een consultant aan" },
      },
      { vraag: "Waarvoor kan ik een consultant inzetten?", antwoord: "Voor tijdelijke versterking van een project, voor onderhoud, voor studies en voor het optimaliseren van bestaande processen." },
    ],
  },
];

export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROEPEN.flatMap((g) => g.vragen).map((v) => ({
      "@type": "Question",
      name: v.vraag,
      acceptedAnswer: { "@type": "Answer", text: v.antwoord },
    })),
  };

  return (
    <Pagina titel="Veelgestelde vragen" inleiding="Staat je vraag er niet bij? Neem gerust contact op.">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {GROEPEN.map((g) => (
        <section className="blok" key={g.kop}>
          <div className="wrap blok__grid">
            <h2 className="display display-m blok__kop">{g.kop}</h2>
            <div className="blok__inhoud faq">
              {g.vragen.map((v) => (
                <details key={v.vraag}>
                  <summary>{v.vraag}</summary>
                  <div className="faq__antwoord">
                    <p>{v.antwoord}</p>
                    {v.link && (
                      <Link href={v.link.href} className="text-link">
                        {v.link.tekst}
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="blok">
        <div className="wrap pagina__slot">
          <Link href="/contact" className="btn btn-primary">
            Neem contact op
          </Link>
        </div>
      </section>
    </Pagina>
  );
}
