/**
 * Leesbare labels en statuskleuren voor de back-office. De waarden volgen de
 * opties in collections/*.ts; wijzig je daar een optie, pas ze hier ook aan.
 */

export const SOLLICITATIE_FASEN = [
  { value: "nieuw", label: "Nieuw", kleur: "var(--st-nieuw)" },
  { value: "screening", label: "In screening", kleur: "var(--st-bezig)" },
  { value: "tel_gescreend", label: "Telefonisch gescreend", kleur: "var(--st-bezig)" },
  { value: "voorgesteld", label: "Voorgesteld aan klant", kleur: "var(--st-klant)" },
  { value: "interview_gepland", label: "Interview gepland", kleur: "var(--st-gesprek)" },
  { value: "interview_afgerond", label: "Interview afgerond", kleur: "var(--st-gesprek)" },
  { value: "aanbod", label: "Aanbod uitgebracht", kleur: "var(--st-klant)" },
  { value: "geplaatst", label: "Geplaatst", kleur: "var(--st-geplaatst)" },
] as const;

export const KANDIDAAT_STATUS: Record<string, { label: string; kleur: string }> = {
  nieuw: { label: "Nieuw", kleur: "var(--st-nieuw)" },
  gescreend: { label: "Gescreend", kleur: "var(--st-bezig)" },
  in_gesprek: { label: "In gesprek", kleur: "var(--st-gesprek)" },
  voorgesteld: { label: "Voorgesteld aan klant", kleur: "var(--st-klant)" },
  interview_klant: { label: "Interview bij klant", kleur: "var(--st-gesprek)" },
  geplaatst: { label: "Geplaatst", kleur: "var(--st-geplaatst)" },
  afgewezen: { label: "Niet weerhouden", kleur: "var(--st-uit)" },
  on_hold: { label: "On hold", kleur: "var(--st-wacht)" },
};

/** Volgorde van de voortgangslijn op de kandidaatpagina. */
export const KANDIDAAT_STAPPEN = ["nieuw", "gescreend", "in_gesprek", "voorgesteld", "interview_klant", "geplaatst"] as const;

export const SECTOR_LABEL: Record<string, string> = {
  civiel: "Civiele techniek",
  elektro: "Elektrotechniek",
  werktuig: "Werktuigbouwkunde",
  it: "IT & Software",
  bouw: "Bouw & Infra",
  energie: "Energie & Utilities",
  industrie: "Industrie & Productie",
  projectmanagement: "Projectmanagement",
};

export const NIVEAU_LABEL: Record<string, string> = {
  junior: "Junior",
  medior: "Medior",
  senior: "Senior",
  lead: "Lead / Expert",
};

export const BESCHIKBAARHEID_LABEL: Record<string, string> = {
  onmiddellijk: "Direct",
  "1_maand": "1 maand opzeg",
  "3_maanden": "3 maanden opzeg",
  passief: "Passief zoekend",
};

export const BRON_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  website: "Website",
  aanbeveling: "Aanbeveling",
  netwerk: "Netwerk",
  jobboard: "Jobboard",
  spontaan: "Spontane sollicitatie",
};

type MetNaam = { naam?: string | null; voornaam?: string | null; achternaam?: string | null };

export function naamVan(k: MetNaam | null | undefined) {
  if (!k) return "Onbekend";
  return k.naam || [k.voornaam, k.achternaam].filter(Boolean).join(" ") || "Onbekend";
}

export function initialen(k: MetNaam | null | undefined) {
  return naamVan(k)
    .split(/\s+/)
    .filter((w) => /^[A-Za-zÀ-ÿ]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const VACATURE_TYPE: Record<string, string> = {
  vast: "Vast contract",
  freelance: "Freelance",
  interim: "Interim",
  student: "Studentenjob",
};
