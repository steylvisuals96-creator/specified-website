import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Formulier from "@/components/Formulier";
import type { FooterGegevens } from "@/components/Pagina";
import { datumVoluit, type Vacature } from "@/lib/vacatures";

/**
 * De pagina van één vacature, als weergave: de echte pagina en het live
 * voorbeeld in het beheer gebruiken dezelfde. data-bewerk draagt de namen van
 * de velden in het vacatureformulier van het beheer, zodat het voorbeeld
 * meescrollt naar wat de redactie aanpast.
 */
function Punten({ kop, punten, veld }: { kop: string; punten: string[]; veld: string }) {
  if (punten.length === 0) return null;
  return (
    <section className="vacature__deel" data-bewerk={veld}>
      <h2 className="vacature__deelkop">{kop}</h2>
      <ul className="vacature__punten">
        {punten.map((p, i) => (
          <li key={`${i}-${p}`}>{p}</li>
        ))}
      </ul>
    </section>
  );
}

export default function VacatureWeergave({ v, footer, voorKop }: { v: Vacature; footer?: FooterGegevens; voorKop?: React.ReactNode }) {
  const feiten: [string, string, string][] = (
    [
      ["Vakgebied", v.vakgebied, "vakgebied"],
      ["Locatie", v.locatie, "locatie"],
      ["Uren", v.uren, "uren"],
      ["Ervaring", v.ervaring, "ervaring"],
      ["Opleiding", v.opleiding, "opleiding"],
      ["Talen", v.talen.join(", "), "talen"],
      ["Geplaatst op", datumVoluit(v.geplaatst), "geplaatst_op"],
    ] as [string, string, string][]
  ).filter(([, w]) => w);

  return (
    <>
      {voorKop}
      <Nav />
      <main id="inhoud" className="pagina">
        <div className="wrap">
          <Link href="/vacatures" className="text-link vacature__terug">
            Alle vacatures
          </Link>
          <header className="vacature__kop">
            {v.ingevuld && (
              <p className="vacature__status" data-bewerk="status">
                Deze vacature is ingevuld
              </p>
            )}
            <h1 className="display display-l" data-bewerk="titel">
              {v.titel}
            </h1>
          </header>

          <div className="vacature__grid">
            <div className="vacature__tekst">
              {v.beschrijving.length > 0 && (
                <section className="vacature__deel" data-bewerk="beschrijving">
                  {v.beschrijving.map((a, i) => (
                    <p key={i}>{a}</p>
                  ))}
                </section>
              )}
              <Punten kop="Jouw profiel" punten={v.profiel} veld="vereisten" />
              <Punten kop="Nice to have" punten={v.niceToHave} veld="nice_to_have" />
              <Punten kop="Wat we bieden" punten={v.aanbod} veld="aanbod" />
            </div>

            <aside className="vacature__kaart" aria-label="Kenmerken van de vacature" data-bewerk="contract,status,zichtbaar">
              <dl>
                {feiten.map(([l, w, veld]) => (
                  <div key={l} data-bewerk={veld}>
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
      <Footer linkedin={footer?.linkedin} footerTekst={footer?.footerTekst} />
    </>
  );
}
