import { CMS_URL } from "./settings";
import { LEEST_UIT_SUPABASE, supabaseLees } from "./beheer";
import { tiptapAlineas } from "./richtekst";
import { LOCALE, type Taal } from "./taal";
import type { CmsVacature, LexicalDocument, LexicalNode } from "./cms-vormen";

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
  /** voltijds, deeltijds of beide (voor Google for Jobs). */
  urenCode: string;
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

type Labels = Record<"vakgebied" | "contract" | "uren" | "ervaring" | "opleiding" | "taal", Record<string, string>> & { regio: string };

/** De labels bij de codes uit het beheer, per taal. De inhoud van een vacature blijft in de taal waarin ze geschreven is. */
const LABELS: Record<Taal, Labels> = {
  nl: {
    vakgebied: {
      civiel: "Civiele techniek",
      elektro: "Elektrotechniek",
      automatisering: "Automatisering",
      werktuig: "Werktuigbouwkunde",
      bouw: "Bouw en infrastructuur",
      industrie: "Industrie en productie",
      energie: "Energie",
      it: "IT en software",
      projectmanagement: "Projectmanagement",
    },
    contract: { vast: "Vast", interim: "Interim", freelance: "Freelance", student: "Student" },
    uren: { voltijds: "Voltijds", deeltijds: "Deeltijds", beide: "Voltijds of deeltijds" },
    ervaring: {
      junior: "Junior (0 tot 2 jaar)",
      medior: "Medior (2 tot 5 jaar)",
      senior: "Senior (5+ jaar)",
      lead: "Lead of expert",
    },
    opleiding: {
      secundair: "Secundair onderwijs",
      graduaat: "Graduaat",
      bachelor: "Bachelor",
      master: "Master",
      geen: "Geen diplomavereiste",
    },
    taal: { nl: "Nederlands", en: "Engels", fr: "Frans", de: "Duits" },
    regio: "Vlaanderen",
  },
  en: {
    vakgebied: {
      civiel: "Civil engineering",
      elektro: "Electrical engineering",
      automatisering: "Automation",
      werktuig: "Mechanical engineering",
      bouw: "Construction and infrastructure",
      industrie: "Industry and manufacturing",
      energie: "Energy",
      it: "IT and software",
      projectmanagement: "Project management",
    },
    contract: { vast: "Permanent", interim: "Interim", freelance: "Freelance", student: "Student" },
    uren: { voltijds: "Full-time", deeltijds: "Part-time", beide: "Full-time or part-time" },
    ervaring: {
      junior: "Junior (0 to 2 years)",
      medior: "Medior (2 to 5 years)",
      senior: "Senior (5+ years)",
      lead: "Lead or expert",
    },
    opleiding: {
      secundair: "Secondary education",
      graduaat: "Associate degree",
      bachelor: "Bachelor",
      master: "Master",
      geen: "No degree required",
    },
    taal: { nl: "Dutch", en: "English", fr: "French", de: "German" },
    regio: "Flanders",
  },
};

const label = (tabel: Record<string, string>, v: unknown): string =>
  typeof v === "string" && v ? tabel[v] ?? v : "";

/** Verzamelt alle tekst onder één node, hoe diep genest ook. */
function nodeText(node: LexicalNode | undefined): string {
  if (typeof node?.text === "string") return node.text;
  if (Array.isArray(node?.children)) return node.children.map(nodeText).join("");
  return "";
}

/** De omschrijving (Lexical) als losse alinea's. */
function alineas(richText: unknown): string[] {
  const doc = richText as LexicalDocument | null | undefined;
  if (!doc?.root?.children) return [];
  return doc.root.children.map(nodeText).map((t) => t.trim()).filter(Boolean);
}

const punten = (lijst: unknown): string[] =>
  Array.isArray(lijst)
    ? lijst.map((r: { punt?: unknown } | null) => (typeof r?.punt === "string" ? r.punt.trim() : "")).filter(Boolean)
    : [];

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

function vorm(v: CmsVacature, taal: Taal = "nl"): Vacature {
  const L = LABELS[taal];
  const titel = typeof v.titel === "string" ? v.titel.trim() : "Vacature";
  const id = String(v.id);
  return {
    id,
    // De CMS geeft elke vacature een vast adres (veld "slug"). Zonder dat veld
    // (CMS nog niet bijgewerkt) vormt de titel met het id het adres.
    slug: typeof v.slug === "string" && v.slug.trim() ? v.slug.trim() : `${slugify(titel) || "vacature"}-${id}`,
    titel,
    vakgebied: label(L.vakgebied, v.sector),
    locatie: typeof v.locatie === "string" && v.locatie.trim() ? v.locatie.trim() : L.regio,
    uren: label(L.uren, v.uren),
    urenCode: typeof v.uren === "string" ? v.uren : "",
    contract: label(L.contract, v.type),
    ervaring: label(L.ervaring, v.ervaringsniveau),
    opleiding: label(L.opleiding, v.opleidingsniveau),
    talen: Array.isArray(v.talen) ? v.talen.map((t: unknown) => label(L.taal, t)).filter(Boolean) : [],
    geplaatst: v.gepubliceerd_op || v.createdAt || undefined,
    ingevuld: v.status === "ingevuld",
    beschrijving: alineas(v.beschrijving),
    profiel: punten(v.vereisten),
    niceToHave: punten(v.nice_to_have),
    aanbod: punten(v.aanbod),
  };
}

/** Een rij uit het nieuwe beheer (Supabase, tabel vacatures). Salaris staat daar in een aparte, afgeschermde tabel. */
export type SupabaseVacature = {
  id: string;
  slug: string;
  titel: string;
  vakgebied: string;
  contract: string;
  status: string;
  locatie: string;
  ervaring: string | null;
  uren: string | null;
  opleiding: string | null;
  talen: string[];
  beschrijving: unknown;
  vereisten: string[];
  nice_to_have: string[];
  aanbod: string[];
  geplaatst_op: string | null;
  aangemaakt: string;
};

const KOLOMMEN =
  "id,slug,titel,vakgebied,contract,status,locatie,ervaring,uren,opleiding,talen,beschrijving,vereisten,nice_to_have,aanbod,geplaatst_op,aangemaakt";

const schoneLijst = (l: unknown): string[] => (Array.isArray(l) ? l.filter((x): x is string => typeof x === "string" && Boolean(x.trim())).map((x) => x.trim()) : []);

export function vormSupabase(v: SupabaseVacature, taal: Taal = "nl"): Vacature {
  const L = LABELS[taal];
  return {
    id: v.id,
    slug: v.slug,
    titel: v.titel.trim() || "Vacature",
    vakgebied: label(L.vakgebied, v.vakgebied),
    locatie: v.locatie?.trim() || L.regio,
    uren: label(L.uren, v.uren),
    urenCode: v.uren ?? "",
    contract: label(L.contract, v.contract),
    ervaring: label(L.ervaring, v.ervaring),
    opleiding: label(L.opleiding, v.opleiding),
    talen: schoneLijst(v.talen).map((t) => label(L.taal, t)).filter(Boolean),
    geplaatst: v.geplaatst_op || v.aangemaakt || undefined,
    ingevuld: v.status === "ingevuld",
    beschrijving: tiptapAlineas(v.beschrijving),
    profiel: schoneLijst(v.vereisten),
    niceToHave: schoneLijst(v.nice_to_have),
    aanbod: schoneLijst(v.aanbod),
  };
}

/**
 * Open vacatures eerst, ingevulde erna (die blijven zichtbaar als ingevuld).
 * De CMS geeft anoniem alleen terug wat op de website mag staan.
 */
export async function getVacatures(limiet = 100, taal: Taal = "nl"): Promise<Vacature[]> {
  if (LEEST_UIT_SUPABASE) {
    try {
      // RLS geeft anoniem alleen zichtbare vacatures met status actief of ingevuld.
      const rijen = await supabaseLees<SupabaseVacature>(`vacatures?select=${KOLOMMEN}&order=aangemaakt.desc&limit=${limiet}`);
      const lijst = rijen.map((r) => vormSupabase(r, taal));
      return [...lijst.filter((v) => !v.ingevuld), ...lijst.filter((v) => v.ingevuld)];
    } catch {
      return [];
    }
  }
  try {
    const res = await fetch(
      `${CMS_URL}/api/vacatures?where[status][in]=actief,ingevuld&limit=${limiet}&sort=-createdAt&depth=0`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const lijst: Vacature[] = (data.docs ?? []).filter((v: CmsVacature) => v.zichtbaar_op_website !== false).map((v: CmsVacature) => vorm(v, taal));
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
export async function getVacature(slug: string, taal: Taal = "nl"): Promise<Vacature | null> {
  if (!/^[a-z0-9-]{1,140}$/i.test(slug)) return null;
  const id = slug.match(UUID_ACHTERAAN)?.[0];
  if (LEEST_UIT_SUPABASE) {
    // Gooit bij een onbereikbare database: dan blijft de laatst gebouwde pagina staan.
    const filter = id ? `or=(slug.eq.${encodeURIComponent(slug)},id.eq.${id})` : `slug=eq.${encodeURIComponent(slug)}`;
    const [rij] = await supabaseLees<SupabaseVacature>(`vacatures?select=${KOLOMMEN}&${filter}&limit=1`);
    return rij ? vormSupabase(rij, taal) : null;
  }
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
  return vorm(v, taal);
}

const DAG = 24 * 60 * 60 * 1000;

/** Aantal dagen online, of undefined zonder datum. */
export function dagenOnline(v: Vacature): number | undefined {
  if (!v.geplaatst) return undefined;
  const t = new Date(v.geplaatst).getTime();
  return Number.isNaN(t) ? undefined : Math.max(0, Math.floor((Date.now() - t) / DAG));
}

export function datumVoluit(iso?: string, taal: Taal = "nl"): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(LOCALE[taal], { day: "numeric", month: "long", year: "numeric" });
}
