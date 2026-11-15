import "server-only";
import { WEBSITE_URL } from "./website";
import type { PaginaDef } from "./paginas";

/**
 * De beschrijving van de bewerkbare pagina's, van de website. Vijf minuten
 * bewaard; is de website onbereikbaar, dan een lege lijst (de pagina's tonen
 * dan een melding in plaats van een kapot formulier).
 */
export async function paginaSchema(): Promise<PaginaDef[]> {
  try {
    const res = await fetch(`${WEBSITE_URL}/api/pagina-schema`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const json = (await res.json()) as { paginas?: PaginaDef[] };
    return Array.isArray(json.paginas) ? json.paginas : [];
  } catch {
    return [];
  }
}

export async function paginaVanSchema(sleutel: string): Promise<PaginaDef | null> {
  return (await paginaSchema()).find((p) => p.sleutel === sleutel) ?? null;
}
