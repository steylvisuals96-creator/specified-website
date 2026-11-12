import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/settings";
import { metAccent } from "@/lib/accent";

/**
 * Het raamwerk van een gewone pagina: navigatie, kop met inleiding, inhoud en
 * footer. De juridische pagina's gebruiken LegalPage.
 */
export default async function Pagina({
  titel,
  inleiding,
  acties,
  children,
}: {
  titel: string;
  inleiding?: React.ReactNode;
  acties?: React.ReactNode;
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <>
      <Nav />
      <main id="inhoud" className="pagina">
        <header className="wrap pagina__kop">
          <h1 className="display display-l">{metAccent(titel)}</h1>
          {inleiding && <p className="lead pagina__inleiding">{inleiding}</p>}
          {acties && <div className="hero__actions">{acties}</div>}
        </header>
        {children}
      </main>
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}

/** Een sectie met een kop links en de inhoud rechts (op brede schermen). */
export function Blok({ kop, id, children }: { kop: string; id?: string; children: React.ReactNode }) {
  return (
    <section className="blok" id={id}>
      <div className="wrap blok__grid">
        <h2 className="display display-m blok__kop">{kop}</h2>
        <div className="blok__inhoud">{children}</div>
      </div>
    </section>
  );
}

export function Lijst({ items }: { items: { titel: string; tekst?: string }[] }) {
  return (
    <ul className="lijst">
      {items.map((i) => (
        <li key={i.titel}>
          <span className="lijst__titel">{i.titel}</span>
          {i.tekst && <span className="lijst__tekst">{i.tekst}</span>}
        </li>
      ))}
    </ul>
  );
}

export function Stappen({ items }: { items: { titel: string; tekst: string }[] }) {
  return (
    <ol className="stappen">
      {items.map((s, i) => (
        <li key={s.titel}>
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

export function Kenmerken({ items }: { items: string[] }) {
  return (
    <ul className="kenmerken">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
