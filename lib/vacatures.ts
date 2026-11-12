import { CMS_URL } from "./settings";

/**
 * Vacatures uit de CMS, op één plek: de homepage, de lijst en de pagina per
 * vacature lezen dezelfde vorm. Salaris wordt bewust niet doorgegeven
 * (keuze Specified, invullijst 2026-11-12).
 */
export type Vacature = {
  id: string;
  slug: string;
  titel: string;
  vakgebied: string;
  locatie: string;
  uren: string;
  contract: string;
  ervaring: string;
  opleiding: string;
  talen: string[];
  /** ISO-datum van plaatsing. */
  geplaatst?: string;
  ingevuld: boolean;
  beschrijving: string[];
  profiel: string[];
  niceToHave: string[];
  aanbod: string[];
};

const VAKGEBIED: Record<string, string> = {
  civiel: "Civiele techniek",
  elektro: "Elektrotechniek",
  automatisering: "Automatisering",
  werktuig: "Werktuigbouwkunde",
  bouw: "Bouw en infrastructuur",
  industrie: "Industrie en productie",
  energie: "Energie",
  it: "IT en software",
  projectmanagement: "Projectmanagement",
};

const CONTRACT: Record<string, string> = { vast: "Vast", interim: "Interim", freelance: "Freelance", student: "Student" };
const UREN: Record<string, string> = { voltijds: "Voltijds", deeltijds: "Deeltijds", beide: "Voltijds of deeltijds" };
const ERVARING: Record<string, string> = {
  junior: "Junior (0 tot 2 jaar)",
  medior: "Medior (2 tot 5 jaar)",
  senior: "Senior (5+ jaar)",
  lead: "Lead of expert",
};
const OPLEIDING: Record<string, string> = {
  secundair: "Secundair onderwijs",
  graduaat: "Graduaat",
  bachelor: "Bachelor",
  master: "Master",
  geen: "Geen diplomavereiste",
};
const TAAL: Record<string, string> = { nl: "Nederlands", en: "Engels", fr: "Frans", de: "Duits" };

const label = (tabel: Record<string, string>, v: unknown): string =>
  typeof v === "string" && v ? tabel[v] ?? v : "";

/** Verzamelt alle tekst onder één node, hoe diep genest ook. */
function nodeText(node: any): string {
  if (typeof node?.text === "string") return node.text;
  if (Array.isArray(node?.children)) return node.children.map(nodeText).join("");
  return "";
}

/** De omschrijving (Lexical) als losse alinea's. */
function alineas(richText: any): string[] {
  if (!richText?.root?.children) return [];
  return richText.root.children.map(nodeText).map((t: string) => t.trim()).filter(Boolean);
}

const punten = (lijst: any): string[] =>
  Array.isArray(lijst) ? lijst.map((r: any) => (typeof r?.punt === "string" ? r.punt.trim() : "")).filter(Boolean) : [];

export function slugify(tekst: string): string {
  return tekst
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

const UUID_ACHTERAAN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function vorm(v: any): Vacature {
  const titel = typeof v.titel === "string" ? v.titel.trim() : "Vacature";
  const id = String(v.id);
  return {
    id,
    // De CMS geeft elke vacature een vast adres (veld "slug"). Zonder dat veld
    // (CMS nog niet bijgewerkt) vormt de titel met het id het adres.
    slug: typeof v.slug === "string" && v.slug.trim() ? v.slug.trim() : `${slugify(titel) || "vacature"}-${id}`,
    titel,
    vakgebied: label(VAKGEBIED, v.sector),
    locatie: typeof v.locatie === "string" && v.locatie.trim() ? v.locatie.trim() : "Vlaanderen",
    uren: label(UREN, v.uren),
    contract: label(CONTRACT, v.type),
    ervaring: label(ERVARING, v.ervaringsniveau),
    opleiding: label(OPLEIDING, v.opleidingsniveau),
    talen: Array.isArray(v.talen) ? v.talen.map((t: unknown) => label(TAAL, t)).filter(Boolean) : [],
    geplaatst: v.gepubliceerd_op || v.createdAt || undefined,
    ingevuld: v.status === "ingevuld",
    beschrijving: alineas(v.beschrijving),
    profiel: punten(v.vereisten),
    niceToHave: punten(v.nice_to_have),
    aanbod: punten(v.aanbod),
  };
}

/**
 * Open vacatures eerst, ingevulde erna (die blijven zichtbaar als ingevuld).
 * De CMS geeft anoniem alleen terug wat op de website mag staan.
 */
export async function getVacatures(limiet = 100): Promise<Vacature[]> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/vacatures?where[status][in]=actief,ingevuld&limit=${limiet}&sort=-createdAt&depth=0`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const lijst: Vacature[] = (data.docs ?? []).filter((v: any) => v.zichtbaar_op_website !== false).map(vorm);
    return [...lijst.filter((v) => !v.ingevuld), ...lijst.filter((v) => v.ingevuld)];
  } catch {
    return [];
  }
}

/**
 * Eén vacature op haar adres. Geeft null als ze niet (meer) bestaat of niet
 * zichtbaar is. Is de CMS zelf onbereikbaar, dan gooit dit een fout: zo blijft
 * de laatst gebouwde pagina staan in plaats van een 404 die een minuut blijft
 * hangen.
 */
export async function getVacature(slug: string): Promise<Vacature | null> {
  if (!/^[a-z0-9-]{1,140}$/i.test(slug)) return null;
  const id = slug.match(UUID_ACHTERAAN)?.[0];
  const url = id
    ? `${CMS_URL}/api/vacatures/${id}?depth=0`
    : `${CMS_URL}/api/vacatures?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=0`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`CMS gaf ${res.status} voor vacature ${slug}`);
  const data = await res.json();
  const v = id ? data : data.docs?.[0];
  if (!v?.id || v.zichtbaar_op_website === false) return null;
  if (v.status !== "actief" && v.status !== "ingevuld") return null;
  return vorm(v);
}

const DAG = 24 * 60 * 60 * 1000;

/** Aantal dagen online, of undefined zonder datum. */
export function dagenOnline(v: Vacature): number | undefined {
  if (!v.geplaatst) return undefined;
  const t = new Date(v.geplaatst).getTime();
  return Number.isNaN(t) ? undefined : Math.max(0, Math.floor((Date.now() - t) / DAG));
}

export function datumVoluit(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
}
