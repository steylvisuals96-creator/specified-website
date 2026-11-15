/** Kleine hulpjes om FormData veilig uit te lezen in server actions. */

export type Resultaat = {
  ok: boolean;
  melding?: string;
  /** Foutmelding per veldnaam. */
  velden?: Record<string, string>;
  /** Moment van opslaan (ISO), voor "Opgeslagen om 14:02". */
  opgeslagen?: string;
  id?: string;
};

export const LEEG: Resultaat = { ok: false };

export function tekst(fd: FormData, naam: string, max = 500): string {
  const v = fd.get(naam);
  return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
}

export function lijst(fd: FormData, naam: string, maxItems = 30, maxLengte = 200): string[] {
  return fd
    .getAll(naam)
    .map((v) => (typeof v === "string" ? v.trim().slice(0, maxLengte) : ""))
    .filter(Boolean)
    .slice(0, maxItems);
}

export const vinkje = (fd: FormData, naam: string) => fd.get(naam) === "on" || fd.get(naam) === "true";

export function datum(fd: FormData, naam: string): string | null {
  const v = tekst(fd, naam, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) ? v : null;
}

export const uuidOfNull = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? v : null;

export function slugify(tekstIn: string, max = 70): string {
  return tekstIn
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

/** Vertaalt databasefouten naar iets wat de redactie begrijpt, zonder interne details. */
export function dbFout(fout: { code?: string; message?: string } | null): string {
  if (!fout) return "Er ging iets mis bij het opslaan.";
  if (fout.code === "23505") return "Dat adres is al in gebruik. Kies een ander.";
  if (fout.code === "23514") return "Een van de velden heeft een ongeldige waarde.";
  if (fout.code === "42501" || fout.code === "PGRST301") return "Je hebt geen rechten om dit te wijzigen.";
  return "Er ging iets mis bij het opslaan. Probeer het opnieuw.";
}
