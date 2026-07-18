export const CMS_URL = "https://specified-cms.vercel.app";

export type Stat = { waarde: string; label: string };

export type SiteSettings = {
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
  senior_consultant: "Senior Recruitment Consultant",
  consultant: "Recruitment Consultant",
  talent: "Talent Acquisition Specialist",
  office: "Office Manager",
};

export function rolLabel(value?: string): string {
  return value ? ROL_LABEL[value] ?? value : "";
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${CMS_URL}/api/globals/instellingen`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    return (await res.json()) as SiteSettings;
  } catch {
    return {};
  }
}

export async function getTeam(): Promise<TeamMember[]> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/team?where[actief][equals]=true&sort=volgorde&limit=50&depth=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? []).map((m: any) => {
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
