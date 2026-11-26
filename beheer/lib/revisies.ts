export const STATUS = { open: "Open", bezig: "In uitvoering", nakijken: "Klaar om na te kijken", afgerond: "Afgerond" } as const;
export const PRIORITEIT = { laag: "Laag", normaal: "Normaal", hoog: "Hoog" } as const;
export const APPARAAT = { alle: "Alle toestellen", desktop: "Desktop", tablet: "Tablet", mobiel: "Mobiel" } as const;
export const isKeuze = <T extends object>(lijst: T, waarde: string): waarde is Extract<keyof T, string> => Object.hasOwn(lijst, waarde);

/** Alleen een pad op de eigen website. Geen externe links of protocollen. */
export function revisiePad(invoer: string): string | null {
  if (invoer.length > 600 || !invoer.startsWith("/") || invoer.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(invoer)) return null;
  try {
    const url = new URL(invoer, "https://specified.be");
    if (url.origin !== "https://specified.be") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}

export function revisieInvoer(fd: FormData) {
  const lees = (sleutel: string) => typeof fd.get(sleutel) === "string" ? (fd.get(sleutel) as string).trim() : "";
  const titel = lees("titel");
  const beschrijving = lees("beschrijving");
  const pagina = revisiePad(lees("pagina"));
  const prioriteit = lees("prioriteit");
  const apparaat = lees("apparaat");
  const velden: Record<string, string> = {};
  if (!titel || titel.length > 160) velden.titel = "Vul een titel van maximaal 160 tekens in.";
  if (!beschrijving || beschrijving.length > 6000) velden.beschrijving = "Beschrijf de correctie in maximaal 6.000 tekens.";
  if (!pagina) velden.pagina = "Gebruik een paginapad zoals /voor-bedrijven of /en/for-companies, eventueel met #sectie.";
  if (!isKeuze(PRIORITEIT, prioriteit)) velden.prioriteit = "Kies een prioriteit.";
  if (!isKeuze(APPARAAT, apparaat)) velden.apparaat = "Kies een toestel.";
  return { rij: { titel, beschrijving, pagina: pagina ?? "/", prioriteit, apparaat }, velden };
}

export const revisieDatum = (datum: string) => new Date(datum).toLocaleString("nl-BE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Brussels" });
