/**
 * Vormen van wat de oude CMS (Payload) en het live voorbeeld aanleveren. Het zijn
 * gegevens van buiten: niets hiervan is gegarandeerd, de lezers controleren zelf.
 */
export type LexicalNode = {
  type?: string;
  text?: string;
  format?: number;
  tag?: string;
  listType?: string;
  url?: string;
  fields?: { url?: string };
  children?: LexicalNode[];
};

export type LexicalDocument = { root?: { children?: LexicalNode[] } };

export type CmsArtikel = {
  id: string;
  titel: string;
  slug: string;
  samenvatting?: string;
  publicatiedatum?: string;
  cover?: { url?: string } | null;
  cover_url?: string;
  auteur?: { voornaam?: string; achternaam?: string; naam?: string } | string | number | null;
  inhoud?: unknown;
  meta_titel?: string;
  meta_beschrijving?: string;
};

export type CmsTeamlid = {
  id: string;
  voornaam: string;
  achternaam: string;
  rol: string;
  bio: string;
  linkedin?: string;
  foto?: { url?: string } | null;
};

export type CmsVacature = {
  id: string | number;
  titel?: unknown;
  slug?: unknown;
  sector?: unknown;
  locatie?: unknown;
  uren?: unknown;
  type?: unknown;
  ervaringsniveau?: unknown;
  opleidingsniveau?: unknown;
  talen?: unknown;
  gepubliceerd_op?: string;
  createdAt?: string;
  status?: unknown;
  beschrijving?: unknown;
  vereisten?: unknown;
  nice_to_have?: unknown;
  aanbod?: unknown;
  zichtbaar_op_website?: boolean;
};

type Velden = Record<string, unknown>;

export type CmsWebsite = {
  hero?: Velden;
  tekening?: Velden;
  callouts?: Velden[];
  consultants?: Velden & { profielen?: Velden[] };
  diensten_bedrijven?: Velden;
  diensten_engineers?: Velden;
  jobs?: Velden;
  contact?: Velden;
};
