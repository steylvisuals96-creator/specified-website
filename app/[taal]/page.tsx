import { paginaMetadata } from "@/lib/seo-metadata";
import { SITE_URL } from "@/lib/site";
import Nav from "@/components/Nav";
import HeroTekening from "@/components/HeroTekening";
import { inhoud } from "@/lib/inhoud-taal";
import { huidigeTaal } from "@/lib/taal-server";
import { taalAlternates, type Taal } from "@/lib/taal";
import { getWebsite } from "@/lib/website";
import Split from "@/components/Split";
import Jobs from "@/components/Jobs";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Disciplines from "@/components/Disciplines";
import ScrollMomenten from "@/components/ScrollMomenten";
import { getSettings, getTeam } from "@/lib/settings";
import { getVacatures, dagenOnline } from "@/lib/vacatures";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const taal = await huidigeTaal();
  const { META } = inhoud(taal);
  return paginaMetadata(taal === "en" ? "/en" : "/", {
    title: META.titel,
    alternates: taalAlternates(taal, "/"),
    description: META.beschrijving,
  });
}

async function getRecentJobs(taal: Taal) {
  const open = (await getVacatures(20, taal)).filter((v) => !v.ingevuld).slice(0, 5);
  return open.map((v) => ({
    slug: v.slug,
    title: v.titel,
    type: v.uren,
    location: v.locatie,
    sector: v.vakgebied,
    ervaring: v.ervaring,
    dagen: dagenOnline(v),
  }));
}

export default async function Home() {
  const taal = await huidigeTaal();
  const { META } = inhoud(taal);
  const [jobs, settings, team, website] = await Promise.all([getRecentJobs(taal), getSettings(taal), getTeam(), getWebsite(taal)]);

  // Organisatiegegevens voor zoekmachines (JSON-LD); < geëscaped zoals in de blog.
  const organisatie = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    description: META.beschrijving,
    name: "Specified",
    url: taal === "en" ? `${SITE_URL}/en` : SITE_URL,
    logo: `${SITE_URL}/images/team/logo_specified.svg`,
    email: settings.contact_email || "info@specified.be",
    ...(settings.telefoon ? { telephone: settings.telefoon } : {}),
    legalName: "Specified NV",
    vatID: "BE0727537711",
    foundingDate: "2025-01",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Veldkant 31a",
      postalCode: "2550",
      addressLocality: "Kontich",
      addressCountry: "BE",
    },
    areaServed: "BE",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisatie).replace(/</g, "\\u003c") }}
      />
      <Nav />
      <main id="inhoud">
        <HeroTekening inhoud={website} />
        <Disciplines inhoud={website.consultants} />
        <Split kolommen={website.diensten} taal={taal} />
        <Jobs jobs={jobs} titel={website.jobs.titel} linkTekst={website.jobs.linkTekst} leeg={website.jobs.leeg} openKnop={website.jobs.openKnop} taal={taal} />
        <Team members={team} titel={settings.over_titel || website.team.titel} titelAccent={settings.over_titel_accent || website.team.accent} taal={taal} />
        <CTA titel={settings.contact_titel || website.cta.titel} email={settings.contact_email} telefoon={settings.telefoon} />
      </main>
      <ScrollMomenten />
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
