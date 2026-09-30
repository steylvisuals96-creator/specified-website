import { CONSULTANTS, DIENSTEN, HERO, JOBS, META, TEKENING, TEKENING_CALLOUTS } from "@/lib/inhoud";

/**
 * Alle teksten die via het admin-balkje aan te passen zijn, met hun standaardtekst.
 *
 * De standaardteksten blijven in de code (lib/inhoud.ts of hier). Het CRM bewaart
 * enkel wat iemand wijzigde. Een sleutel die hier niet staat, wordt nergens
 * getoond en door de beheer-API geweigerd.
 *
 * Nieuwe tekst aanpasbaar maken: voeg hem hier toe en gebruik <T k="..." /> op de
 * plek waar hij staat.
 *
 * Bewust niet in de lijst: teamleden, blogartikelen en vacatures (die beheer je in
 * het CRM zelf), de juridische pagina's en de labels binnen de filters.
 */

/** Zelfde regels als in het CRM (collections/Teksten.ts). */
export const SLEUTEL_PATROON = /^[a-z0-9][a-z0-9._-]{0,119}$/;
export const MAX_TEKST = 2000;

export type TekstDef = { k: string; d: string; groep: string; label: string };

const GROEPEN = {
  hero: "Hero",
  tekening: "Hero: de tekening",
  consultants: "Onze consultants",
  diensten: "Diensten",
  jobs: "Vacatures op de homepage",
  vacatures: "Vacaturepagina",
  team: "Over ons",
  cta: "Contact",
  menu: "Menu",
  footer: "Footer",
  meta: "Zoekmachines",
} as const;
export const GROEP_VOLGORDE = Object.values(GROEPEN);

const r = (groep: keyof typeof GROEPEN, k: string, d: string, label: string): TekstDef => ({
  k,
  d,
  groep: GROEPEN[groep],
  label,
});

const dienst = (id: string, naam: string): TekstDef[] => {
  const d = DIENSTEN.find((x) => x.id === id)!;
  return [
    r("diensten", `diensten.${id}.kop`, d.kop, `${naam}: kop`),
    r("diensten", `diensten.${id}.titel`, d.titel, `${naam}: ondertitel`),
    r("diensten", `diensten.${id}.tekst`, d.tekst, `${naam}: tekst`),
    r("diensten", `diensten.${id}.cta`, d.cta, `${naam}: knop`),
  ];
};

export const REGISTER: TekstDef[] = [
  r("hero", "hero.prefix", HERO.prefix, "Kop: eerste woord"),
  r("hero", "hero.woord", HERO.woord, "Kop: gekleurd woord"),
  r("hero", "hero.suffix", HERO.suffix, "Kop: tweede regel"),
  r("hero", "hero.cta_bedrijven", HERO.ctaBedrijven, "Knop voor bedrijven"),
  r("hero", "hero.cta_engineers", HERO.ctaEngineers, "Knop voor engineers"),

  r("tekening", "tekening.intro", TEKENING.intro, "Introzin (vet)"),
  r("tekening", "tekening.scroll_hint", TEKENING.scrollHint, "Scrollhint"),
  r("tekening", "tekening.titelblok.project", TEKENING.titelblok.project, "Titelblok: project"),
  r("tekening", "tekening.titelblok.locatie", TEKENING.titelblok.locatie, "Titelblok: locatie (stad, regio)"),
  r("tekening", "tekening.titelblok.waarden", TEKENING.titelblok.waarden, "Titelblok: waarden"),
  r("tekening", "tekening.titelblok.akkoord", TEKENING.titelblok.akkoord, "Titelblok: goedkeuring"),
  ...TEKENING_CALLOUTS.flatMap(([titel, sub], i) => [
    r("tekening", `tekening.callout.${i}.titel`, titel, `Letter ${i + 1} van SPECIFIED: woord`),
    r("tekening", `tekening.callout.${i}.sub`, sub, `Letter ${i + 1} van SPECIFIED: uitleg`),
  ]),

  r("consultants", "consultants.titel", CONSULTANTS.titel, "Kop: eerste woord"),
  r("consultants", "consultants.accent", CONSULTANTS.accent, "Kop: gekleurd woord"),
  r("consultants", "consultants.tekst", CONSULTANTS.tekst, "Tekst"),
  ...CONSULTANTS.profielen.map((p, i) => r("consultants", `consultants.profiel.${i}`, p, `Profiel ${i + 1}`)),

  ...dienst("bedrijven", "Voor bedrijven"),
  ...dienst("engineers", "Voor engineers"),

  r("jobs", "jobs.titel", JOBS.titel, "Kop (ook op de vacaturepagina)"),
  r("jobs", "jobs.link_tekst", JOBS.linkTekst, "Knop naar alle vacatures"),
  r(
    "jobs",
    "jobs.leeg",
    "Er staan op dit moment geen vacatures online. Stuur ons gerust je cv: we zoeken ook buiten de openstaande jobs.",
    "Tekst als er geen vacatures zijn"
  ),
  r("jobs", "jobs.leeg_knop", "Stuur een open sollicitatie", "Knop als er geen vacatures zijn"),

  r("vacatures", "vacatures.geen", "Geen vacatures gevonden voor deze filters.", "Geen resultaten"),
  r("vacatures", "vacatures.bekijk", "Bekijk", "Knop: bekijk een vacature"),
  r("vacatures", "vacatures.sluiten", "Sluiten", "Knop: sluit een vacature"),
  r("vacatures", "vacatures.profiel", "Jouw profiel", "Tussenkop: profiel"),
  r("vacatures", "vacatures.nice", "Nice to have", "Tussenkop: nice to have"),
  r("vacatures", "vacatures.aanbod", "Wat we bieden", "Tussenkop: aanbod"),

  r("team", "team.titel", "Twee founders.", "Kop: eerste deel"),
  r("team", "team.accent", "Eén missie.", "Kop: gekleurd deel"),

  r("cta", "cta.titel", "Laten we kennismaken.", "Kop"),

  r("menu", "nav.diensten", "Diensten", "Menu: diensten"),
  r("menu", "nav.jobs", "Jobs", "Menu: jobs"),
  r("menu", "nav.blog", "Blog", "Menu: blog"),
  r("menu", "nav.over_ons", "Over ons", "Menu: over ons"),
  r("menu", "nav.contact", "Contact", "Menu: contact"),
  r("menu", "nav.cta", "Neem contact op", "Menu: knop"),

  r("footer", "footer.privacy", "Privacy", "Link: privacy"),
  r("footer", "footer.cookies", "Cookies", "Link: cookies"),
  r("footer", "footer.linkedin", "LinkedIn", "Link: LinkedIn"),
  r("footer", "footer.bedrijfsregel", "© 2026 Specified BV — Kontich, België", "Bedrijfsregel onderaan"),

  r("meta", "meta.titel", META.titel, "Paginatitel in het tabblad en in Google"),
  r("meta", "meta.beschrijving", META.beschrijving, "Beschrijving in Google"),
];

export const STANDAARD: Record<string, string> = Object.fromEntries(REGISTER.map((t) => [t.k, t.d]));
export const GELDIGE_SLEUTELS: ReadonlySet<string> = new Set(REGISTER.map((t) => t.k));

/** De live tekst: wat het CRM bewaart, en anders de standaard. */
export function kies(waarden: Record<string, string>, k: string, d?: string): string {
  return waarden[k] || d || STANDAARD[k] || "";
}

/**
 * Maakt van ingevoerde tekst een nette enkele regel: regeleinden en dubbele
 * spaties worden één spatie, besturingstekens vallen weg, en de tekst wordt
 * afgekapt op de maximumlengte.
 */
export function ontsmet(tekst: string): string {
  return tekst.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_TEKST);
}
