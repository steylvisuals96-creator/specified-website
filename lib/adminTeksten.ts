import { cms } from "@/lib/adminServer";
import { GELDIGE_SLEUTELS, ontsmet } from "@/lib/tekstenBasis";

export type ConceptDoc = { id: string; sleutel: string; concept: string };

/** Alle teksten met een wijziging die nog niet live staat. Enkel voor een beheerder. */
export async function haalConcepten(token: string): Promise<ConceptDoc[] | null> {
  try {
    const res = await cms("/api/teksten?limit=1000&depth=0&where[concept][exists]=true", { token });
    if (!res.ok) return null;
    const data: { docs?: { id?: unknown; sleutel?: unknown; concept?: unknown }[] } = await res.json();
    const uit: ConceptDoc[] = [];
    for (const d of data.docs ?? []) {
      if (typeof d.id !== "string" || typeof d.sleutel !== "string" || typeof d.concept !== "string") continue;
      if (!GELDIGE_SLEUTELS.has(d.sleutel)) continue;
      const concept = ontsmet(d.concept);
      if (concept) uit.push({ id: d.id, sleutel: d.sleutel, concept });
    }
    return uit;
  } catch {
    return null;
  }
}
