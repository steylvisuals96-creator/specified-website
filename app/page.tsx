import { paginaMetadata } from "@/lib/seo-metadata";
import { SITE_URL } from "@/lib/site";
import Nav from "@/components/Nav";
import HeroTekening from "@/components/HeroTekening";
import { META } from "@/lib/inhoud";
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
  return paginaMetadata("/", {
    title: META.titel,
    alternates: { canonical: "/" },
    description: META.beschrijving,
  });
}

async function getRecentJobs() {
  const open = (await getVacatures(20)).filter((v) => !v.ingevuld).slice(0, 5);
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
  const [jobs, settings, team, website] = await Promise.all([getRecentJobs(), getSettings(), getTeam(), getWebsite()]);

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
        <Split kolommen={website.diensten} />
        <Jobs jobs={jobs} titel={website.jobs.titel} linkTekst={website.jobs.linkTekst} />
        <Team members={team} titel={settings.over_titel} titelAccent={settings.over_titel_accent} />
        <CTA titel={settings.contact_titel} email={settings.contact_email} telefoon={settings.telefoon} />
      </main>
      <ScrollMomenten />
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
