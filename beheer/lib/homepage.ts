/**
 * De teksten van de homepage: één beschrijving voor het formulier, het live
 * voorbeeld en de controle op de server. De vorm van het opgeslagen object is
 * dezelfde als de oude Payload-global "website", zodat de website ze met
 * dezelfde code samenvoegt (lib/website.ts, samenvoegen()).
 *
 * Een leeg veld betekent: de standaardtekst van de website (lib/inhoud.ts
 * daar). Die standaard staat hier als placeholder, zodat je ziet wat er komt.
 */
import type { Taal } from "./taal";

export type VeldDef = {
  sleutel: string;
  label: string;
  max: number;
  standaard?: string;
  /** De Engelse standaardtekst (lib/inhoud-en.ts op de website). */
  standaardEn?: string;
  hint?: string;
  soort?: "tekst" | "tekstvak" | "email";
  /** Controle die alleen een melding geeft (null = in orde). */
  controle?: (v: string) => string | null;
};

export type GroepDef = { sleutel: string; titel: string; uitleg?: string; velden: VeldDef[] };

export const CALLOUT_LETTERS = ["S", "P", "E", "C", "I", "F", "I", "E", "D"];
export const CALLOUT_STANDAARD: [string, string][] = [
  ["Studies", "en procesoptimalisatie"],
  ["Projecten", "en onderhoud"],
  ["Elektromechanica", "onze specialisatie"],
  ["Consultants", "eigen engineers, bij jou ingezet"],
  ["Industrie", "onze partners"],
  ["Focus", "energie, fun en passie"],
  ["Integratie", "systemen en processen"],
  ["Extra mile", "we run the extra mile"],
  ["Drive", "en verantwoordelijkheid"],
];
export const PROFIELEN_STANDAARD = ["Civil Engineer", "Electrical Engineer", "Automation Engineer", "Mechanical Engineer", "Engineering Consultant"];
export const CALLOUT_STANDAARD_EN: [string, string][] = [
  ["Studies", "temporary support"],
  ["Projects", "and maintenance"],
  ["Electromechanics", "our specialization"],
  ["Consultants", "our own engineers, at your site"],
  ["Industry", "our partners"],
  ["Focus", "energy, fun and passion"],
  ["Integration", "systems and processes"],
  ["Extra mile", "we run the extra mile"],
  ["Drive", "and responsibility"],
];
export const PROFIELEN_STANDAARD_EN = ["Civil Engineer", "Electrical Engineer", "Automation Engineer", "Mechanical Engineer", "Engineering Consultant", "Project Manager"];

export const GROEPEN: GroepDef[] = [
  {
    sleutel: "hero",
    titel: "Kop bovenaan",
    uitleg: "De grote titel en de twee knoppen aan het einde van de tekening.",
    velden: [
      { sleutel: "hero.prefix", label: "Eerste woord", max: 20, standaard: "We" },
      { sleutel: "hero.woord", label: "Accentwoord (in limoen)", max: 24, standaard: "engineer" },
      { sleutel: "hero.suffix", label: "Tweede regel", max: 30, standaard: "possibilities." },
      { sleutel: "hero.ctaBedrijven", label: "Knop voor bedrijven", max: 40, standaard: "Zet onze consultants in", standaardEn: "Deploy our consultants" },
      { sleutel: "hero.ctaEngineers", label: "Knop voor engineers", max: 40, standaard: "Word consultant", standaardEn: "Become a consultant" },
    ],
  },
  {
    sleutel: "tekening",
    titel: "Technische tekening",
    uitleg: "De tekst bij de tekening van het woord SPECIFIED. De tekening bouwt zich opnieuw op als je even stopt met typen.",
    velden: [
      { sleutel: "tekening.intro", label: "Inleiding", max: 140, soort: "tekstvak", standaard: "Engineering consultancy uit Antwerpen: onze eigen consultants versterken jouw projecten.", standaardEn: "Engineering consultancy from Kontich: our own consultants strengthen your projects." },
      { sleutel: "tekening.scrollHint", label: "Scrollhint", max: 60, standaard: "Scroll om de specificatie te openen.", standaardEn: "Scroll to open the specification." },
      { sleutel: "tekening.project", label: "Titelblok: project", max: 40, standaard: "We are here to stay" },
      {
        sleutel: "tekening.locatie",
        label: "Titelblok: locatie (stad, regio)",
        max: 40,
        standaard: "Kontich, Antwerpen",
        standaardEn: "Kontich, Antwerp",
        controle: (v) => (!v || v.includes(", ") ? null : "Schrijf stad en regio gescheiden door een komma en spatie, bv. Kontich, Antwerpen."),
      },
      { sleutel: "tekening.waarden", label: "Titelblok: waarden", max: 40, standaard: "Drive en verantwoordelijkheid", standaardEn: "Drive and responsibility" },
      { sleutel: "tekening.akkoord", label: "Titelblok: goedkeuring", max: 40, standaard: "Goedgekeurd door Specified", standaardEn: "Approved by Specified" },
      { sleutel: "tekening.labelProject", label: "Titelblok: label boven project", max: 20, standaard: "Project" },
      { sleutel: "tekening.labelLocatie", label: "Titelblok: label boven locatie", max: 20, standaard: "Locatie", standaardEn: "Location" },
      { sleutel: "tekening.labelWaarden", label: "Titelblok: label boven waarden", max: 20, standaard: "Waarden", standaardEn: "Values" },
      { sleutel: "tekening.labelGoedgekeurd", label: "Titelblok: label boven handtekening (telefoon)", max: 20, standaard: "Goedgekeurd", standaardEn: "Approved" },
    ],
  },
  {
    sleutel: "consultants",
    titel: "Onze consultants",
    velden: [
      { sleutel: "consultants.titel", label: "Titel", max: 20, standaard: "Onze", standaardEn: "Our" },
      { sleutel: "consultants.accent", label: "Accentwoord (in limoen)", max: 24, standaard: "consultants." },
      { sleutel: "consultants.tekst", label: "Tekst", max: 400, soort: "tekstvak", standaard: "Eigen engineers, in dienst van Specified, tijdelijk ingezet bij jouw projecten, onderhoud en studies.", standaardEn: "Our own engineers, employed by Specified, temporarily deployed on your projects, maintenance and studies." },
    ],
  },
  {
    sleutel: "diensten_bedrijven",
    titel: "Blok voor bedrijven",
    velden: [
      { sleutel: "diensten_bedrijven.kop", label: "Kop", max: 30, standaard: "Voor bedrijven", standaardEn: "For companies" },
      { sleutel: "diensten_bedrijven.titel", label: "Titel", max: 60, standaard: "We design & support projects" },
      { sleutel: "diensten_bedrijven.tekst", label: "Tekst", max: 600, soort: "tekstvak", standaard: "Tijdelijke versterking nodig voor een project, onderhoud of een studie? Wij zetten een eigen consultant in: de juiste persoon op de juiste plek, op het juiste moment.", standaardEn: "Need temporary reinforcement for a project, maintenance or a study? We deploy one of our own consultants: the right person in the right place, at the right time." },
      { sleutel: "diensten_bedrijven.cta", label: "Knop", max: 40, standaard: "Zet onze consultants in", standaardEn: "Deploy our consultants" },
    ],
  },
  {
    sleutel: "diensten_engineers",
    titel: "Blok voor engineers",
    velden: [
      { sleutel: "diensten_engineers.kop", label: "Kop", max: 30, standaard: "Voor engineers", standaardEn: "For engineers" },
      { sleutel: "diensten_engineers.titel", label: "Titel", max: 60, standaard: "We engineer possibilities" },
      { sleutel: "diensten_engineers.tekst", label: "Tekst", max: 600, soort: "tekstvak", standaard: "Als consultant bij Specified ontdek je verschillende projecten en sectoren zonder je hele carrière op één pad vast te leggen.", standaardEn: "As a consultant at Specified, you discover different projects and sectors without committing your whole career to one path." },
      { sleutel: "diensten_engineers.cta", label: "Knop", max: 40, standaard: "Word consultant", standaardEn: "Become a consultant" },
    ],
  },
  {
    sleutel: "jobs",
    titel: "Vacatures op de homepage",
    velden: [
      { sleutel: "jobs.titel", label: "Titel", max: 40, standaard: "Word consultant.", standaardEn: "Become a consultant." },
      { sleutel: "jobs.linkTekst", label: "Link naar alle vacatures", max: 40, standaard: "Alle vacatures", standaardEn: "All jobs" },
      {
        sleutel: "jobs.leeg",
        label: "Tekst als er geen vacatures online staan",
        max: 200,
        soort: "tekstvak",
        standaard: "Er staan op dit moment geen vacatures online. Stuur ons gerust je cv: we zoeken ook buiten de openstaande jobs.",
        standaardEn: "There are no job openings online right now. Feel free to send us your resume: we also recruit beyond the open positions.",
      },
      { sleutel: "jobs.openKnop", label: "Knop open sollicitatie (zonder vacatures)", max: 40, standaard: "Stuur een open sollicitatie", standaardEn: "Send a general application" },
    ],
  },
  {
    sleutel: "team",
    titel: "Over ons",
    uitleg: "De kop boven de founders. De teamleden zelf pas je aan bij Team; klik op een teamlid in het voorbeeld om dat te openen.",
    velden: [
      { sleutel: "team.titel", label: "Titel", max: 30, standaard: "Twee founders.", standaardEn: "Two founders." },
      { sleutel: "team.accent", label: "Tweede regel (schuin, in limoen)", max: 30, standaard: "Eén missie.", standaardEn: "One mission." },
    ],
  },
  {
    sleutel: "cta",
    titel: "Afsluiter",
    uitleg: "De grote zin boven het e-mailadres onderaan de homepage.",
    velden: [{ sleutel: "cta.titel", label: "Titel", max: 50, standaard: "Laten we kennismaken.", standaardEn: "Let's get acquainted." }],
  },
  {
    sleutel: "contact",
    titel: "Contact en footer",
    uitleg: "Staat in het contactblok en onderaan elke pagina.",
    velden: [
      { sleutel: "contact.email", label: "Contact-e-mail", max: 120, soort: "email", standaard: "info@specified.be", controle: (v) => (!v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : "Dat is geen geldig e-mailadres.") },
      {
        sleutel: "contact.telefoon",
        label: "Telefoon",
        max: 30,
        controle: (v) => (!v || /^\+?[0-9 ()./-]{6,30}$/.test(v) ? null : "Alleen cijfers, spaties en + ( ) . / -, bv. +32 3 123 45 67."),
      },
      {
        sleutel: "contact.linkedin",
        label: "LinkedIn-pagina",
        max: 200,
        controle: (v) => (!v || /^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(v) ? null : "Plak het volledige adres, beginnend met https://www.linkedin.com/"),
      },
      { sleutel: "contact.footerTekst", label: "Regel onderaan (footer)", max: 120 },
    ],
  },
];

/** Velden die in beide talen gelijk zijn: alleen in het Nederlands te bewerken. */
const GEDEELD = ["contact.email", "contact.telefoon", "contact.linkedin"];

/**
 * De groepen voor een taal. In het Engels staat de Engelse standaard als
 * placeholder, en ontbreken e-mail, telefoon en LinkedIn (die zijn gedeeld).
 */
export function groepenVoor(taal: Taal): GroepDef[] {
  if (taal === "nl") return GROEPEN;
  return GROEPEN.map((g) => ({
    ...g,
    uitleg: g.sleutel === "contact" ? "E-mail, telefoon en LinkedIn zijn voor beide talen dezelfde: die pas je aan bij Nederlands." : g.uitleg,
    velden: g.velden.filter((v) => !GEDEELD.includes(v.sleutel)).map((v) => ({ ...v, standaard: v.standaardEn ?? v.standaard })),
  }));
}

const ALLE_VELDEN = GROEPEN.flatMap((g) => g.velden);

type Obj = Record<string, unknown>;

export function lees(obj: Obj, pad: string): unknown {
  return pad.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Obj)[k] : undefined), obj);
}

function zet(obj: Obj, pad: string, waarde: unknown) {
  const delen = pad.split(".");
  let o = obj;
  for (const k of delen.slice(0, -1)) o = (o[k] ??= {}) as Obj;
  o[delen[delen.length - 1]] = waarde;
}

const schoon = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

/**
 * Bouwt het opgeslagen object uit het formulier. Lege velden blijven weg
 * (dan geldt de standaardtekst van de website).
 */
export function uitFormulier(fd: FormData): Obj {
  const uit: Obj = {};
  for (const v of ALLE_VELDEN) {
    const w = schoon(fd.get(v.sleutel), v.max);
    if (w) zet(uit, v.sleutel, w);
  }
  uit.callouts = CALLOUT_STANDAARD.map((_, i) => ({
    label: schoon(fd.get(`callouts.${i}.label`), 24),
    tekst: schoon(fd.get(`callouts.${i}.tekst`), 44),
  }));
  const profielen = fd
    .getAll("consultants.profielen")
    .map((p) => schoon(p, 36))
    .filter(Boolean)
    .slice(0, 12);
  if (profielen.length) zet(uit, "consultants.profielen", profielen.map((naam) => ({ naam })));
  return uit;
}

/** Meldingen per veld; leeg object = alles in orde. */
export function controleer(obj: Obj): Record<string, string> {
  const fouten: Record<string, string> = {};
  for (const v of ALLE_VELDEN) {
    const w = lees(obj, v.sleutel);
    const melding = v.controle?.(typeof w === "string" ? w : "");
    if (melding) fouten[v.sleutel] = melding;
  }
  const callouts = (obj.callouts as { label: string }[]) ?? [];
  callouts.forEach((c, i) => {
    if (c.label && c.label[0]?.toUpperCase() !== CALLOUT_LETTERS[i]) fouten[`callouts.${i}.label`] = `Moet beginnen met de letter ${CALLOUT_LETTERS[i]}.`;
  });
  return fouten;
}
