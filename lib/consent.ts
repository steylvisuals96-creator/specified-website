export const CONSENT_KEY = "specified-cookie-consent";

/** Gevraagd wanneer de bezoeker zijn keuze wijzigt of intrekt. */
export const CONSENT_EVENT = "specified:consent";

export type ConsentValue = "accepted" | "declined";

/** Leest de opgeslagen keuze. `null` = nog niet gekozen; dan mag er niets laden. */
export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw === "accepted" || raw === "declined" ? raw : null;
  } catch {
    // localStorage kan geblokkeerd zijn (private mode, strenge browserinstellingen).
    // Geen toestemming aantoonbaar => niets laden.
    return null;
  }
}

export function writeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* opslag geweigerd: de keuze geldt dan alleen voor deze pagina-sessie */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Wist de keuze zodat de banner opnieuw verschijnt. */
export function clearConsent() {
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* niets te wissen */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

/** Abonneert op wijzigingen, ook vanuit een ander tabblad. */
export function onConsentChange(handler: () => void): () => void {
  const storage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY) handler();
  };
  window.addEventListener(CONSENT_EVENT, handler);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handler);
    window.removeEventListener("storage", storage);
  };
}
