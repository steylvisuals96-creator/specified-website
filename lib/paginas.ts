import { CERTIFICATEN, CIJFERS, CONTACT, BEDRIJF, DIENSTENLIJST, JOBS, PROFIELEN, SECTOREN, STAPPEN_ENGINEER, WAARDEN } from "./inhoud";
import { LEEST_UIT_SUPABASE, supabaseLees } from "./beheer";

/**
 * De bewerkbare teksten van de doorklikpagina's, op één plek.
 *
 * Elke pagina beschrijft haar velden met de huidige tekst als standaard. Het
 * beheer haalt deze beschrijving op (/api/pagina-schema) en bouwt er zelf het
 * formulier uit, zodat website en beheer nooit uit elkaar lopen. Opgeslagen
 * waarden staan in Supabase (pagina_inhoud, één rij per pagina); een leeg veld
 * betekent de standaardtekst.
 *
 * Elk veld heeft op de pagina een element met data-bewerk="<sleutel>", zodat
 * het voorbeeld in het beheer ernaartoe kan scrollen.
 */

export type SubVeld = { sleutel: string; label: string; max: number; soort?: "tekst" | "tekstvak" };
export type VeldDef =
  | { sleutel: string; label: string; soort: "tekst" | "tekstvak"; max: number; hint?: string; standaard: string }
  | { sleutel: string; label: string; soort: "lijst"; max: number; maxItems: number; hint?: string; standaard: string[] }
  | { sleutel: string; label: string; soort: "items"; velden: SubVeld[]; maxItems: number; hint?: string; standaard: Record<string, string>[] };
export type GroepDef = { titel: string; uitleg?: string; velden: VeldDef[] };
export type PaginaDef = {
  sleutel: string;
  titel: string;
  /** Waar de pagina op de website staat (null: gedeelde gegevens zonder eigen pagina). */
  pad: string | null;
  /** Welke pagina het voorbeeld toont (voor gedeelde gegevens een pagina die ze gebruikt). */
  voorbeeld: string;
  uitleg?: string;
  groepen: GroepDef[];
};

const tekst = (sleutel: string, label: string, standaard: string, max = 80, hint?: string): VeldDef => ({ sleutel, label, soort: "tekst", max, standaard, hint });
const tekstvak = (sleutel: string, label: string, standaard: string, max = 400, hint?: string): VeldDef => ({ sleutel, label, soort: "tekstvak", max, standaard, hint });
const lijst = (sleutel: string, label: string, standaard: string[], max = 60, maxItems = 16, hint?: string): VeldDef => ({ sleutel, label, soort: "lijst", max, maxItems, standaard, hint });
const TITEL_TEKST: SubVeld[] = [
  { sleutel: "titel", label: "Titel", max: 60 },
  { sleutel: "tekst", label: "Tekst", max: 300, soort: "tekstvak" },
];
const items = (sleutel: string, label: string, standaard: Record<string, string>[], velden: SubVeld[] = TITEL_TEKST, maxItems = 12, hint?: string): VeldDef => ({
  sleutel,
  label,
  soort: "items",
  velden,
  maxItems,
  standaard,
  hint,
});

const opsomming = (l: string[]) => l.slice(0, -1).join(", ").toLowerCase() + " en " + l[l.length - 1].toLowerCase();
const VRAAG: SubVeld[] = [
  { sleutel: "vraag", label: "Vraag", max: 140 },
  { sleutel: "antwoord", label: "Antwoord", max: 600, soort: "tekstvak" },
  { sleutel: "linkTekst", label: "Linktekst (optioneel)", max: 60 },
  { sleutel: "linkAdres", label: "Link naar (bv. /contact)", max: 120 },
];

export const PAGINAS: PaginaDef[] = [
  {
    sleutel: "algemeen",
    titel: "Gedeelde lijsten",
    pad: null,
    voorbeeld: "voor-bedrijven",
    uitleg: "Profielen, sectoren, attesten en cijfers staan op meerdere pagina's (Voor bedrijven, Voor engineers, FAQ). Hier pas je ze één keer aan.",
    groepen: [
      {
        titel: "Lijsten",
        velden: [
          lijst("profielen", "Profielen", PROFIELEN),
          lijst("sectoren", "Sectoren", SECTOREN),
          lijst("certificaten", "Attesten", CERTIFICATEN, 30),
          tekst("attestenZin", "Zin voor de attesten", "Onze consultants werken met deze attesten:", 100, "De attesten volgen achter deze zin, gescheiden door komma's."),
        ],
      },
      {
        titel: "In cijfers",
        velden: [
          items(
            "cijfers",
            "Cijfers",
            CIJFERS,
            [
              { sleutel: "waarde", label: "Getal", max: 10 },
              { sleutel: "label", label: "Omschrijving", max: 40 },
            ],
            6,
            "Alleen cijfers die Specified zelf opgaf.",
          ),
        ],
      },
    ],
  },
  {
    sleutel: "voor-bedrijven",
    titel: "Voor bedrijven",
    pad: "/voor-bedrijven",
    voorbeeld: "voor-bedrijven",
    groepen: [
      {
        titel: "Kop",
        velden: [
          tekst("titel", "Titel", "Jouw engineering partner", 50, "Het laatste woord komt in de accentletter."),
          tekstvak(
            "inleiding",
            "Inleiding",
            "Tijdelijke versterking nodig voor een project, onderhoud of een studie? Specified zet een eigen consultant in: de juiste persoon op de juiste plek, op het juiste moment. Lokaal talent voor lokale partners, met een transparante aanpak waarin communicatie centraal staat.",
            500,
          ),
          tekst("knopAanvraag", "Knop naar het aanvraagformulier", "Vraag een consultant aan", 40),
          tekst("knopContact", "Knop naar contact", "Neem contact op", 40),
        ],
      },
      { titel: "Wat we doen", velden: [tekst("dienstenKop", "Kop", "Wat we doen", 40), items("diensten", "Diensten", DIENSTENLIJST)] },
      {
        titel: "Profielen",
        uitleg: "De profielen zelf staan bij Gedeelde lijsten.",
        velden: [tekst("profielenKop", "Kop", "Profielen", 40), tekstvak("profielenTekst", "Tekst", "Onze consultants zijn engineers met een eigen specialisatie. Deze profielen zetten we in.", 300)],
      },
      {
        titel: "Sectoren",
        uitleg: "De sectoren zelf staan bij Gedeelde lijsten.",
        velden: [tekst("sectorenKop", "Kop", "Sectoren", 40), tekstvak("sectorenTekst", "Tekst", "We werken voor bedrijven in Vlaanderen, in deze sectoren.", 300)],
      },
      {
        titel: "Zo werkt het",
        velden: [
          tekst("stappenKop", "Kop", "Zo werkt het", 40),
          items("stappen", "Stappen", [
            { titel: "Je vraag", tekst: "Je vertelt welk project, welke installatie of welke studie versterking nodig heeft." },
            { titel: "Ons voorstel", tekst: "We stellen een consultant voor met de juiste specialisatie en ervaring." },
            { titel: "De start", tekst: "De consultant begint bij jou. Wij blijven bereikbaar en volgen de samenwerking op." },
          ]),
        ],
      },
      { titel: "In cijfers", uitleg: "De cijfers en attesten staan bij Gedeelde lijsten.", velden: [tekst("cijfersKop", "Kop", "In cijfers", 40)] },
      {
        titel: "Aanvraag",
        velden: [tekst("aanvraagKop", "Kop", "Vraag een consultant aan", 50), tekstvak("aanvraagTekst", "Tekst boven het formulier", "Vertel kort wat je zoekt. We nemen contact op om je vraag te bespreken.", 300)],
      },
    ],
  },
  {
    sleutel: "voor-engineers",
    titel: "Voor engineers",
    pad: "/voor-engineers",
    voorbeeld: "voor-engineers",
    groepen: [
      {
        titel: "Kop",
        velden: [
          tekst("titel", "Titel", "Jouw career partner", 50, "Het laatste woord komt in de accentletter."),
          tekstvak(
            "inleiding",
            "Inleiding",
            "Als consultant bij Specified ontdek je verschillende projecten en sectoren zonder je hele carrière op één pad vast te leggen. We begeleiden je keuzes, blijven in gesprek over wat je wil en laten je groeien tot expert of veelzijdige generalist.",
            500,
          ),
          tekst("knopVacatures", "Knop naar de vacatures", "Bekijk de vacatures", 40),
          tekst("knopOpen", "Knop naar open sollicitatie", "Stuur een open sollicitatie", 40),
        ],
      },
      { titel: "Waar we voor staan", velden: [tekst("waardenKop", "Kop", "Waar we voor staan", 40), items("waarden", "Waarden", WAARDEN)] },
      {
        titel: "Wie we zoeken",
        uitleg: "De profielen zelf staan bij Gedeelde lijsten.",
        velden: [tekst("zoekenKop", "Kop", "Wie we zoeken", 40), tekstvak("zoekenTekst", "Tekst", "Ervaren engineers, maar ook studenten en starters die hun eerste stappen willen zetten.", 300)],
      },
      {
        titel: "Waar je werkt",
        uitleg: "Sectoren en attesten staan bij Gedeelde lijsten.",
        velden: [tekst("werkKop", "Kop", "Waar je werkt", 40), tekstvak("werkTekst", "Tekst", "Bij onze partners in Vlaanderen, in deze sectoren.", 300)],
      },
      {
        titel: "Zo verloopt het",
        velden: [
          tekst("stappenKop", "Kop", "Zo verloopt het", 40),
          items("stappen", "Stappen", STAPPEN_ENGINEER),
          tekstvak("stappenNa", "Tekst onder de stappen", "Geen twee engineers zijn gelijk, dus we passen het traject aan waar dat nodig is.", 300),
        ],
      },
      {
        titel: "Afsluiter",
        velden: [
          tekst("slotKop", "Kop", "Staat jouw job er niet tussen?", 60),
          tekstvak("slotTekst", "Tekst", "We zoeken ook buiten de openstaande vacatures. Stuur ons je cv en vertel wat je zoekt.", 300),
          tekst("slotKnop", "Knop", "Stuur een open sollicitatie", 40),
        ],
      },
    ],
  },
  {
    sleutel: "vacatures",
    titel: "Vacatures",
    pad: "/vacatures",
    voorbeeld: "vacatures",
    uitleg: "De vacatures zelf beheer je bij Vacatures. Het aantal open vacatures in de inleiding telt de website zelf.",
    groepen: [
      {
        titel: "Kop",
        velden: [
          tekst("titel", "Titel", JOBS.titel, 40),
          tekst("inleidingLeeg", "Inleiding als er geen open vacatures zijn", "Er staan op dit moment geen open vacatures online.", 160),
        ],
      },
      {
        titel: "Afsluiter onder de lijst",
        velden: [
          tekst("slotKop", "Kop", "Staat jouw job er niet tussen?", 60),
          tekstvak("slotTekst", "Tekst", "We zoeken ook buiten de openstaande vacatures.", 300),
          tekst("slotKnop", "Knop", "Stuur een open sollicitatie", 40),
        ],
      },
    ],
  },
  {
    sleutel: "contact",
    titel: "Contact",
    pad: "/contact",
    voorbeeld: "contact",
    uitleg: "E-mail, telefoon en LinkedIn pas je aan bij Homepage, onder Contact en footer: die staan op elke pagina.",
    groepen: [
      {
        titel: "Kop",
        velden: [
          tekst("titel", "Titel", "Laten we kennismaken", 50),
          tekstvak("inleiding", "Inleiding", "Een vraag over een project, een samenwerking of een job? Stuur een bericht, mail of bel ons.", 300),
        ],
      },
      {
        titel: "Adres",
        velden: [
          tekst("bedrijfsnaam", "Bedrijfsnaam", BEDRIJF.naam, 60),
          tekst("straat", "Straat en nummer", CONTACT.straat, 60),
          tekst("postcode", "Postcode en gemeente", CONTACT.postcode, 60),
          tekst("ondernemingsnummer", "Ondernemingsnummer", BEDRIJF.ondernemingsnummer, 30),
        ],
      },
    ],
  },
  {
    sleutel: "faq",
    titel: "Veelgestelde vragen",
    pad: "/faq",
    voorbeeld: "faq",
    uitleg: "Ook Google toont deze vragen in de zoekresultaten. Een link moet met / (een pagina van de site) of https:// beginnen.",
    groepen: [
      { titel: "Kop", velden: [tekst("titel", "Titel", "Veelgestelde vragen", 50), tekstvak("inleiding", "Inleiding", "Staat je vraag er niet bij? Neem gerust contact op.", 300)] },
      {
        titel: "Eerste groep",
        velden: [
          tekst("groep1Kop", "Kop", "Over Specified", 40),
          items(
            "groep1",
            "Vragen",
            [
              {
                vraag: "Wat doet Specified?",
                antwoord:
                  "Specified is een engineering consultancy uit Kontich. Onze consultants versterken tijdelijk de projecten, het onderhoud en de studies van bedrijven. We koppelen lokaal talent aan lokale partners.",
              },
              { vraag: "In welke sectoren werken jullie?", antwoord: `Onze klanten zijn actief in ${opsomming(SECTOREN)}.` },
              { vraag: "In welke regio zijn jullie actief?", antwoord: "In Vlaanderen. Ons kantoor ligt in Kontich, bij Antwerpen." },
            ],
            VRAAG,
            12,
          ),
        ],
      },
      {
        titel: "Tweede groep",
        velden: [
          tekst("groep2Kop", "Kop", "Voor engineers", 40),
          items(
            "groep2",
            "Vragen",
            [
              { vraag: "Welke profielen zoeken jullie?", antwoord: `We werken met deze profielen: ${opsomming(PROFIELEN)}. Zowel ervaren engineers als studenten en starters zijn welkom.` },
              {
                vraag: "Hoe verloopt een sollicitatie?",
                antwoord:
                  "We bekijken eerst je cv. Daarna volgt een eerste gesprek via Teams en een tweede gesprek bij ons in Kontich, met Tom en Simon. Waar nodig passen we het traject aan.",
              },
              {
                vraag: "Mijn job staat er niet tussen. Kan ik toch solliciteren?",
                antwoord: "Ja. We zoeken ook buiten de openstaande vacatures.",
                linkTekst: "Stuur een open sollicitatie",
                linkAdres: "/open-sollicitatie",
              },
              { vraag: "Waarom staat er geen salaris bij de vacatures?", antwoord: "Een loonpakket hangt af van je ervaring en van het project. We bespreken het in een persoonlijk gesprek." },
              {
                vraag: "Wat gebeurt er met mijn gegevens?",
                antwoord: "We gebruiken je gegevens alleen om je sollicitatie te behandelen.",
                linkTekst: "Lees de privacyverklaring",
                linkAdres: "/privacy",
              },
            ],
            VRAAG,
            12,
          ),
        ],
      },
      {
        titel: "Derde groep",
        velden: [
          tekst("groep3Kop", "Kop", "Voor bedrijven", 40),
          items(
            "groep3",
            "Vragen",
            [
              {
                vraag: "Hoe vraag ik een consultant aan?",
                antwoord: "Via het aanvraagformulier. Vertel kort wat je zoekt, dan nemen we contact op om je vraag te bespreken.",
                linkTekst: "Vraag een consultant aan",
                linkAdres: "/voor-bedrijven#aanvraag",
              },
              { vraag: "Waarvoor kan ik een consultant inzetten?", antwoord: "Voor tijdelijke versterking van een project, voor onderhoud, voor studies en voor het optimaliseren van bestaande processen." },
            ],
            VRAAG,
            12,
          ),
        ],
      },
      { titel: "Afsluiter", velden: [tekst("slotKnop", "Knop naar contact", "Neem contact op", 40)] },
    ],
  },
  {
    sleutel: "open-sollicitatie",
    titel: "Open sollicitatie",
    pad: "/open-sollicitatie",
    voorbeeld: "open-sollicitatie",
    groepen: [
      {
        titel: "Kop",
        velden: [
          tekst("titel", "Titel", "Open sollicitatie", 50),
          tekstvak(
            "inleiding",
            "Inleiding",
            "Staat jouw job er niet tussen? We zoeken ook buiten de openstaande vacatures. Stuur ons je cv en vertel wat je zoekt, dan bekijken we samen wat past.",
            400,
          ),
        ],
      },
    ],
  },
  {
    sleutel: "blog",
    titel: "Blog (overzicht)",
    pad: "/blog",
    voorbeeld: "blog",
    uitleg: "De kop van het blogoverzicht. De artikels zelf beheer je bij Blog.",
    groepen: [{ titel: "Kop", velden: [tekst("titel", "Titel", "Blog", 40), tekstvak("inleiding", "Inleiding", "Inzichten, tips en verhalen over engineering, consultancy en carrière.", 300)] }],
  },
];

export const paginaDef = (sleutel: string) => PAGINAS.find((p) => p.sleutel === sleutel);

/**
 * De samengevoegde teksten van een pagina. Welke sleutel een tekst, een lijst of
 * rijen bevat, staat in de beschrijving hierboven; de weergaven lezen ze zo.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- de vorm per sleutel staat in PAGINAS
export type PaginaTeksten = Record<string, any>;

const gevuld = (v: unknown) => typeof v === "string" && v.trim() !== "";

/** Legt opgeslagen waarden over de standaard. Leeg of ongeldig valt terug op de standaardtekst. */
export function samenvoegenPagina(def: PaginaDef, opgeslagen: unknown): PaginaTeksten {
  const o = opgeslagen && typeof opgeslagen === "object" ? (opgeslagen as Record<string, unknown>) : {};
  const uit: PaginaTeksten = {};
  for (const v of def.groepen.flatMap((g) => g.velden)) {
    const w = o[v.sleutel];
    if (v.soort === "tekst" || v.soort === "tekstvak") {
      uit[v.sleutel] = gevuld(w) ? String(w).trim() : v.standaard;
    } else if (v.soort === "lijst") {
      const l = Array.isArray(w) ? w.filter(gevuld).map((x) => String(x).trim()) : [];
      uit[v.sleutel] = l.length ? l : v.standaard;
    } else if (v.soort === "items") {
      const eerste = v.velden[0].sleutel;
      const l = Array.isArray(w)
        ? w
            .filter((r) => r && typeof r === "object" && gevuld((r as Record<string, unknown>)[eerste]))
            .map((r) => Object.fromEntries(v.velden.map((s) => [s.sleutel, gevuld((r as Record<string, unknown>)[s.sleutel]) ? String((r as Record<string, unknown>)[s.sleutel]).trim() : ""])))
        : [];
      uit[v.sleutel] = l.length ? l : v.standaard;
    }
  }
  return uit;
}

/** Alleen links naar een pagina van de site of een https-adres. */
export const veiligeLinkAdres = (v?: string) => (v && /^(\/(?!\/)|https:\/\/)/.test(v) ? v : undefined);

/** De teksten van een pagina: uit het beheer (Supabase) met de standaard als terugval. */
export async function getPagina(sleutel: string): Promise<PaginaTeksten> {
  const def = paginaDef(sleutel);
  if (!def) throw new Error(`Onbekende pagina ${sleutel}`);
  if (!LEEST_UIT_SUPABASE) return samenvoegenPagina(def, {});
  try {
    const [rij] = await supabaseLees<{ waarde: unknown }>(`pagina_inhoud?select=waarde&sleutel=eq.${encodeURIComponent(sleutel)}`);
    return samenvoegenPagina(def, rij?.waarde);
  } catch {
    return samenvoegenPagina(def, {});
  }
}

/** Gedeelde lijsten en de teksten van één pagina, samen. */
export async function getPaginaMetAlgemeen(sleutel: string) {
  const [t, algemeen] = await Promise.all([getPagina(sleutel), getPagina("algemeen")]);
  return { t, algemeen };
}
