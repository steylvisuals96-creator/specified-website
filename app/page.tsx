import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Split from "@/components/Split";
import Jobs from "@/components/Jobs";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PageShapes from "@/components/PageShapes";
import Marquee from "@/components/Marquee";
import { getSettings, getTeam } from "@/lib/settings";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.meta_titel || "Specified — We Engineer Possibilities",
    description:
      s.meta_beschrijving ||
      "Engineering recruitment en talent development voor de meest ambitieuze bedrijven en kandidaten in België.",
  };
}

const SECTOR_LABEL: Record<string, string> = {
  civiel: "Civiele techniek",
  elektro: "Elektrotechniek",
  werktuig: "Werktuigbouwkunde",
  bouw: "Bouw & Infra",
  industrie: "Industrie & Productie",
  energie: "Energie",
  it: "IT & Software",
  projectmanagement: "Projectmanagement",
};

const TYPE_LABEL: Record<string, string> = {
  vast: "Vast",
  interim: "Interim",
  freelance: "Freelance",
  student: "Student",
};

async function getRecentJobs() {
  try {
    const res = await fetch(
      "https://specified-cms.vercel.app/api/vacatures?where[status][equals]=actief&limit=5&sort=-createdAt",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? []).map((v: any) => ({
      title: v.titel,
      type: TYPE_LABEL[v.type] ?? v.type ?? "Vast",
      location: v.locatie ?? "België",
      sector: SECTOR_LABEL[v.sector] ?? v.sector ?? "",
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [jobs, settings, team] = await Promise.all([getRecentJobs(), getSettings(), getTeam()]);

  return (
    <>
      <PageShapes />
      <Nav />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero
          prefix={settings.hero_prefix}
          woorden={settings.hero_woorden}
          suffix={settings.hero_suffix}
          subtitle={settings.hero_subtitel}
          ctaPrimary={settings.hero_cta_tekst}
          ctaSecondary={settings.hero_cta_2_tekst}
        />
        <Marquee items={settings.sectoren?.map((s) => s.naam)} />
        <Stats items={settings.statistieken} />
        <Split settings={settings} />
        <Jobs jobs={jobs} titel={settings.jobs_titel} linkTekst={settings.jobs_link_tekst} />
        <Team members={team} titel={settings.over_titel} titelAccent={settings.over_titel_accent} />
        <CTA titel={settings.contact_titel} email={settings.contact_email} telefoon={settings.telefoon} />
      </main>
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
