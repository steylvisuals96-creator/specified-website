import "server-only";
import { createSign } from "node:crypto";
import { SEO_PAGINAS, type Bron, type ZoekSignaal } from "./config";

const DAG = 86_400_000;
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const VAKBRONNEN = [
  "agoria.be", "vlaio.be", "sirris.be", "buildwise.be", "essenscia.be", "vib.be",
  "imec.be", "vdab.be", "vlaanderen.be", "economie.fgov.be", "indumation.be",
  "food.be", "europa.eu", "flux50.com",
];
const ZOEKRONDES = [
  ["industriële automatisering PLC retrofit", "elektromechanisch onderhoud betrouwbaarheid"],
  ["engineering farmaceutische productie validatie", "onderhoud voedingsindustrie productie"],
  ["engineering infrastructuur BIM werf", "elektrische engineering laagspanning industrie"],
  ["energie-efficiëntie industriële installaties", "project engineering industriële productie"],
];

export function weekStart(nu = new Date()) {
  const utc = new Date(Date.UTC(nu.getUTCFullYear(), nu.getUTCMonth(), nu.getUTCDate()));
  utc.setUTCDate(utc.getUTCDate() - ((utc.getUTCDay() + 6) % 7));
  return utc.toISOString().slice(0, 10);
}

const datum = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export async function providerJson<T>(label: string, url: string, opties: RequestInit, timeout: number): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...opties, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(timeout) });
  } catch {
    throw new Error(`${label} was niet bereikbaar of antwoordde te laat.`);
  }
  if (!res.ok) throw new Error(`${label} gaf HTTP ${res.status}.`);
  try {
    return await res.json() as T;
  } catch {
    throw new Error(`${label} gaf geen geldig antwoord.`);
  }
}

type GoogleRij = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

export async function zoekSignalen(site: string, google: { property: string; email: string; sleutel: string }, nu: Date) {
  const uitgifte = Math.floor(nu.getTime() / 1000);
  const enc = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const jwt = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({
    iss: google.email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: GOOGLE_TOKEN,
    iat: uitgifte,
    exp: uitgifte + 900,
  })}`;
  let assertion: string;
  try {
    assertion = `${jwt}.${createSign("RSA-SHA256").update(jwt).sign(google.sleutel, "base64url")}`;
  } catch {
    throw new Error("De privésleutel van Google Search Console kon niet worden gelezen.");
  }
  const token = await providerJson<{ access_token?: string }>("Google OAuth", GOOGLE_TOKEN, {
    method: "POST",
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  }, 10_000);
  if (!token.access_token) throw new Error("Google OAuth gaf geen toegangstoken.");

  // Laat recente, onvolledige dagen weg. Google geeft datums in Pacific Time terug.
  const periode = { start: datum(nu.getTime() - 30 * DAG), einde: datum(nu.getTime() - 3 * DAG) };
  const data = await providerJson<{ rows?: GoogleRij[] }>("Google Search Console",
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(google.property)}/searchAnalytics/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: periode.start, endDate: periode.einde, type: "web", dataState: "final",
        dimensions: ["page", "query"], rowLimit: 500,
        dimensionFilterGroups: [{ filters: [{ dimension: "country", operator: "equals", expression: "bel" }] }],
      }),
    }, 12_000);

  const perPagina = new Map<string, ZoekSignaal>();
  for (const rij of data.rows ?? []) {
    const [url, term] = rij.keys ?? [];
    const pad = SEO_PAGINAS.find((p) => url === `${site}${p}` || (p === "/" && url === site));
    if (!pad || !term?.trim() || /@|(?:\d[ .+-]*){7}/.test(term) || ![rij.clicks, rij.impressions, rij.ctr, rij.position].every(Number.isFinite)) continue;
    const bestaand = perPagina.get(pad);
    if (rij.impressions < 50 || rij.ctr > 0.025 || rij.position < 4 || rij.position > 20) continue;
    if (bestaand && bestaand.vertoningen >= rij.impressions) continue;
    perPagina.set(pad, {
      pad, zoekterm: term.trim().slice(0, 140), vertoningen: rij.impressions, klikken: rij.clicks,
      positie: rij.position, ctr: rij.ctr,
    });
  }
  return { periode, signalen: Array.from(perPagina.values()).sort((a, b) => b.vertoningen - a.vertoningen) };
}

function bronUrl(input: string) {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.pathname === "/") return null;
    if (!VAKBRONNEN.some((domein) => url.hostname === domein || url.hostname.endsWith(`.${domein}`))) return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|gclid$|fbclid$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.href.length <= 500 ? url : null;
  } catch {
    return null;
  }
}

export function organisatie(bron: Pick<Bron, "url">) {
  const host = new URL(bron.url).hostname;
  return VAKBRONNEN.find((domein) => host === domein || host.endsWith(`.${domein}`)) ?? host;
}

type ApifyRij = { organicResults?: { url?: string; title?: string; description?: string }[] };

export async function vakOnderzoek(token: string, week: string, signalen: ZoekSignaal[], nu: Date) {
  const ronde = Math.floor(Date.parse(week) / (7 * DAG)) % ZOEKRONDES.length;
  const [eerste, tweede] = ZOEKRONDES[ronde];
  const vakSites = "(site:sirris.be OR site:vlaio.be OR site:agoria.be OR site:buildwise.be OR site:essenscia.be OR site:imec.be OR site:europa.eu)";
  const sinds = datum(nu.getTime() - 365 * DAG);
  const zoekterm = signalen.find((s) => /engineer|elektro|automati|industr|mechan|onderhoud|project/i.test(s.zoekterm))?.zoekterm
    .replace(/[^\p{L}\p{N} -]/gu, "").split(/\s+/).slice(0, 7).join(" ").trim();
  const queries = [
    `${eerste} ${vakSites} after:${sinds}`,
    `${eerste} ${vakSites}`,
    `${tweede} ${vakSites}`,
    `${zoekterm || tweede} Vlaanderen ${vakSites}`,
  ];
  const rijen = await providerJson<ApifyRij[]>("Apify",
    "https://api.apify.com/v2/actors/apify~google-search-scraper/run-sync-get-dataset-items?timeout=65&maxTotalChargeUsd=0.05", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ queries: [...new Set(queries)].join("\n"), countryCode: "be", languageCode: "nl", maxPagesPerQuery: 1 }),
    }, 70_000);
  if (!Array.isArray(rijen)) throw new Error("Apify gaf geen lijst met zoekresultaten.");

  const bronnen = new Map<string, Bron>();
  for (const rij of rijen) {
    for (const item of rij.organicResults ?? []) {
      const url = bronUrl(item.url ?? "");
      if (!url || bronnen.has(url.href) || !item.title?.trim() || !item.description?.trim()) continue;
      bronnen.set(url.href, { url: url.href, titel: item.title.trim().slice(0, 180), fragment: item.description.trim().slice(0, 480) });
    }
  }

  // Bewaar genoeg verschillende organisaties als een zoekopdracht één site domineert.
  const aantal = new Map<string, number>();
  return [...bronnen.values()].filter((bron) => {
    const site = organisatie(bron);
    const n = aantal.get(site) ?? 0;
    aantal.set(site, n + 1);
    return n < 3;
  }).slice(0, 18);
}
