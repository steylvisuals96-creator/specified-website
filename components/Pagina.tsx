import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { metAccent } from "@/lib/accent";

export type FooterGegevens = { linkedin?: string; footerTekst?: string };

/**
 * Het raamwerk van een gewone pagina: navigatie, kop met inleiding, inhoud en
 * footer. Geen eigen data-ophaling, zodat dezelfde weergave ook in het live
 * voorbeeld van het beheer werkt (in de browser). De juridische pagina's
 * gebruiken LegalPage.
 *
 * data-bewerk op titel en inleiding: zo scrollt het voorbeeld in het beheer
 * naar het veld waarin de redactie typt.
 */
export function PaginaRaam({
  titel,
  inleiding,
  acties,
  footer,
  children,
}: {
  titel: string;
  inleiding?: React.ReactNode;
  acties?: React.ReactNode;
  footer?: FooterGegevens;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="inhoud" className="pagina">
        <header className="wrap pagina__kop">
          <h1 className="display display-l" data-bewerk="titel">
            {metAccent(titel)}
          </h1>
          {inleiding && (
            <p className="lead pagina__inleiding" data-bewerk="inleiding,inleidingLeeg">
              {inleiding}
            </p>
          )}
          {acties && <div className="hero__actions">{acties}</div>}
        </header>
        {children}
      </main>
      <Footer linkedin={footer?.linkedin} footerTekst={footer?.footerTekst} />
    </>
  );
}

/** Een sectie met een kop links en de inhoud rechts (op brede schermen). */
export function Blok({ kop, id, veld, children }: { kop: string; id?: string; veld?: string; children: React.ReactNode }) {
  return (
    <section className="blok" id={id}>
      <div className="wrap blok__grid">
        <h2 className="display display-m blok__kop" data-bewerk={veld}>
          {kop}
        </h2>
        <div className="blok__inhoud">{children}</div>
      </div>
    </section>
  );
}

export function Lijst({ items, veld }: { items: { titel: string; tekst?: string }[]; veld?: string }) {
  return (
    <ul className="lijst" data-bewerk={veld}>
      {items.map((i, n) => (
        <li key={`${n}-${i.titel}`}>
          <span className="lijst__titel">{i.titel}</span>
          {i.tekst && <span className="lijst__tekst">{i.tekst}</span>}
        </li>
      ))}
    </ul>
  );
}

export function Stappen({ items, veld }: { items: { titel: string; tekst: string }[]; veld?: string }) {
  return (
    <ol className="stappen" data-bewerk={veld}>
      {items.map((s, i) => (
        <li key={`${i}-${s.titel}`}>
          <span className="stappen__nr display" aria-hidden="true">
            {i + 1}
          </span>
          <span className="lijst__titel">{s.titel}</span>
          <span className="lijst__tekst">{s.tekst}</span>
        </li>
      ))}
    </ol>
  );
}

export function Kenmerken({ items, veld }: { items: string[]; veld?: string }) {
  return (
    <ul className="kenmerken" data-bewerk={veld}>
      {items.map((i, n) => (
        <li key={`${n}-${i}`}>{i}</li>
      ))}
    </ul>
  );
}
