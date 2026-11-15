export const THEMAS = [
  { id: "standaard", naam: "Standaard", uitleg: "De vaste huisstijl met olijf en limoen." },
  { id: "kerst", naam: "Kerst", uitleg: "Dennengroen met een champagnekleurige ster." },
  { id: "winter", naam: "Winter", uitleg: "IJsblauw met een getekend ijskristal." },
  { id: "lente", naam: "Lente", uitleg: "Fris bladgroen met een jonge scheut." },
  { id: "zomer", naam: "Zomer", uitleg: "Zonnig goud met een zon op de tekening." },
  { id: "herfst", naam: "Herfst", uitleg: "Warm koper met een herfstblad." },
] as const;

export type Seizoen = (typeof THEMAS)[number]["id"];
export type Instelling = { thema: Seizoen; vanaf: string | null; tot_en_met: string | null };

export const themaOptie = (id: unknown) => THEMAS.find((optie) => optie.id === id);

export const belgischeDatum = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Brussels" });

export function geldigeDatum(v: string) {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(v)) return false;
  const datum = new Date(v + "T00:00:00Z");
  return !Number.isNaN(datum.getTime()) && datum.toISOString().slice(0, 10) === v;
}
