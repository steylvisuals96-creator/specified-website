import "server-only";

export const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://specified-website.vercel.app";
export const BEHEER_URL = process.env.NEXT_PUBLIC_BEHEER_URL ?? "http://localhost:3004";

/**
 * Laat de website meteen de nieuwe inhoud tonen in plaats van na maximaal een
 * minuut. Mislukt dit (website onbereikbaar, geheim niet ingesteld), dan
 * ververst de website zichzelf alsnog binnen 60 seconden: opslaan faalt nooit
 * hierdoor.
 */
export async function verversWebsite(paden: string[]) {
  const geheim = process.env.WEBSITE_VERVERS_GEHEIM;
  if (!geheim) return;
  try {
    await fetch(`${WEBSITE_URL}/api/ververs`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-ververs-geheim": geheim },
      body: JSON.stringify({ paden }),
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
  } catch {
    // Zie hierboven: de website haalt het binnen een minuut zelf op.
  }
}

/** Publiek adres van een beeld uit de mediatabel. */
export const mediaUrl = (id: string) => `${BEHEER_URL}/m/${id}`;
