"use client";

import "./admin.css";
import { useEffect, useMemo, useState } from "react";
import { GROEP_VOLGORDE, MAX_TEKST, REGISTER, STANDAARD, ontsmet, type TekstDef } from "@/lib/tekstenBasis";
import { useTeksten } from "@/components/admin/TeksProvider";

type Bevestiging = null | "publiceer" | "weggooi";

export default function AdminBalk() {
  const { admin, bewerken, zetBewerken, concept, bezig, publiceer, weggooi, uitloggen, melding, wisMelding } = useTeksten();
  const [paneel, setPaneel] = useState(false);
  const [bevestig, setBevestig] = useState<Bevestiging>(null);

  const aantal = Object.keys(concept).length;
  const woord = aantal === 1 ? "tekst" : "teksten";

  // Geen concepten meer (net gepubliceerd of weggegooid): een openstaande vraag is achterhaald.
  if (aantal === 0 && bevestig !== null) setBevestig(null);

  if (!admin) return null;

  const doe = async () => {
    const b = bevestig;
    setBevestig(null);
    if (b === "publiceer") await publiceer();
    else if (b === "weggooi") await weggooi();
  };

  return (
    <>
      <div className="ab" role="region" aria-label="Beheer van de website">
        <div className="ab__rij">
          <span className="ab__naam">Beheer · {admin.naam}</span>

          <button type="button" className="ab__knop" aria-pressed={bewerken} onClick={() => zetBewerken(!bewerken)}>
            {bewerken ? "Bewerken: aan" : "Bewerken: uit"}
          </button>
          <button type="button" className="ab__knop" aria-expanded={paneel} onClick={() => setPaneel(!paneel)}>
            Alle teksten
          </button>

          <span className="ab__teller" data-leeg={aantal === 0}>
            {aantal === 0 ? "Geen concepten" : `${aantal} ${aantal === 1 ? "concept" : "concepten"}, nog niet live`}
          </span>

          {bevestig === null ? (
            <>
              <button type="button" className="ab__knop" disabled={aantal === 0 || bezig} onClick={() => setBevestig("weggooi")}>
                Weggooien
              </button>
              <button
                type="button"
                className="ab__knop ab__knop--primair"
                disabled={aantal === 0 || bezig}
                onClick={() => setBevestig("publiceer")}
              >
                {bezig ? "Bezig…" : "Publiceren"}
              </button>
            </>
          ) : (
            <>
              <span className="ab__vraag" role="alert">
                {bevestig === "publiceer" ? `${aantal} ${woord} live zetten voor alle bezoekers?` : `${aantal} ${woord} weggooien?`}
              </span>
              <button type="button" className="ab__knop ab__knop--primair" onClick={doe}>
                {bevestig === "publiceer" ? "Ja, live zetten" : "Ja, weggooien"}
              </button>
              <button type="button" className="ab__knop" onClick={() => setBevestig(null)}>
                Annuleren
              </button>
            </>
          )}

          <button type="button" className="ab__knop ab__knop--stil" onClick={uitloggen}>
            Uitloggen
          </button>
        </div>

        {melding && (
          <div className="ab__melding" data-soort={melding.soort} role={melding.soort === "fout" ? "alert" : "status"}>
            <span>{melding.tekst}</span>
            <button type="button" aria-label="Melding sluiten" onClick={wisMelding}>
              ×
            </button>
          </div>
        )}
      </div>

      {paneel && <Paneel onSluit={() => setPaneel(false)} />}
    </>
  );
}

/** Alle teksten in één lijst: ook die niet in de pagina zelf te bewerken zijn (de tekening, de zoekmachinetekst). */
function Paneel({ onSluit }: { onSluit: () => void }) {
  const { concept, tekst } = useTeksten();
  const [zoek, setZoek] = useState("");

  useEffect(() => {
    const sluit = (e: KeyboardEvent) => e.key === "Escape" && onSluit();
    window.addEventListener("keydown", sluit);
    return () => window.removeEventListener("keydown", sluit);
  }, [onSluit]);

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    const past = (t: TekstDef) =>
      !q || t.label.toLowerCase().includes(q) || t.k.includes(q) || (concept[t.k] ?? tekst(t.k)).toLowerCase().includes(q);
    return GROEP_VOLGORDE.map((naam) => ({ naam, teksten: REGISTER.filter((t) => t.groep === naam && past(t)) })).filter(
      (g) => g.teksten.length > 0
    );
  }, [zoek, concept, tekst]);

  return (
    <aside className="ab__paneel" aria-label="Alle teksten">
      <header className="ab__paneel-kop">
        <h2>Alle teksten</h2>
        <button type="button" className="ab__knop" onClick={onSluit}>
          Sluiten
        </button>
      </header>
      <p className="ab__hulp">
        Wijzigingen worden als concept bewaard en zijn pas voor bezoekers zichtbaar als je op Publiceren drukt.
      </p>
      <input
        type="search"
        className="ab__zoek"
        placeholder="Zoek een tekst"
        aria-label="Zoek een tekst"
        value={zoek}
        onChange={(e) => setZoek(e.target.value)}
      />
      {groepen.length === 0 && <p className="ab__hulp">Geen teksten gevonden.</p>}
      {groepen.map((g) => (
        <section key={g.naam} className="ab__groep">
          <h3>{g.naam}</h3>
          {g.teksten.map((t) => (
            <Veld key={t.k} def={t} />
          ))}
        </section>
      ))}
    </aside>
  );
}

function Veld({ def }: { def: TekstDef }) {
  const { concept, tekst, slaOp } = useTeksten();
  const huidig = concept[def.k] ?? tekst(def.k);
  // Wat iemand aan het typen is; null = het veld volgt de huidige tekst. Zo hoeft het veld
  // niet bijgewerkt te worden als de tekst van buitenaf verandert (publiceren, weggooien).
  const [getypt, setGetypt] = useState<string | null>(null);
  const waarde = getypt ?? huidig;
  const isConcept = def.k in concept;

  const bewaar = async (nieuw: string) => {
    const schoon = ontsmet(nieuw);
    if (schoon && schoon !== huidig) await slaOp(def.k, schoon);
    setGetypt(null); // gelukt: de nieuwe tekst staat nu als concept; mislukt: terug naar de oude
  };

  return (
    <div className="ab__veld" data-concept={isConcept}>
      <label htmlFor={`ab-${def.k}`}>
        {def.label}
        {isConcept && <em>concept</em>}
      </label>
      <textarea
        id={`ab-${def.k}`}
        rows={Math.min(6, Math.max(1, Math.ceil(waarde.length / 38)))}
        maxLength={MAX_TEKST}
        value={waarde}
        onChange={(e) => setGetypt(e.target.value)}
        onBlur={(e) => bewaar(e.target.value)}
      />
      {huidig !== STANDAARD[def.k] && (
        <button type="button" className="ab__herstel" onClick={() => bewaar(STANDAARD[def.k])}>
          Standaardtekst terugzetten
        </button>
      )}
    </div>
  );
}
