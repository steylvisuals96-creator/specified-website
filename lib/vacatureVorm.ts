/**
 * Het vacatureformulier van het dashboard: opties, en de vertaling tussen wat
 * de redactie intypt (gewone tekst, één punt per regel) en wat Payload bewaart
 * (rich text en lijsten). De opties volgen collections/Vacatures.ts.
 */
export const VAKGEBIED_OPTIES = [
  { label: "Civiele techniek", value: "civiel" },
  { label: "Elektrotechniek", value: "elektro" },
  { label: "Automatisering", value: "automatisering" },
  { label: "Werktuigbouwkunde", value: "werktuig" },
  { label: "IT & Software", value: "it" },
  { label: "Bouw & Infrastructuur", value: "bouw" },
  { label: "Energie & Utilities", value: "energie" },
  { label: "Industrie & Productie", value: "industrie" },
  { label: "Projectmanagement", value: "projectmanagement" },
];

export const CONTRACT_OPTIES = [
  { label: "Vast contract", value: "vast" },
  { label: "Freelance / Zelfstandige", value: "freelance" },
  { label: "Interim", value: "interim" },
  { label: "Studentenjob", value: "student" },
];

export const STATUS_OPTIES = [
  { label: "Actief (open op de website)", value: "actief" },
  { label: "Ingevuld (op de website als ingevuld)", value: "ingevuld" },
  { label: "On hold (niet op de website)", value: "on_hold" },
  { label: "Geannuleerd (niet op de website)", value: "geannuleerd" },
];

export const NIVEAU_OPTIES = [
  { label: "Junior (0–2 jaar)", value: "junior" },
  { label: "Medior (2–5 jaar)", value: "medior" },
  { label: "Senior (5+ jaar)", value: "senior" },
  { label: "Lead / Expert", value: "lead" },
];

export const UREN_OPTIES = [
  { label: "Voltijds", value: "voltijds" },
  { label: "Deeltijds", value: "deeltijds" },
  { label: "Voltijds of deeltijds", value: "beide" },
];

export const OPLEIDING_OPTIES = [
  { label: "Secundair onderwijs", value: "secundair" },
  { label: "Graduaat", value: "graduaat" },
  { label: "Bachelor", value: "bachelor" },
  { label: "Master", value: "master" },
  { label: "Geen diplomavereiste", value: "geen" },
];

export const TAAL_OPTIES = [
  { label: "Nederlands", value: "nl" },
  { label: "Engels", value: "en" },
  { label: "Frans", value: "fr" },
  { label: "Duits", value: "de" },
];

export type VacatureVorm = {
  titel: string;
  sector: string;
  type: string;
  status: string;
  locatie: string;
  ervaringsniveau: string;
  uren: string;
  opleidingsniveau: string;
  talen: string[];
  gepubliceerd_op: string;
  zichtbaar_op_website: boolean;
  salaris: string;
  beschrijving: string;
  vereisten: string;
  nice_to_have: string;
  aanbod: string;
};

export const LEGE_VACATURE: VacatureVorm = {
  titel: "", sector: "", type: "vast", status: "actief", locatie: "", ervaringsniveau: "",
  uren: "", opleidingsniveau: "", talen: [], gepubliceerd_op: "", zichtbaar_op_website: true,
  salaris: "", beschrijving: "", vereisten: "", nice_to_have: "", aanbod: "",
};

function nodeTekst(node: any): string {
  if (typeof node?.text === "string") return node.text;
  if (Array.isArray(node?.children)) return node.children.map(nodeTekst).join("");
  return "";
}

const regels = (lijst: any): string =>
  Array.isArray(lijst) ? lijst.map((r: any) => r?.punt ?? "").filter(Boolean).join("\n") : "";

/** Een vacature uit Payload als formulierwaarden. */
export function naarVorm(doc: any): VacatureVorm {
  const d = doc ?? {};
  return {
    titel: d.titel ?? "",
    sector: d.sector ?? "",
    type: d.type ?? "vast",
    status: d.status ?? "actief",
    locatie: d.locatie ?? "",
    ervaringsniveau: d.ervaringsniveau ?? "",
    uren: d.uren ?? "",
    opleidingsniveau: d.opleidingsniveau ?? "",
    talen: Array.isArray(d.talen) ? d.talen : [],
    gepubliceerd_op: typeof d.gepubliceerd_op === "string" ? d.gepubliceerd_op.slice(0, 10) : "",
    zichtbaar_op_website: d.zichtbaar_op_website !== false,
    salaris: d.salaris ?? "",
    beschrijving: Array.isArray(d.beschrijving?.root?.children)
      ? d.beschrijving.root.children.map(nodeTekst).map((t: string) => t.trim()).filter(Boolean).join("\n\n")
      : "",
    vereisten: regels(d.vereisten),
    nice_to_have: regels(d.nice_to_have),
    aanbod: regels(d.aanbod),
  };
}

const punten = (tekst: string) =>
  tekst.split("\n").map((r) => r.replace(/^\s*[-*•]\s*/, "").trim()).filter(Boolean).map((punt) => ({ punt }));

function richText(tekst: string) {
  const alineas = tekst.split(/\n\s*\n/).map((a) => a.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
  return {
    root: {
      type: "root", version: 1, direction: "ltr", format: "", indent: 0,
      children: (alineas.length ? alineas : [""]).map((text) => ({
        type: "paragraph", version: 1, direction: "ltr", format: "", indent: 0,
        children: [{ type: "text", version: 1, detail: 0, format: 0, mode: "normal", style: "", text }],
      })),
    },
  };
}

/** Formulierwaarden als gegevens voor Payload. Lege keuzes worden null. */
export function naarPayload(v: VacatureVorm): Record<string, unknown> {
  const keuze = (w: string) => (w ? w : null);
  return {
    titel: v.titel.trim(),
    sector: v.sector,
    type: v.type,
    status: v.status,
    locatie: v.locatie.trim(),
    ervaringsniveau: keuze(v.ervaringsniveau),
    uren: keuze(v.uren),
    opleidingsniveau: keuze(v.opleidingsniveau),
    talen: v.talen,
    // Geen datum ingevuld en de vacature gaat open: vandaag.
    gepubliceerd_op: v.gepubliceerd_op || (v.status === "actief" ? new Date().toISOString().slice(0, 10) : null),
    zichtbaar_op_website: v.zichtbaar_op_website,
    salaris: v.salaris.trim(),
    beschrijving: richText(v.beschrijving),
    vereisten: punten(v.vereisten),
    nice_to_have: punten(v.nice_to_have),
    aanbod: punten(v.aanbod),
  };
}
