import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import VacatureWeergave from "@/components/paginas/VacatureWeergave";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { getVacature, getVacatures, type Vacature } from "@/lib/vacatures";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getVacatures()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVacature(slug);
  if (!v) return { title: "Vacature niet gevonden — Specified" };
  const beschrijving = (v.beschrijving[0] ?? `Vacature ${v.titel} bij Specified in ${v.locatie}.`).slice(0, 160);
  return {
    title: `${v.titel}, ${v.locatie} — Specified`,
    description: beschrijving,
    alternates: { canonical: `/vacatures/${v.slug}` },
    // Een ingevulde vacature blijft bereikbaar, maar hoort niet meer in Google.
    robots: v.ingevuld ? { index: false } : undefined,
    openGraph: { type: "website", title: v.titel, description: beschrijving, url: `${SITE_URL}/vacatures/${v.slug}` },
  };
}

const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Gegevens voor Google for Jobs. Alleen voor open vacatures. */
function jobPosting(v: Vacature) {
  const lijst = (kop: string, punten: string[]) =>
    punten.length ? `<p><strong>${kop}</strong></p><ul>${punten.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>` : "";
  const uren = v.uren === "Deeltijds" ? ["PART_TIME"] : v.uren === "Voltijds" ? ["FULL_TIME"] : v.uren ? ["FULL_TIME", "PART_TIME"] : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: v.titel,
    description:
      v.beschrijving.map((a) => `<p>${escapeHtml(a)}</p>`).join("") +
      lijst("Jouw profiel", v.profiel) +
      lijst("Nice to have", v.niceToHave) +
      lijst("Wat we bieden", v.aanbod),
    identifier: { "@type": "PropertyValue", name: "Specified", value: v.id },
    ...(v.geplaatst ? { datePosted: v.geplaatst.slice(0, 10) } : {}),
    ...(uren ? { employmentType: uren } : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: "Specified",
      sameAs: SITE_URL,
      logo: `${SITE_URL}/images/team/logo_specified.svg`,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: v.locatie, addressRegion: "Vlaanderen", addressCountry: "BE" },
    },
    ...(v.vakgebied ? { industry: v.vakgebied } : {}),
    directApply: true,
    url: `${SITE_URL}/vacatures/${v.slug}`,
  };
}

export default async function VacaturePagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [v, settings] = await Promise.all([getVacature(slug), getSettings()]);
  if (!v) notFound();
  // Titel gewijzigd in de CMS: het oude adres verwijst door naar het nieuwe.
  if (v.slug !== slug) permanentRedirect(`/vacatures/${v.slug}`);

  return (
    <VacatureWeergave
      v={v}
      footer={{ linkedin: settings.linkedin, footerTekst: settings.footer_tekst }}
      voorKop={
        !v.ingevuld && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting(v)).replace(/</g, "\\u003c") }} />
        )
      }
    />
  );
}
