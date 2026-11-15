export const SEIZOENEN = ["standaard", "kerst", "winter", "lente", "zomer", "herfst"] as const;
export type Seizoen = (typeof SEIZOENEN)[number];

export function isSeizoen(waarde: unknown): waarde is Seizoen {
  return SEIZOENEN.some((seizoen) => seizoen === waarde);
}

const belgischeDatum = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Brussels" });

export function seizoenOp(
  instelling: { thema: unknown; vanaf: string | null; tot_en_met: string | null } | undefined,
  tijdstip = new Date(),
): Seizoen {
  if (!instelling || !isSeizoen(instelling.thema)) return "standaard";
  const vandaag = belgischeDatum.format(tijdstip);
  if ((instelling.vanaf && vandaag < instelling.vanaf) || (instelling.tot_en_met && vandaag > instelling.tot_en_met)) return "standaard";
  return instelling.thema;
}
