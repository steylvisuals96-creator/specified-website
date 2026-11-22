import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Formulier from "@/components/Formulier";
import type { FooterGegevens } from "@/components/Pagina";
import { datumVoluit, type Vacature } from "@/lib/vacatures";
import { lokaalPad, type Taal } from "@/lib/taal";
import { ui } from "@/lib/teksten";

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

export default function VacatureWeergave({ v, footer, voorKop, taal = "nl" }: { v: Vacature; footer?: FooterGegevens; voorKop?: React.ReactNode; taal?: Taal }) {
  const u = ui(taal).vacature;
  const p = (pad: string) => lokaalPad(taal, pad);
  const feiten: [string, string, string][] = (
    [
      [u.vakgebied, v.vakgebied, "vakgebied"],
      [u.locatie, v.locatie, "locatie"],
      [u.uren, v.uren, "uren"],
      [u.ervaring, v.ervaring, "ervaring"],
      [u.opleiding, v.opleiding, "opleiding"],
      [u.talen, v.talen.join(", "), "talen"],
      [u.geplaatst, datumVoluit(v.geplaatst, taal), "geplaatst_op"],
    ] as [string, string, string][]
  ).filter(([, w]) => w);

  return (
    <>
      {voorKop}
      <Nav />
      <main id="inhoud" className="pagina">
        <div className="wrap">
          <Link href={p("/vacatures")} className="text-link vacature__terug">
            {u.alle}
          </Link>
          <header className="vacature__kop">
            {v.ingevuld && (
              <p className="vacature__status" data-bewerk="status">
                {u.isIngevuld}
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
              <Punten kop={u.profiel} punten={v.profiel} veld="vereisten" />
              <Punten kop={u.niceToHave} punten={v.niceToHave} veld="nice_to_have" />
              <Punten kop={u.aanbod} punten={v.aanbod} veld="aanbod" />
            </div>

            <aside className="vacature__kaart" aria-label={u.kenmerken} data-bewerk="contract,status,zichtbaar">
              <dl>
                {feiten.map(([l, w, veld]) => (
                  <div key={l} data-bewerk={veld}>
                    <dt>{l}</dt>
                    <dd>{w}</dd>
                  </div>
                ))}
              </dl>
              {v.ingevuld ? (
                <Link href={p("/vacatures")} className="btn btn-secondary">
                  {u.bekijkOpen}
                </Link>
              ) : (
                <a href="#solliciteer" className="btn btn-primary">
                  {u.solliciteer}
                </a>
              )}
            </aside>
          </div>
        </div>

        <section className="blok" id="solliciteer">
          <div className="wrap blok__grid">
            {v.ingevuld ? (
              <>
                <h2 className="display display-m blok__kop">{u.teLaat}</h2>
                <div className="blok__inhoud">
                  <p className="blok__tekst">{u.teLaatTekst}</p>
                  <Link href={p("/open-sollicitatie")} className="btn btn-primary">
                    {u.open}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="display display-m blok__kop">{u.solliciteer}</h2>
                <div className="blok__inhoud">
                  <p className="blok__tekst">{u.jeSolliciteert(v.titel)}</p>
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
