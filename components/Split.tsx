import Image from "next/image";
import type { SiteSettings } from "@/lib/settings";

// Twee doelgroepen naast elkaar, gescheiden door één haarlijn. De doelgroep
// is zelf de kop, zodat er geen label boven de kop nodig is.
export default function Split({ settings = {} }: { settings?: SiteSettings }) {
  const kolommen = [
    {
      id: "kandidaten",
      kop: settings.kandidaten_tag || "Voor kandidaten",
      titel: settings.kandidaten_titel || "Jouw carrière verdient een echte partner",
      tekst:
        settings.kandidaten_tekst ||
        "We luisteren eerst. Pas daarna zoeken we. Samen bepalen we welke stap écht past bij wie jij bent en waar je naartoe wil groeien als engineer.",
      cta: settings.kandidaten_cta || "Bekijk openstaande jobs",
      href: "/vacatures",
      knop: "btn-primary",
      beeld: "/images/beeld/kandidaten-engineer.jpg",
    },
    {
      id: "opdrachtgevers",
      kop: settings.bedrijven_tag || "Voor bedrijven",
      titel: settings.bedrijven_titel || "Engineering talent dat echt het verschil maakt",
      tekst:
        settings.bedrijven_tekst ||
        "Geen CV-schieten. Wij screenen diep, valideren technisch en leveren enkel kandidaten die passen bij jouw cultuur, stack en ambitie.",
      cta: settings.bedrijven_cta || "Vertel ons wat je zoekt",
      href: "#contact",
      knop: "btn-secondary",
      beeld: "/images/beeld/bedrijven-installatie.jpg",
    },
  ];

  return (
    <section id="diensten" className="split">
      <div className="wrap split__grid">
        {kolommen.map((k) => (
          <div key={k.id} id={k.id} className="split__col">
            <div className="split__beeld">
              <Image src={k.beeld} alt="" fill sizes="(max-width: 900px) 100vw, 45vw" />
            </div>
            <h2 className="display display-m">{k.kop}</h2>
            <p className="split__titel">{k.titel}</p>
            <p className="split__tekst">{k.tekst}</p>
            <a href={k.href} className={`btn ${k.knop}`}>
              {k.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
