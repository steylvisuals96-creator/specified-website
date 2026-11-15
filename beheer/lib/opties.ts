/** Keuzelijsten van het beheer. Zelfde waarden als de checks in de database. */
export type Optie = { waarde: string; label: string };

export const VAKGEBIEDEN: Optie[] = [
  { waarde: "civiel", label: "Civiele techniek" },
  { waarde: "elektro", label: "Elektrotechniek" },
  { waarde: "automatisering", label: "Automatisering" },
  { waarde: "werktuig", label: "Werktuigbouwkunde" },
  { waarde: "it", label: "IT en software" },
  { waarde: "bouw", label: "Bouw en infrastructuur" },
  { waarde: "energie", label: "Energie" },
  { waarde: "industrie", label: "Industrie en productie" },
  { waarde: "projectmanagement", label: "Projectmanagement" },
];

export const CONTRACTEN: Optie[] = [
  { waarde: "vast", label: "Vast contract" },
  { waarde: "freelance", label: "Freelance" },
  { waarde: "interim", label: "Interim" },
  { waarde: "student", label: "Studentenjob" },
];

export const STATUSSEN: Optie[] = [
  { waarde: "actief", label: "Actief" },
  { waarde: "on_hold", label: "On hold" },
  { waarde: "ingevuld", label: "Ingevuld" },
  { waarde: "geannuleerd", label: "Geannuleerd" },
];

export const ERVARING: Optie[] = [
  { waarde: "junior", label: "Junior (0 tot 2 jaar)" },
  { waarde: "medior", label: "Medior (2 tot 5 jaar)" },
  { waarde: "senior", label: "Senior (5+ jaar)" },
  { waarde: "lead", label: "Lead of expert" },
];

export const UREN: Optie[] = [
  { waarde: "voltijds", label: "Voltijds" },
  { waarde: "deeltijds", label: "Deeltijds" },
  { waarde: "beide", label: "Voltijds of deeltijds" },
];

export const OPLEIDING: Optie[] = [
  { waarde: "secundair", label: "Secundair onderwijs" },
  { waarde: "graduaat", label: "Graduaat" },
  { waarde: "bachelor", label: "Bachelor" },
  { waarde: "master", label: "Master" },
  { waarde: "geen", label: "Geen diplomavereiste" },
];

export const TALEN: Optie[] = [
  { waarde: "nl", label: "Nederlands" },
  { waarde: "en", label: "Engels" },
  { waarde: "fr", label: "Frans" },
  { waarde: "de", label: "Duits" },
];

export const ROLLEN: Optie[] = [
  { waarde: "beheerder", label: "Beheerder" },
  { waarde: "redacteur", label: "Redacteur" },
];

export const labelVan = (lijst: Optie[], waarde: string | null | undefined) =>
  lijst.find((o) => o.waarde === waarde)?.label ?? "";

export const toegestaan = (lijst: Optie[], waarde: string) => lijst.some((o) => o.waarde === waarde);
