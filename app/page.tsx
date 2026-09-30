import { SITE_URL } from "@/lib/site";
import Nav from "@/components/Nav";
import HeroTekening from "@/components/HeroTekening";
import { CONSULTANTS, DIENSTEN, JOBS, META } from "@/lib/inhoud";
import Split from "@/components/Split";
import Jobs from "@/components/Jobs";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Disciplines from "@/components/Disciplines";
import ScrollMomenten from "@/components/ScrollMomenten";
import { getSettings, getTeam, CMS_URL } from "@/lib/settings";
import { haalTeksten } from "@/lib/tekstenServer";
import { kies } from "@/lib/tekstenBasis";

const DAG = 24 * 60 * 60 * 1000;
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  // Positionering uit lib/inhoud.ts; de CMS-metavelden bevatten nog voorbeeldtekst.
  // Aanpasbaar via het admin-balkje (Alle teksten > Zoekmachines).
  const teksten = await haalTeksten();
  return {
    title: kies(teksten, "meta.titel", META.titel),
    description: kies(teksten, "meta.beschrijving", META.beschrijving),
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

const ERVARING_LABEL: Record<string, string> = {
  junior: "Junior (0–2 jaar)",
  medior: "Medior (2–5 jaar)",
  senior: "Senior (5+ jaar)",
  lead: "Lead / Expert",
};

async function getRecentJobs() {
  try {
    const res = await fetch(
      `${CMS_URL}/api/vacatures?where[status][equals]=actief&limit=5&sort=-createdAt`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? [])
      .filter((v: any) => v.zichtbaar_op_website !== false)
      .map((v: any) => ({
        title: v.titel,
        type: TYPE_LABEL[v.type] ?? v.type ?? "",
        location: v.locatie ?? "België",
        sector: SECTOR_LABEL[v.sector] ?? v.sector ?? "",
        ervaring: v.ervaringsniveau ? ERVARING_LABEL[v.ervaringsniveau] ?? v.ervaringsniveau : "",
        dagen: v.createdAt ? Math.floor((Date.now() - new Date(v.createdAt).getTime()) / DAG) : undefined,
      }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [jobs, settings, team] = await Promise.all([getRecentJobs(), getSettings(), getTeam()]);

  // Organisatiegegevens voor zoekmachines (JSON-LD); < geëscaped zoals in de blog.
  const organisatie = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    description: META.beschrijving,
    name: "Specified",
    url: SITE_URL,
    logo: `${SITE_URL}/images/team/logo_specified.svg`,
    email: settings.contact_email || "info@specified.be",
    ...(settings.telefoon ? { telephone: settings.telefoon } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Kontich", addressCountry: "BE" },
    areaServed: "BE",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisatie).replace(/</g, "\\u003c") }}
      />
      <Nav />
      <main>
        <HeroTekening />
        <Disciplines items={CONSULTANTS.profielen} />
        <Split kolommen={DIENSTEN} />
        <Jobs jobs={jobs} titel={JOBS.titel} linkTekst={JOBS.linkTekst} />
        <Team members={team} titel={settings.over_titel} titelAccent={settings.over_titel_accent} />
        <CTA titel={settings.contact_titel} email={settings.contact_email} telefoon={settings.telefoon} />
      </main>
      <ScrollMomenten />
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
