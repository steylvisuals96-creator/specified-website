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
  intro: "Engineering consultancy uit Antwerpen: onze eigen consultants versterken jouw projecten.",
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
  profielen: ["Civil Engineer", "Electrical Engineer", "Automation Engineer", "Mechanical Engineer", "Engineering Consultant"],
};

export const DIENSTEN = [
  {
    id: "bedrijven",
    kop: "Voor bedrijven",
    titel: "We design & support projects", // Engineering partner
    tekst:
      "Tijdelijke versterking nodig voor een project, onderhoud of een studie? Wij zetten een eigen consultant in: de juiste persoon op de juiste plek, op het juiste moment. Van projectontwikkeling en systeemintegratie tot het optimaliseren van bestaande processen.",
    cta: "Zet onze consultants in",
    href: "#contact",
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
    href: "/vacatures",
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
};
