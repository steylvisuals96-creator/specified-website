import "server-only";
import { supabaseServer } from "./supabase/server";
import type { Document } from "./richtekst";

export type Vacature = {
  id: string;
  slug: string;
  titel: string;
  vakgebied: string;
  contract: string;
  status: string;
  locatie: string;
  ervaring: string | null;
  uren: string | null;
  opleiding: string | null;
  talen: string[];
  beschrijving: Document | null;
  vereisten: string[];
  nice_to_have: string[];
  aanbod: string[];
  geplaatst_op: string | null;
  zichtbaar: boolean;
  gewijzigd: string;
};

export type Artikel = {
  id: string;
  slug: string;
  titel: string;
  status: "concept" | "gepubliceerd";
  publicatiedatum: string;
  auteur_id: string | null;
  cover_id: string | null;
  cover_url: string | null;
  samenvatting: string;
  inhoud: Document | null;
  meta_titel: string;
  meta_beschrijving: string;
  gewijzigd: string;
};

export type Teamlid = {
  id: string;
  voornaam: string;
  achternaam: string;
  rol: string;
  bio: string;
  foto_id: string | null;
  email: string | null;
  linkedin: string | null;
  volgorde: number;
  actief: boolean;
  gewijzigd: string;
};

export type Media = {
  id: string;
  sleutel: string;
  bestandsnaam: string;
  mime: string;
  grootte: number;
  breedte: number | null;
  hoogte: number | null;
  alt: string;
  aangemaakt: string;
};

export async function vacatures(): Promise<Vacature[]> {
  const sb = await supabaseServer();
  const { data } = await sb.from("vacatures").select("*").order("aangemaakt", { ascending: false });
  return (data ?? []) as Vacature[];
}

export async function vacature(id: string): Promise<(Vacature & { salaris: string }) | null> {
  const sb = await supabaseServer();
  const [{ data: v }, { data: intern }] = await Promise.all([
    sb.from("vacatures").select("*").eq("id", id).maybeSingle(),
    sb.from("vacatures_intern").select("salaris").eq("vacature_id", id).maybeSingle(),
  ]);
  return v ? { ...(v as Vacature), salaris: intern?.salaris ?? "" } : null;
}

export async function artikels(): Promise<Artikel[]> {
  const sb = await supabaseServer();
  const { data } = await sb.from("blog").select("*").order("publicatiedatum", { ascending: false });
  return (data ?? []) as Artikel[];
}

export async function artikel(id: string): Promise<Artikel | null> {
  const sb = await supabaseServer();
  const { data } = await sb.from("blog").select("*").eq("id", id).maybeSingle();
  return (data as Artikel) ?? null;
}

export async function team(): Promise<Teamlid[]> {
  const sb = await supabaseServer();
  const { data } = await sb.from("team").select("*").order("volgorde").order("voornaam");
  return (data ?? []) as Teamlid[];
}

export async function teamlid(id: string): Promise<Teamlid | null> {
  const sb = await supabaseServer();
  const { data } = await sb.from("team").select("*").eq("id", id).maybeSingle();
  return (data as Teamlid) ?? null;
}

export async function media(): Promise<Media[]> {
  const sb = await supabaseServer();
  const { data } = await sb.from("media").select("*").order("aangemaakt", { ascending: false }).limit(500);
  return (data ?? []) as Media[];
}

export async function homepage(): Promise<{ waarde: Record<string, unknown>; gewijzigd: string }> {
  const sb = await supabaseServer();
  const { data } = await sb.from("pagina_inhoud").select("waarde, gewijzigd").eq("sleutel", "homepage").maybeSingle();
  return { waarde: (data?.waarde as Record<string, unknown>) ?? {}, gewijzigd: data?.gewijzigd ?? "" };
}

export const opDeSite = (v: Vacature) => v.zichtbaar && (v.status === "actief" || v.status === "ingevuld");

/** Wat de website toont als het ontbreekt: helpt de redactie de vacature af te werken. */
export function ontbreekt(v: Vacature): string[] {
  const uit: string[] = [];
  if (!v.beschrijving) uit.push("omschrijving");
  if (!v.uren) uit.push("uren");
  if (!v.opleiding) uit.push("opleiding");
  if (!v.talen.length) uit.push("talen");
  if (!v.vereisten.length) uit.push("profiel");
  return uit;
}

/** "3 dagen geleden", "vandaag om 14:02". */
export function wanneer(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const dagen = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dagen <= 0) return `vandaag om ${d.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}`;
  if (dagen === 1) return "gisteren";
  if (dagen < 14) return `${dagen} dagen geleden`;
  return d.toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" });
}
