/**
 * De twee talen van de website. Nederlands is de standaard; de Engelse
 * teksten staan in pagina_inhoud onder "en:<sleutel>" en op de website onder
 * /en (met Engelse adressen, zie proxy.ts en lib/taal.ts van de website).
 */
export type Taal = "nl" | "en";
export const isTaal = (v: unknown): v is Taal => v === "nl" || v === "en";
export const leesTaal = (v: unknown): Taal => (isTaal(v) ? v : "nl");

/** De rij in pagina_inhoud. */
export const rijSleutel = (sleutel: string, taal: Taal) => (taal === "nl" ? sleutel : `${taal}:${sleutel}`);

/** Waar het voorbeeld op de website staat. */
export const voorbeeldPad = (pad: string, taal: Taal) => (taal === "nl" ? pad : `/${taal}${pad}`);

/** Achter een link in het beheer: ?taal=en, of niets voor Nederlands. */
export const metTaal = (href: string, taal: Taal) => (taal === "nl" ? href : `${href}${href.includes("?") ? "&" : "?"}taal=${taal}`);

const EN_NAAR_NL: Record<string, string> = {
  "for-companies": "voor-bedrijven",
  "for-engineers": "voor-engineers",
  jobs: "vacatures",
  "open-application": "open-sollicitatie",
  accessibility: "toegankelijkheid",
  terms: "algemene-voorwaarden",
};

/** Een adres van de website ("/en/for-companies") naar taal en Nederlands adres ("/voor-bedrijven"). */
export function splitsPad(pad: string): { taal: Taal; nlPad: string } {
  if (pad !== "/en" && !pad.startsWith("/en/")) return { taal: "nl", nlPad: pad };
  const stukken = pad.slice(3).split("/").filter(Boolean);
  if (stukken[0] && EN_NAAR_NL[stukken[0]]) stukken[0] = EN_NAAR_NL[stukken[0]];
  return { taal: "en", nlPad: `/${stukken.join("/")}` };
}
