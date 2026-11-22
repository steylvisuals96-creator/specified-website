import "server-only";
import { WEBSITE_URL } from "./website";
import type { PaginaDef } from "./paginas";
import type { Taal } from "./taal";

/**
 * De beschrijving van de bewerkbare pagina's, van de website. Vijf minuten
 * bewaard; is de website onbereikbaar, dan een lege lijst (de pagina's tonen
 * dan een melding in plaats van een kapot formulier).
 */
export async function paginaSchema(taal: Taal = "nl"): Promise<PaginaDef[]> {
  try {
    const res = await fetch(`${WEBSITE_URL}/api/pagina-schema`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const json = (await res.json()) as { paginas?: PaginaDef[]; talen?: Partial<Record<Taal, PaginaDef[]>> };
    // Een website van vóór de Engelse versie kent alleen `paginas` (Nederlands).
    const lijst = taal === "nl" ? json.paginas : json.talen?.[taal];
    return Array.isArray(lijst) ? lijst : [];
  } catch {
    return [];
  }
}

export async function paginaVanSchema(sleutel: string, taal: Taal = "nl"): Promise<PaginaDef | null> {
  return (await paginaSchema(taal)).find((p) => p.sleutel === sleutel) ?? null;
}
