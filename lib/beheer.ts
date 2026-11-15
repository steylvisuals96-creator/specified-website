/**
 * Het nieuwe beheer (map beheer/, Supabase en R2 zonder Payload).
 *
 * De website leest rechtstreeks uit Supabase zodra NEXT_PUBLIC_DATABRON op
 * "supabase" staat. Zonder die variabele blijft alles uit de oude CMS komen:
 * zo schakelen we in één keer over en kunnen we in één keer terug.
 *
 * Lezen gebeurt met de publishable key; RLS in de database bepaalt wat
 * publiek is (actieve vacatures, gepubliceerde artikels, actieve teamleden,
 * media en de homepage-teksten). Geen extra bibliotheek: PostgREST via fetch,
 * zodat de caching van Next (revalidate, tags) gewoon werkt.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const LEEST_UIT_SUPABASE = process.env.NEXT_PUBLIC_DATABRON === "supabase" && Boolean(SUPABASE_URL && SUPABASE_KEY);

/**
 * Adres van het beheer; beelden staan op /m/<id> (ondertekende R2-link).
 * Bewust geen standaard: zonder deze variabele vertrouwt de website geen
 * enkel beheer (geen frame, geen beeldhost), ook geen domein dat iemand anders
 * later zou kunnen claimen.
 */
export const BEHEER_URL = process.env.NEXT_PUBLIC_BEHEER_URL ?? "";

export const beheerOrigin = (() => {
  try {
    return new URL(BEHEER_URL).origin;
  } catch {
    return "";
  }
})();

export const mediaUrl = (id: unknown) =>
  BEHEER_URL && typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id) ? `${BEHEER_URL}/m/${id}` : undefined;

/** Tag voor revalidateTag: het beheer ververst hiermee alles in één keer (app/api/ververs). */
export const INHOUD_TAG = "beheer-inhoud";

/**
 * Leest rijen via de Data API. Gooit bij een fout, zodat de aanroeper zelf
 * kiest tussen een lege lijst en de laatst gebouwde pagina laten staan.
 */
export async function supabaseLees<T>(pad: string, revalidate = 60): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pad}`, {
    headers: { apikey: SUPABASE_KEY, Accept: "application/json" },
    next: { revalidate, tags: [INHOUD_TAG] },
  });
  if (!res.ok) throw new Error(`Supabase gaf ${res.status} voor ${pad.split("?")[0]}`);
  return (await res.json()) as T[];
}
