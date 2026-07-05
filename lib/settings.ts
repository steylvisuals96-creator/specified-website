export const CMS_URL = "https://specified-cms.vercel.app";

export type Stat = { waarde: string; label: string };

export type SiteSettings = {
  hero_tagline?: string;
  hero_titel?: string;
  hero_titel_accent?: string;
  hero_subtitel?: string;
  hero_cta_tekst?: string;
  hero_cta_2_tekst?: string;
  statistieken?: Stat[];
  over_titel?: string;
  over_titel_accent?: string;
  over_tekst?: string;
  meta_titel?: string;
  meta_beschrijving?: string;
  contact_email?: string;
  telefoon?: string;
  adres?: string;
  linkedin?: string;
};

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
