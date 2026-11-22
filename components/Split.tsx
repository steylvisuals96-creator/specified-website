import Image from "next/image";
import { mediaUrl } from "@/lib/beheer";
import type { DIENSTEN } from "@/lib/inhoud";
import { lokaalPad, type Taal } from "@/lib/taal";

// Twee doelgroepen naast elkaar, gescheiden door één haarlijn. De doelgroep
// is zelf de kop, zodat er geen label boven de kop nodig is. Inhoud: lib/inhoud.ts.
export default function Split({ kolommen, taal = "nl" }: { kolommen: typeof DIENSTEN; taal?: Taal }) {
  return (
    <section id="diensten" className="split">
      <div className="wrap split__grid">
        {kolommen.map((k) => (
          <div key={k.id} id={k.id} className="split__col">
            <div className="split__beeld">
              <Image src={mediaUrl(k.beeldId) ?? k.beeld} alt="" fill sizes="(max-width: 900px) 100vw, 45vw" />
            </div>
            <h2 className="display display-m" data-bewerk={`diensten_${k.id}.kop`}>{k.kop}</h2>
            <p className="split__titel" data-bewerk={`diensten_${k.id}.titel`}>{k.titel}</p>
            <p className="split__tekst" data-bewerk={`diensten_${k.id}.tekst`}>{k.tekst}</p>
            <a href={lokaalPad(taal, k.href)} className={`btn ${k.knop}`} data-bewerk={`diensten_${k.id}.cta`}>
              {k.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
