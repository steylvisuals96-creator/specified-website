/**
 * Bewerkbare doorklikpagina's. De beschrijving (velden, standaardteksten) komt
 * van de website zelf (/api/pagina-schema, bron: lib/paginas.ts daar), zodat
 * het formulier hier altijd overeenkomt met wat de pagina toont.
 *
 * Opslaan: één object per pagina in pagina_inhoud. Lege velden blijven weg,
 * dan geldt de standaardtekst van de website.
 */
export type SubVeld = { sleutel: string; label: string; max: number; soort?: "tekst" | "tekstvak" };
export type VeldDef =
  | { sleutel: string; label: string; soort: "tekst" | "tekstvak"; max: number; hint?: string; standaard: string }
  | { sleutel: string; label: string; soort: "lijst"; max: number; maxItems: number; hint?: string; standaard: string[] }
  | { sleutel: string; label: string; soort: "items"; velden: SubVeld[]; maxItems: number; hint?: string; standaard: Record<string, string>[] };
export type GroepDef = { titel: string; uitleg?: string; velden: VeldDef[] };
export type PaginaDef = { sleutel: string; titel: string; pad: string | null; voorbeeld: string; uitleg?: string; groepen: GroepDef[] };

const schoon = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

/** Bouwt het opgeslagen object uit het formulier, volgens de beschrijving van de pagina. */
export function uitFormulierPagina(def: PaginaDef, fd: FormData): Record<string, unknown> {
  const uit: Record<string, unknown> = {};
  for (const v of def.groepen.flatMap((g) => g.velden)) {
    if (v.soort === "tekst" || v.soort === "tekstvak") {
      const w = schoon(fd.get(v.sleutel), v.max);
      if (w) uit[v.sleutel] = w;
    } else if (v.soort === "lijst") {
      const l = fd
        .getAll(v.sleutel)
        .map((x) => schoon(x, v.max))
        .filter(Boolean)
        .slice(0, v.maxItems);
      if (l.length) uit[v.sleutel] = l;
    } else if (v.soort === "items") {
      const rijen: Record<string, string>[] = [];
      for (let i = 0; i < v.maxItems; i++) {
        if (!fd.has(`${v.sleutel}.${i}.${v.velden[0].sleutel}`)) break;
        const rij = Object.fromEntries(v.velden.map((s) => [s.sleutel, schoon(fd.get(`${v.sleutel}.${i}.${s.sleutel}`), s.max)]));
        if (rij[v.velden[0].sleutel]) rijen.push(rij);
      }
      if (rijen.length) uit[v.sleutel] = rijen;
    }
  }
  return uit;
}

/** Meldingen per veld (leeg = in orde). Links in de FAQ: alleen een pagina van de site of https. */
export function controleerPagina(def: PaginaDef, waarde: Record<string, unknown>): Record<string, string> {
  const fouten: Record<string, string> = {};
  for (const v of def.groepen.flatMap((g) => g.velden)) {
    if (v.soort !== "items") continue;
    const rijen = (waarde[v.sleutel] as Record<string, string>[] | undefined) ?? [];
    rijen.forEach((r, i) => {
      if ("linkAdres" in r && r.linkAdres && !/^(\/(?!\/)|https:\/\/)/.test(r.linkAdres)) {
        fouten[`${v.sleutel}.${i}.linkAdres`] = "Begin met / (een pagina van de site) of met https://";
      }
    });
  }
  return fouten;
}

/** Huidige waarde van een veld voor het formulier: opgeslagen, anders leeg (de standaard staat als placeholder). */
export function huidige(waarde: Record<string, unknown>, v: VeldDef): unknown {
  return waarde[v.sleutel];
}
