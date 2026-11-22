import Link from "next/link";
import { Blok, Kenmerken, Lijst, PaginaRaam, Stappen, type FooterGegevens } from "@/components/Pagina";
import Formulier from "@/components/Formulier";
import VacaturesClient from "@/components/VacaturesClient";
import Cover from "@/components/Cover";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { formatDatum, type BlogPost } from "@/lib/blog";
import { veiligeLinkAdres, type PaginaTeksten } from "@/lib/paginas";

/**
 * De doorklikpagina's als weergave: alle teksten komen binnen als `t` (en de
 * gedeelde lijsten als `a`). De echte pagina vult ze uit het beheer, het live
 * voorbeeld in het beheer uit het formulier. Geen data-ophaling hier, zodat
 * beide dezelfde weergave gebruiken. data-bewerk koppelt elk element aan zijn
 * veld in het beheer.
 */
type T = PaginaTeksten;
type Basis = { t: T; footer?: FooterGegevens };
type MetAlgemeen = Basis & { a: T };

const attestenZin = (a: T) => `${a.attestenZin} ${(a.certificaten as string[]).join(", ")}.`;

export function VoorBedrijvenWeergave({ t, a, footer }: MetAlgemeen) {
  return (
    <PaginaRaam
      titel={t.titel}
      inleiding={t.inleiding}
      footer={footer}
      acties={
        <>
          <a href="#aanvraag" className="btn btn-primary" data-bewerk="knopAanvraag">
            {t.knopAanvraag}
          </a>
          <Link href="/contact" className="btn btn-secondary" data-bewerk="knopContact">
            {t.knopContact}
          </Link>
        </>
      }
    >
      <Blok kop={t.dienstenKop} veld="dienstenKop">
        <Lijst items={t.diensten} veld="diensten" />
      </Blok>

      <Blok kop={t.profielenKop} veld="profielenKop">
        <p className="blok__tekst" data-bewerk="profielenTekst">
          {t.profielenTekst}
        </p>
        <Kenmerken items={a.profielen} veld="profielen" />
      </Blok>

      <Blok kop={t.sectorenKop} veld="sectorenKop">
        <p className="blok__tekst" data-bewerk="sectorenTekst">
          {t.sectorenTekst}
        </p>
        <Kenmerken items={a.sectoren} veld="sectoren" />
      </Blok>

      <Blok kop={t.stappenKop} veld="stappenKop">
        <Stappen items={t.stappen} veld="stappen" />
      </Blok>

      <Blok kop={t.cijfersKop} veld="cijfersKop">
        <dl className="cijfers" data-bewerk="cijfers">
          {(a.cijfers as { waarde: string; label: string }[]).map((c, i) => (
            <div key={`${i}-${c.label}`}>
              <dd className="display">{c.waarde}</dd>
              <dt>{c.label}</dt>
            </div>
          ))}
        </dl>
        <p className="blok__tekst cijfers__cert" data-bewerk="certificaten,attestenZin">
          {attestenZin(a)}
        </p>
      </Blok>

      <Blok kop={t.aanvraagKop} id="aanvraag" veld="aanvraagKop">
        <p className="blok__tekst" data-bewerk="aanvraagTekst">
          {t.aanvraagTekst}
        </p>
        <Formulier soort="aanvraag" />
      </Blok>
    </PaginaRaam>
  );
}

export function VoorEngineersWeergave({ t, a, footer }: MetAlgemeen) {
  return (
    <PaginaRaam
      titel={t.titel}
      inleiding={t.inleiding}
      footer={footer}
      acties={
        <>
          <Link href="/vacatures" className="btn btn-primary" data-bewerk="knopVacatures">
            {t.knopVacatures}
          </Link>
          <Link href="/open-sollicitatie" className="btn btn-secondary" data-bewerk="knopOpen">
            {t.knopOpen}
          </Link>
        </>
      }
    >
      <Blok kop={t.waardenKop} veld="waardenKop">
        <Lijst items={t.waarden} veld="waarden" />
      </Blok>

      <Blok kop={t.zoekenKop} veld="zoekenKop">
        <p className="blok__tekst" data-bewerk="zoekenTekst">
          {t.zoekenTekst}
        </p>
        <Kenmerken items={a.profielen} veld="profielen" />
      </Blok>

      <Blok kop={t.werkKop} veld="werkKop">
        <p className="blok__tekst" data-bewerk="werkTekst,certificaten,attestenZin">
          {t.werkTekst} {attestenZin(a)}
        </p>
        <Kenmerken items={a.sectoren} veld="sectoren" />
      </Blok>

      <Blok kop={t.stappenKop} veld="stappenKop">
        <Stappen items={t.stappen} veld="stappen" />
        <p className="blok__tekst blok__na" data-bewerk="stappenNa">
          {t.stappenNa}
        </p>
      </Blok>

      <section className="blok">
        <div className="wrap pagina__slot">
          <h2 className="display display-m" data-bewerk="slotKop">
            {t.slotKop}
          </h2>
          <p className="lead" data-bewerk="slotTekst">
            {t.slotTekst}
          </p>
          <Link href="/open-sollicitatie" className="btn btn-primary" data-bewerk="slotKnop">
            {t.slotKnop}
          </Link>
        </div>
      </section>
    </PaginaRaam>
  );
}

export type VacatureRij = { slug: string; titel: string; vakgebied: string; locatie: string; uren: string; ervaring: string; ingevuld: boolean; dagen?: number };

export function VacaturesWeergave({ t, footer, vacatures }: Basis & { vacatures: VacatureRij[] }) {
  const open = vacatures.filter((v) => !v.ingevuld).length;
  return (
    <PaginaRaam
      titel={t.titel}
      footer={footer}
      inleiding={open > 0 ? `${open} open vacature${open === 1 ? "" : "s"} als engineering consultant bij Specified.` : t.inleidingLeeg}
    >
      <section className="blok blok--lijst">
        <div className="wrap">
          <VacaturesClient vacatures={vacatures} />
          <div className="pagina__slot pagina__slot--links">
            <h2 className="display display-m" data-bewerk="slotKop">
              {t.slotKop}
            </h2>
            <p className="lead" data-bewerk="slotTekst">
              {t.slotTekst}
            </p>
            <Link href="/open-sollicitatie" className="btn btn-secondary" data-bewerk="slotKnop">
              {t.slotKnop}
            </Link>
          </div>
        </div>
      </section>
    </PaginaRaam>
  );
}

export function ContactWeergave({ t, footer, mail, telefoon, linkedin }: Basis & { mail: string; telefoon: string; linkedin: string }) {
  return (
    <PaginaRaam titel={t.titel} inleiding={t.inleiding} footer={footer}>
      <section className="blok">
        <div className="wrap contact__grid">
          <address className="contact__gegevens">
            <div>
              <h2 className="contact__label">E-mail</h2>
              <a href={`mailto:${mail}`} className="text-link">
                {mail}
              </a>
            </div>
            <div>
              <h2 className="contact__label">Telefoon</h2>
              <a href={`tel:${telefoon.replace(/\s/g, "")}`} className="text-link">
                {telefoon}
              </a>
            </div>
            <div>
              <h2 className="contact__label">Adres</h2>
              <p data-bewerk="bedrijfsnaam,straat,postcode">
                {t.bedrijfsnaam}
                <br />
                {t.straat}
                <br />
                {t.postcode}
              </p>
            </div>
            <div>
              <h2 className="contact__label">Volg ons</h2>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                LinkedIn
              </a>
            </div>
            <p className="meta" data-bewerk="ondernemingsnummer">
              Ondernemingsnummer {t.ondernemingsnummer}
            </p>
          </address>
          <div>
            <Formulier soort="contact" />
          </div>
        </div>
      </section>
    </PaginaRaam>
  );
}

type Vraag = { vraag: string; antwoord: string; linkTekst?: string; linkAdres?: string };

export function FaqWeergave({ t, footer }: Basis) {
  const groepen: { kop: string; veld: string; vragen: Vraag[] }[] = [1, 2, 3].map((n) => ({ kop: t[`groep${n}Kop`], veld: `groep${n}`, vragen: t[`groep${n}`] }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groepen.flatMap((g) => g.vragen).map((v) => ({ "@type": "Question", name: v.vraag, acceptedAnswer: { "@type": "Answer", text: v.antwoord } })),
  };
  return (
    <PaginaRaam titel={t.titel} inleiding={t.inleiding} footer={footer}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {groepen.map((g) => (
        <section className="blok" key={g.veld}>
          <div className="wrap blok__grid">
            <h2 className="display display-m blok__kop" data-bewerk={`${g.veld}Kop`}>
              {g.kop}
            </h2>
            <div className="blok__inhoud faq" data-bewerk={g.veld}>
              {g.vragen.map((v, i) => {
                const adres = veiligeLinkAdres(v.linkAdres);
                return (
                  <details key={`${i}-${v.vraag}`}>
                    <summary>{v.vraag}</summary>
                    <div className="faq__antwoord">
                      <p>{v.antwoord}</p>
                      {adres && v.linkTekst && (
                        <Link href={adres} className="text-link">
                          {v.linkTekst}
                        </Link>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </section>
      ))}
      <section className="blok">
        <div className="wrap pagina__slot">
          <Link href="/contact" className="btn btn-primary" data-bewerk="slotKnop">
            {t.slotKnop}
          </Link>
        </div>
      </section>
    </PaginaRaam>
  );
}

export function OpenSollicitatieWeergave({ t, footer }: Basis) {
  return (
    <PaginaRaam titel={t.titel} inleiding={t.inleiding} footer={footer}>
      <section className="blok">
        <div className="wrap pagina__smal">
          <Formulier soort="open-sollicitatie" />
        </div>
      </section>
    </PaginaRaam>
  );
}

export function BlogOverzichtWeergave({ t, footer, posts }: Basis & { posts: BlogPost[] }) {
  return (
    <>
      <Nav />
      <main id="inhoud">
        <section style={{ paddingTop: "calc(72px + 4rem)", paddingBottom: "6rem", minHeight: "100svh" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.5rem, 5vw, 4rem)" }}>
            <h1
              className="vac-title"
              data-bewerk="titel"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(4rem, 9vw, 8rem)",
                fontWeight: 400,
                letterSpacing: "0.01em",
                lineHeight: 0.95,
                color: "var(--white)",
                marginBottom: "1.5rem",
              }}
            >
              {t.titel}
            </h1>
            <p data-bewerk="inleiding" style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "520px", lineHeight: 1.6, marginBottom: "3.5rem" }}>
              {t.inleiding}
            </p>

            {posts.length === 0 ? (
              <p style={{ color: "var(--muted)", padding: "2rem 0" }}>Binnenkort verschijnen hier de eerste artikels.</p>
            ) : (
              <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                {posts.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      textDecoration: "none",
                      border: "1px solid var(--border)",
                      borderRadius: 0,
                      overflow: "hidden",
                      backgroundColor: "var(--wash-faint)",
                    }}
                  >
                    {post.coverUrl && (
                      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
                        <Cover src={post.coverUrl} alt={post.titel} sizes="(min-width: 1280px) 370px, (min-width: 1100px) 30vw, (min-width: 700px) 45vw, calc(100vw - 48px)" priority={i === 0} />
                      </div>
                    )}
                    <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {post.publicatiedatum && (
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0", color: "var(--lime)" }}>{formatDatum(post.publicatiedatum)}</span>
                      )}
                      <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.9rem", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.05, color: "var(--white)" }}>
                        {post.titel}
                      </h2>
                      {post.samenvatting && <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.65 }}>{post.samenvatting}</p>}
                      <span style={{ color: "var(--lime)", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.25rem" }}>Lees artikel</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer linkedin={footer?.linkedin} footerTekst={footer?.footerTekst} />
    </>
  );
}
