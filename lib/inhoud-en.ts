/**
 * De Engelse standaardteksten, met dezelfde vorm als lib/inhoud.ts. Vertaald
 * uit het Nederlands (2026-11-23), waar mogelijk met de bewoording van de
 * vroegere Engelstalige site van Specified. Specified kan ze in het beheer
 * aanpassen (schakelaar EN); een leeg veld daar toont de tekst van hier.
 */
import type * as NL from "./inhoud";

/** Het acrostichon blijft SPECIFIED: elk Engels label begint met dezelfde letter. */
export const TEKENING_CALLOUTS: typeof NL.TEKENING_CALLOUTS = [
  ["Studies", "and process optimization"],
  ["Projects", "and maintenance"],
  ["Electromechanics", "our specialization"],
  ["Consultants", "our own engineers, at your site"],
  ["Industry", "our partners"],
  ["Focus", "energy, fun and passion"],
  ["Integration", "systems and processes"],
  ["Extra mile", "we run the extra mile"],
  ["Drive", "and responsibility"],
];

export const TEKENING: typeof NL.TEKENING = {
  intro: "Engineering consultancy from Kontich: our own consultants strengthen your projects.",
  scrollHint: "Scroll to open the specification.",
  titelblok: {
    project: "We are here to stay",
    locatie: "Kontich, Antwerp",
    waarden: "Drive and responsibility",
    akkoord: "Approved by Specified",
  },
};

export const HERO: typeof NL.HERO = {
  prefix: "We",
  woord: "engineer",
  suffix: "possibilities.",
  ctaBedrijven: "Deploy our consultants",
  ctaEngineers: "Become a consultant",
};

export const CONSULTANTS: typeof NL.CONSULTANTS = {
  titel: "Our",
  accent: "consultants.",
  tekst: "Our own engineers, employed by Specified, temporarily deployed on your projects, maintenance and studies.",
  profielen: ["Civil Engineer", "Electrical Engineer", "Automation Engineer", "Mechanical Engineer", "Engineering Consultant", "Project Manager"],
};

export const DIENSTEN: typeof NL.DIENSTEN = [
  {
    id: "bedrijven",
    kop: "For companies",
    titel: "We design & support projects",
    tekst:
      "Need temporary reinforcement for a project, maintenance or a study? We deploy one of our own consultants: the right person in the right place, at the right time. From project development and system integration to optimizing existing processes.",
    cta: "Deploy our consultants",
    href: "/voor-bedrijven",
    knop: "btn-primary",
    beeld: "/images/beeld/bedrijven-installatie.jpg",
    beeldId: "a376eba1-0a38-49d5-a2c9-9a108d062da0",
  },
  {
    id: "engineers",
    kop: "For engineers",
    titel: "We engineer possibilities",
    tekst:
      "As a consultant at Specified, you discover different projects and sectors without committing your whole career to one path. We guide your choices, keep talking about what you want and help you grow into an expert or a versatile generalist.",
    cta: "Become a consultant",
    href: "/voor-engineers",
    knop: "btn-secondary",
    beeld: "/images/beeld/kandidaten-engineer.jpg",
    beeldId: "b32749fc-056c-4b2a-a3de-75604b8159b1",
  },
];

export const JOBS: typeof NL.JOBS = {
  titel: "Become a consultant.",
  linkTekst: "All jobs",
  leeg: "There are no job openings online right now. Feel free to send us your resume: we also recruit beyond the open positions.",
  openKnop: "Send a general application",
};

export const META: typeof NL.META = {
  titel: "Specified | Engineering consultancy",
  beschrijving:
    "Belgian engineering consultancy specialized in electromechanics for industry. Our own consultants support projects, maintenance and studies.",
};

export const CONTACT: typeof NL.CONTACT = {
  email: "info@specified.be",
  telefoon: "+32 472 69 94 62",
  telefoonLink: "+32472699462",
  plaats: "Kontich, Antwerp",
  straat: "Veldkant 31a",
  postcode: "2550 Kontich, Belgium",
  linkedin: "https://www.linkedin.com/company/specified-be",
};

export const BEDRIJF: typeof NL.BEDRIJF = {
  naam: "Specified NV",
  ondernemingsnummer: "BE 0727.537.711",
};

export const DIENSTENLIJST: typeof NL.DIENSTENLIJST = [
  { titel: "Temporary reinforcement", tekst: "An extra engineer for the duration of your project, at the moment your team needs one." },
  { titel: "Maintenance", tekst: "Support with planned and unplanned maintenance of installations." },
  { titel: "Studies", tekst: "Feasibility studies, design and calculations, worked out by a consultant with the right specialization." },
  { titel: "Process optimization", tekst: "Analyzing and improving existing processes and systems." },
  { titel: "Secondment", tekst: "Our consultants work on your shop floor; we remain their point of contact and stay involved." },
];

export const PROFIELEN: typeof NL.PROFIELEN = ["Civil engineer", "Electrical engineer", "Automation engineer", "Mechanical engineer", "Engineering consultant", "Project manager"];

export const SECTOREN: typeof NL.SECTOREN = ["Pharma", "Manufacturing", "Class 8 construction companies", "Infrastructure"];

export const WAARDEN: typeof NL.WAARDEN = [
  { titel: "Drive and responsibility", tekst: "We take on an assignment as if it were our own." },
  { titel: "Extra mile", tekst: "We do what was agreed, and what turns out to be needed." },
  { titel: "Reliable", tekst: "Transparent about what is and isn't possible, with communication as the foundation." },
  { titel: "Personal", tekst: "People come first: you are not a number in a database." },
  { titel: "Technically strong", tekst: "Engineers who know their craft and keep learning." },
];

export const CERTIFICATEN: typeof NL.CERTIFICATEN = ["VCA VOL", "BA4", "BA5"];

export const CIJFERS: typeof NL.CIJFERS = [
  { waarde: "32", label: "people on the team" },
  { waarde: "4", label: "sectors" },
  { waarde: "6", label: "profiles" },
];

export const STAPPEN_ENGINEER: typeof NL.STAPPEN_ENGINEER = [
  { titel: "Resume", tekst: "You apply for a job opening or send a general application. We review your resume." },
  { titel: "First interview", tekst: "An introduction via Teams: who you are, what you are looking for, what we do." },
  { titel: "Second interview", tekst: "You meet Tom and Simon in Kontich and we look at which project suits you." },
];
