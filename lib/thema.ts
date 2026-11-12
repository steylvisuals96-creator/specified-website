/**
 * Licht of donker: de bezoeker kiest (wens van Specified, invullijst
 * 2026-11-12). Donker is de standaard, want dat is de huisstijl; de keuze
 * wordt onthouden in localStorage. Dit is een voorkeur, geen tracking, dus er
 * is geen cookietoestemming voor nodig.
 */
export const THEMA_KEY = "specified-thema";
export type Thema = "donker" | "licht";

/** Draait inline in <head>, vóór de eerste weergave, zodat er niets flitst. */
export const THEMA_HEAD_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(THEMA_KEY)})==="licht")document.documentElement.dataset.thema="licht"}catch(e){}`;

export function leesThema(): Thema {
  return typeof document !== "undefined" && document.documentElement.dataset.thema === "licht" ? "licht" : "donker";
}

export function zetThema(thema: Thema) {
  if (thema === "licht") document.documentElement.dataset.thema = "licht";
  else delete document.documentElement.dataset.thema;
  try {
    window.localStorage.setItem(THEMA_KEY, thema);
  } catch {
    /* opslag geweigerd: de keuze geldt dan voor deze pagina */
  }
}
