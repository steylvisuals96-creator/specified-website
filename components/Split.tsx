import Image from "next/image";
import T from "@/components/T";

type Kolom = { id: string; kop: string; titel: string; tekst: string; cta: string; href: string; knop: string; beeld: string };

// Twee doelgroepen naast elkaar, gescheiden door één haarlijn. De doelgroep
// is zelf de kop, zodat er geen label boven de kop nodig is. Inhoud: lib/inhoud.ts.
export default function Split({ kolommen }: { kolommen: Kolom[] }) {
  return (
    <section id="diensten" className="split">
      <div className="wrap split__grid">
        {kolommen.map((k) => (
          <div key={k.id} id={k.id} className="split__col">
            <div className="split__beeld">
              <Image src={k.beeld} alt="" fill sizes="(max-width: 900px) 100vw, 45vw" />
            </div>
            <h2 className="display display-m">
              <T k={`diensten.${k.id}.kop`} d={k.kop} />
            </h2>
            <p className="split__titel">
              <T k={`diensten.${k.id}.titel`} d={k.titel} />
            </p>
            <p className="split__tekst">
              <T k={`diensten.${k.id}.tekst`} d={k.tekst} />
            </p>
            <a href={k.href} className={`btn ${k.knop}`}>
              <T k={`diensten.${k.id}.cta`} d={k.cta} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
