/**
 * Twee talen: Nederlands (standaard, zonder voorvoegsel in het adres) en
 * Engels (onder /en, met Engelse adressen). Intern staan alle pagina's onder
 * app/[taal]/ met de Nederlandse mapnamen; proxy.ts vertaalt de publieke
 * adressen daarnaar. Deze functies werken in de browser en op de server.
 */
export type Taal = "nl" | "en";
export const TALEN: Taal[] = ["nl", "en"];
export const STANDAARD_TAAL: Taal = "nl";
export const isTaal = (v: unknown): v is Taal => v === "nl" || v === "en";

/** Nederlandse mapnaam → Engels adres. Wat hier niet staat, heet in beide talen gelijk (faq, contact, blog, ...). */
export const NL_NAAR_EN: Record<string, string> = {
  "voor-bedrijven": "for-companies",
  "voor-engineers": "for-engineers",
  vacatures: "jobs",
  "open-sollicitatie": "open-application",
  toegankelijkheid: "accessibility",
  "algemene-voorwaarden": "terms",
};
export const EN_NAAR_NL: Record<string, string> = Object.fromEntries(Object.entries(NL_NAAR_EN).map(([nl, en]) => [en, nl]));

/** Splitst een adres in pad, query en hash. */
function delen(adres: string): [string, string] {
  const i = adres.search(/[?#]/);
  return i === -1 ? [adres, ""] : [adres.slice(0, i), adres.slice(i)];
}

/**
 * Het publieke adres van een pagina in een taal. `nlPad` is het Nederlandse
 * adres zoals het in de code staat ("/voor-bedrijven#aanvraag",
 * "/vacatures/slug", "/#over-ons"). Externe links en mailto blijven gelijk.
 */
export function lokaalPad(taal: Taal, nlPad: string): string {
  if (taal === "nl" || !nlPad.startsWith("/") || nlPad.startsWith("//")) return nlPad;
  const [pad, rest] = delen(nlPad);
  const stukken = pad.split("/").filter(Boolean);
  if (stukken[0] && NL_NAAR_EN[stukken[0]]) stukken[0] = NL_NAAR_EN[stukken[0]];
  return `/en${stukken.length ? `/${stukken.join("/")}` : ""}${rest}`;
}

/** De taal van een publiek adres. */
export const taalVanPad = (pad: string): Taal => (pad === "/en" || pad.startsWith("/en/") ? "en" : "nl");

/**
 * Een adres terug naar het Nederlandse adres ("/en/jobs/x" → "/vacatures/x").
 * Ook de interne vorm mag: usePathname() geeft na de rewrite in proxy.ts
 * "/nl/vacatures" of "/en/vacatures".
 */
export function nlPadVan(pad: string): string {
  if (pad === "/nl" || pad.startsWith("/nl/")) return pad.slice(3) || "/";
  if (taalVanPad(pad) === "nl") return pad;
  const stukken = pad.slice(3).split("/").filter(Boolean);
  if (stukken[0] && EN_NAAR_NL[stukken[0]]) stukken[0] = EN_NAAR_NL[stukken[0]];
  return `/${stukken.join("/")}`;
}

/** Hetzelfde publieke adres in de andere taal (voor de taalwissel). */
export const wisselPad = (pad: string, naar: Taal): string => lokaalPad(naar, nlPadVan(pad));

/** Datums zoals bezoekers ze lezen. */
export const LOCALE: Record<Taal, string> = { nl: "nl-BE", en: "en-GB" };

/** Canonical en hreflang voor een pagina die in beide talen bestaat. */
export function taalAlternates(taal: Taal, nlPad: string) {
  return {
    canonical: lokaalPad(taal, nlPad),
    languages: { "nl-BE": nlPad, en: lokaalPad("en", nlPad), "x-default": nlPad },
  };
}
