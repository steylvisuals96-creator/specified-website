import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Formulier from "@/components/Formulier";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { datumVoluit, getVacature, getVacatures, type Vacature } from "@/lib/vacatures";

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

function Punten({ kop, punten }: { kop: string; punten: string[] }) {
  if (punten.length === 0) return null;
  return (
    <section className="vacature__deel">
      <h2 className="vacature__deelkop">{kop}</h2>
      <ul className="vacature__punten">
        {punten.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function VacaturePagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [v, settings] = await Promise.all([getVacature(slug), getSettings()]);
  if (!v) notFound();
  // Titel gewijzigd in de CMS: het oude adres verwijst door naar het nieuwe.
  if (v.slug !== slug) permanentRedirect(`/vacatures/${v.slug}`);

  const feiten: [string, string][] = (
    [
      ["Vakgebied", v.vakgebied],
      ["Locatie", v.locatie],
      ["Uren", v.uren],
      ["Ervaring", v.ervaring],
      ["Opleiding", v.opleiding],
      ["Talen", v.talen.join(", ")],
      ["Geplaatst op", datumVoluit(v.geplaatst)],
    ] as [string, string][]
  ).filter(([, w]) => w);

  return (
    <>
      {!v.ingevuld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting(v)).replace(/</g, "\\u003c") }}
        />
      )}
      <Nav />
      <main id="inhoud" className="pagina">
        <div className="wrap">
          <Link href="/vacatures" className="text-link vacature__terug">
            Alle vacatures
          </Link>
          <header className="vacature__kop">
            {v.ingevuld && <p className="vacature__status">Deze vacature is ingevuld</p>}
            <h1 className="display display-l">{v.titel}</h1>
          </header>

          <div className="vacature__grid">
            <div className="vacature__tekst">
              {v.beschrijving.length > 0 && (
                <section className="vacature__deel">
                  {v.beschrijving.map((a, i) => (
                    <p key={i}>{a}</p>
                  ))}
                </section>
              )}
              <Punten kop="Jouw profiel" punten={v.profiel} />
              <Punten kop="Nice to have" punten={v.niceToHave} />
              <Punten kop="Wat we bieden" punten={v.aanbod} />
            </div>

            <aside className="vacature__kaart" aria-label="Kenmerken van de vacature">
              <dl>
                {feiten.map(([l, w]) => (
                  <div key={l}>
                    <dt>{l}</dt>
                    <dd>{w}</dd>
                  </div>
                ))}
              </dl>
              {v.ingevuld ? (
                <Link href="/vacatures" className="btn btn-secondary">
                  Bekijk open vacatures
                </Link>
              ) : (
                <a href="#solliciteer" className="btn btn-primary">
                  Solliciteer
                </a>
              )}
            </aside>
          </div>
        </div>

        <section className="blok" id="solliciteer">
          <div className="wrap blok__grid">
            {v.ingevuld ? (
              <>
                <h2 className="display display-m blok__kop">Te laat?</h2>
                <div className="blok__inhoud">
                  <p className="blok__tekst">Deze job is ingevuld, maar we zoeken ook buiten de openstaande vacatures.</p>
                  <Link href="/open-sollicitatie" className="btn btn-primary">
                    Stuur een open sollicitatie
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="display display-m blok__kop">Solliciteer</h2>
                <div className="blok__inhoud">
                  <p className="blok__tekst">Je solliciteert voor {v.titel}. We bekijken je cv en nemen contact met je op.</p>
                  <Formulier soort="sollicitatie" vacature={v.titel} />
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
