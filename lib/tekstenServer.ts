import { CMS_URL } from "@/lib/settings";
import { GELDIGE_SLEUTELS, MAX_TEKST } from "@/lib/tekstenBasis";

export const TEKSTEN_TAG = "teksten";

/**
 * De live-teksten uit het CRM: enkel wat iemand gewijzigd en gepubliceerd heeft,
 * enkel voor sleutels die we kennen. Faalt het ophalen (CRM onbereikbaar, tabel nog
 * niet aangemaakt), dan is het resultaat leeg en toont de site haar standaardtekst.
 *
 * Gecachet met een tag: bij publiceren wordt die tag ongeldig gemaakt, zodat de
 * wijziging meteen zichtbaar is in plaats van pas na de verversingstijd.
 */
export async function haalTeksten(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${CMS_URL}/api/teksten?limit=1000&depth=0&where[waarde][exists]=true`, {
      next: { revalidate: 60, tags: [TEKSTEN_TAG] },
    });
    if (!res.ok) return {};
    const data: { docs?: { sleutel?: unknown; waarde?: unknown }[] } = await res.json();
    const uit: Record<string, string> = {};
    for (const d of data.docs ?? []) {
      if (typeof d.sleutel !== "string" || typeof d.waarde !== "string") continue;
      if (!GELDIGE_SLEUTELS.has(d.sleutel) || !d.waarde.trim()) continue;
      uit[d.sleutel] = d.waarde.slice(0, MAX_TEKST);
    }
    return uit;
  } catch {
    return {};
  }
}
