import { LEEST_UIT_SUPABASE, mediaUrl, supabaseLees } from "./beheer";
import type { Taal } from "./taal";
import type { CmsTeamlid } from "./cms-vormen";

/**
 * Waar de CMS draait. Overschrijfbaar via NEXT_PUBLIC_CMS_URL zodat een
 * preview- of lokale omgeving niet tegen productie hoeft te praten.
 */
export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "https://specified-cms.vercel.app";

export type Stat = { waarde: string; label: string };

export type SiteSettings = {
  naam?: string;
  hero_prefix?: string;
  hero_woorden?: { woord: string }[];
  hero_suffix?: string;
  hero_tagline?: string;
  hero_subtitel?: string;
  hero_cta_tekst?: string;
  hero_cta_2_tekst?: string;
  statistieken?: Stat[];
  // Diensten
  kandidaten_tag?: string;
  kandidaten_titel?: string;
  kandidaten_tekst?: string;
  kandidaten_cta?: string;
  bedrijven_tag?: string;
  bedrijven_titel?: string;
  bedrijven_tekst?: string;
  bedrijven_cta?: string;
  // Sectietitels
  jobs_titel?: string;
  jobs_link_tekst?: string;
  contact_titel?: string;
  vacatures_titel?: string;
  sectoren?: { naam: string }[];
  // Over ons / team-kop
  over_titel?: string;
  over_titel_accent?: string;
  over_tekst?: string;
  // SEO
  meta_titel?: string;
  meta_beschrijving?: string;
  // Contact / footer
  contact_email?: string;
  telefoon?: string;
  adres?: string;
  linkedin?: string;
  footer_tekst?: string;
};

export type TeamMember = {
  id: string;
  voornaam?: string;
  achternaam?: string;
  rol?: string;
  bio?: string;
  linkedin?: string;
  fotoUrl?: string;
};

const ROL_LABEL: Record<string, string> = {
  managing_partner: "Managing Partner",
  senior_consultant: "Senior Consultant",
  consultant: "Consultant",
  talent: "Talent Partner",
  office: "Office Manager",
};

export function rolLabel(value?: string): string {
  return value ? ROL_LABEL[value] ?? value : "";
}

type Contact = { email?: string; telefoon?: string; linkedin?: string; footerTekst?: string };

async function haalGlobal<T>(slug: string): Promise<Partial<T>> {
  try {
    const res = await fetch(`${CMS_URL}/api/globals/${slug}`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as Partial<T>) : {};
  } catch {
    return {};
  }
}

const gevuld = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** Alleen https-links: een javascript:-link uit de CMS mag nooit in een href belanden. */
export const veiligeLink = (v?: string): string | undefined => (v && /^https:\/\//i.test(v) ? v : undefined);

/**
 * Instellingen, met de contactgegevens uit de Homepage-editor (global
 * "website", groep "contact"). Een leeg veld daar valt terug op Instellingen,
 * waar ze vroeger stonden.
 */
export async function getSettings(taal: Taal = "nl"): Promise<SiteSettings> {
  if (LEEST_UIT_SUPABASE) {
    // Het nieuwe beheer kent geen aparte instellingen: contact en footer staan bij de homepage-teksten.
    // E-mail, telefoon en LinkedIn staan alleen in de Nederlandse rij; de footerregel is per taal.
    try {
      const sleutels = taal === "nl" ? ["homepage"] : ["homepage", `${taal}:homepage`];
      const rijen = await supabaseLees<{ sleutel: string; waarde: { contact?: Contact } }>(
        `pagina_inhoud?select=sleutel,waarde&sleutel=in.(${encodeURIComponent(sleutels.map((s) => `"${s}"`).join(","))})`,
      );
      const c: Contact = rijen.find((r) => r.sleutel === "homepage")?.waarde?.contact ?? {};
      const eigen: Contact = rijen.find((r) => r.sleutel === sleutels[sleutels.length - 1])?.waarde?.contact ?? {};
      return {
        contact_email: gevuld(c.email),
        telefoon: gevuld(c.telefoon),
        linkedin: veiligeLink(gevuld(c.linkedin)),
        footer_tekst: gevuld(eigen.footerTekst),
      };
    } catch {
      return {};
    }
  }
  const [s, website] = await Promise.all([
    haalGlobal<SiteSettings>("instellingen"),
    haalGlobal<{ contact?: Contact }>("website"),
  ]);
  const c: Contact = website.contact ?? {};
  return {
    ...s,
    contact_email: gevuld(c.email) ?? gevuld(s.contact_email),
    telefoon: gevuld(c.telefoon) ?? gevuld(s.telefoon),
    linkedin: veiligeLink(gevuld(c.linkedin) ?? gevuld(s.linkedin)),
    footer_tekst: gevuld(c.footerTekst) ?? gevuld(s.footer_tekst),
  };
}

type SupabaseTeamlid = { id: string; voornaam: string; achternaam: string; rol: string; bio: string; linkedin: string | null; foto_id: string | null };

export async function getTeam(): Promise<TeamMember[]> {
  if (LEEST_UIT_SUPABASE) {
    try {
      // RLS geeft anoniem alleen actieve teamleden.
      const rijen = await supabaseLees<SupabaseTeamlid>("team?select=id,voornaam,achternaam,rol,bio,linkedin,foto_id&order=volgorde.asc,voornaam.asc&limit=50");
      return rijen.map((m) => ({
        id: m.id,
        voornaam: m.voornaam,
        achternaam: m.achternaam,
        rol: m.rol,
        bio: m.bio,
        linkedin: veiligeLink(m.linkedin ?? undefined),
        fotoUrl: mediaUrl(m.foto_id),
      }));
    } catch {
      return [];
    }
  }
  try {
    const res = await fetch(
      `${CMS_URL}/api/team?where[actief][equals]=true&sort=volgorde&limit=50&depth=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? []).map((m: CmsTeamlid) => {
      const url = m.foto?.url as string | undefined;
      const fotoUrl = url ? (url.startsWith("http") ? url : `${CMS_URL}${url}`) : undefined;
      return {
        id: m.id,
        voornaam: m.voornaam,
        achternaam: m.achternaam,
        rol: m.rol,
        bio: m.bio,
        linkedin: m.linkedin,
        fotoUrl,
      };
    });
  } catch {
    return [];
  }
}
