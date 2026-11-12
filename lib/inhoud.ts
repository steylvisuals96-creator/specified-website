/**
 * Teksten van de homepage, gebaseerd op de huidige site van Specified
 * (specified.be: home, About us, Services, Career partner, Engineering partner,
 * Jobs), vertaald naar het Nederlands.
 *
 * Positionering: Specified is een engineering consultancy firm met eigen
 * consultants die ze bij klanten inzetten, geen klassiek recruitmentbureau.
 *
 * Staat bewust in de code en niet in de CMS: de CMS bevat nog voorbeeldteksten
 * uit de recruitment-richting. Na akkoord van Specified kunnen deze velden naar
 * de CMS verhuizen.
 */

/** De technische tekening: SPECIFIED als acrostichon, elk label begint met zijn letter. */
export const TEKENING_CALLOUTS: [string, string][] = [
  ["Studies", "tijdelijke ondersteuning"], // About us: "support for projects, maintenance, and studies"
  ["Projecten", "en onderhoud"],
  ["Elektromechanica", "onze specialisatie"], // About us: "electromechanical engineering solutions for the industry"
  ["Consultants", "eigen engineers, bij jou ingezet"],
  ["Industrie", "onze partners"],
  ["Focus", "energie, fun en passie"], // About us: "focus, energy, fun, and passion"
  ["Integratie", "systemen en processen"], // About us: "system integration, or the optimization of existing processes"
  ["Extra mile", "we run the extra mile"], // Engineering partner
  ["Drive", "en verantwoordelijkheid"], // About us: "drive and responsibility as the core values"
];

export const TEKENING = {
  intro: "Engineering consultancy uit Kontich: onze eigen consultants versterken jouw projecten.",
  scrollHint: "Scroll om de specificatie te openen.",
  titelblok: {
    project: "We are here to stay", // home
    locatie: "Kontich, Antwerpen",
    waarden: "Drive en verantwoordelijkheid",
    akkoord: "Goedgekeurd door Specified",
  },
};

export const HERO = {
  prefix: "We",
  woord: "engineer",
  suffix: "possibilities.", // Career partner: "We engineer possibilities"
  ctaBedrijven: "Zet onze consultants in",
  ctaEngineers: "Word consultant",
};

/** De vijf profielen uit "Discover our jobs" op specified.be. */
export const CONSULTANTS = {
  titel: "Onze",
  accent: "consultants.",
  tekst: "Eigen engineers, in dienst van Specified, tijdelijk ingezet bij jouw projecten, onderhoud en studies.",
  profielen: ["Civil Engineer", "Electrical Engineer", "Automation Engineer", "Mechanical Engineer", "Engineering Consultant", "Projectleider"],
};

export const DIENSTEN = [
  {
    id: "bedrijven",
    kop: "Voor bedrijven",
    titel: "We design & support projects", // Engineering partner
    tekst:
      "Tijdelijke versterking nodig voor een project, onderhoud of een studie? Wij zetten een eigen consultant in: de juiste persoon op de juiste plek, op het juiste moment. Van projectontwikkeling en systeemintegratie tot het optimaliseren van bestaande processen.",
    cta: "Zet onze consultants in",
    href: "/voor-bedrijven",
    knop: "btn-primary",
    beeld: "/images/beeld/bedrijven-installatie.jpg",
  },
  {
    id: "engineers",
    kop: "Voor engineers",
    titel: "We engineer possibilities", // Career partner
    tekst:
      "Als consultant bij Specified ontdek je verschillende projecten en sectoren zonder je hele carrière op één pad vast te leggen. We begeleiden je keuzes, blijven in gesprek over wat je wil en laten je groeien tot expert of veelzijdige generalist.",
    cta: "Word consultant",
    href: "/voor-engineers",
    knop: "btn-secondary",
    beeld: "/images/beeld/kandidaten-engineer.jpg",
  },
];

export const JOBS = {
  titel: "Word consultant.", // Jobs: "Help build the future as an Engineering Consultant at Specified!"
  linkTekst: "Alle vacatures",
};

export const META = {
  titel: "Specified — Engineering consultancy",
  beschrijving:
    "Belgische engineering consultancy, gespecialiseerd in elektromechanica voor de industrie. Onze eigen consultants ondersteunen projecten, onderhoud en studies.",
};

/** Contactgegevens zoals op specified.be (home, footer). */
export const CONTACT = {
  email: "info@specified.be",
  telefoon: "+32 472 69 94 62",
  telefoonLink: "+32472699462",
  plaats: "Kontich, Antwerpen",
  straat: "Veldkant 31a",
  postcode: "2550 Kontich",
  linkedin: "https://www.linkedin.com/company/specified-be",
};

/**
 * Uit de invullijst van Specified (2026-11-12, zie BRIEFING.md). Voorlopige
 * teksten: de definitieve komen van Specified (klaar op 2026-12-21).
 */
export const BEDRIJF = {
  naam: "Specified NV",
  ondernemingsnummer: "BE 0727.537.711",
};

export const DIENSTENLIJST: { titel: string; tekst: string }[] = [
  { titel: "Tijdelijke versterking", tekst: "Een extra engineer voor de duur van je project, op het moment dat je team hem nodig heeft." },
  { titel: "Onderhoud", tekst: "Ondersteuning bij gepland en ongepland onderhoud van installaties." },
  { titel: "Studies", tekst: "Voorstudies, ontwerp en berekeningen, uitgewerkt door een consultant met de juiste specialisatie." },
  { titel: "Procesoptimalisatie", tekst: "Bestaande processen en systemen doorlichten en verbeteren." },
  { titel: "Detachering", tekst: "Onze consultants werken bij jou op de vloer, wij blijven hun aanspreekpunt en volgen mee op." },
];

export const PROFIELEN = ["Civil engineer", "Electrical engineer", "Automation engineer", "Mechanical engineer", "Engineering consultant", "Projectleider"];

export const SECTOREN = ["Farma", "Productie", "Bouwondernemingen klasse 8", "Infrastructuur"];

export const WAARDEN: { titel: string; tekst: string }[] = [
  { titel: "Drive en verantwoordelijkheid", tekst: "We nemen een opdracht op alsof ze van onszelf is." },
  { titel: "Extra mile", tekst: "We doen wat afgesproken is, en wat nodig blijkt." },
  { titel: "Betrouwbaar", tekst: "Transparant over wat kan en wat niet, met communicatie als basis." },
  { titel: "Persoonlijk", tekst: "De mens staat centraal: je bent geen nummer in een bestand." },
  { titel: "Technisch sterk", tekst: "Engineers die het vak kennen en blijven bijleren." },
];

export const CERTIFICATEN = ["VCA VOL", "BA4", "BA5"];

/** Alleen cijfers die Specified zelf opgaf. */
export const CIJFERS: { waarde: string; label: string }[] = [
  { waarde: "32", label: "mensen in het team" },
  { waarde: "4", label: "sectoren" },
  { waarde: "6", label: "profielen" },
];

/** Stappen voor wie bij Specified wil werken (invullijst). */
export const STAPPEN_ENGINEER: { titel: string; tekst: string }[] = [
  { titel: "Cv", tekst: "Je solliciteert op een vacature of stuurt een open sollicitatie. We bekijken je cv." },
  { titel: "Eerste gesprek", tekst: "Een kennismaking via Teams: wie ben je, wat zoek je, wat doen wij." },
  { titel: "Tweede gesprek", tekst: "Je ontmoet Tom en Simon in Kontich en we bekijken welk project bij je past." },
];

