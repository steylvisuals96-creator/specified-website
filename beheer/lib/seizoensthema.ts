export const THEMAS = [
  { id: "standaard", naam: "Standaard", uitleg: "De gewone website." },
  { id: "kerst", naam: "Kerst", uitleg: "Lichtjes, zachte sneeuwval en een sneeuwvlok boven het logo." },
  { id: "winter", naam: "Winter", uitleg: "Rijp op het tekenblad en vlokjes rond het ijskristal." },
  { id: "lente", naam: "Lente", uitleg: "Nieuwe scheuten ontvouwen hun blaadjes." },
  { id: "zomer", naam: "Zomer", uitleg: "Een lage zon verschijnt aan de rand van het tekenblad." },
  { id: "herfst", naam: "Herfst", uitleg: "Herfstbladeren dwarrelen langs de randen." },
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
