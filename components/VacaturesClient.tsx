"use client";

import Link from "next/link";
import { useState } from "react";

export type VacatureRij = {
  slug: string;
  titel: string;
  vakgebied: string;
  locatie: string;
  uren: string;
  ervaring: string;
  ingevuld: boolean;
  dagen?: number;
};

const ALLE = "Alle";

// Alleen tonen als het nieuws is: "90 dagen online" leest als oud, niet als vers.
export function versheid(dagen?: number) {
  if (dagen === undefined || dagen > 30) return null;
  if (dagen < 1) return { getal: "Nieuw", label: "vandaag online" };
  return { getal: String(dagen), label: dagen === 1 ? "dag online" : "dagen online" };
}

/**
 * De vacaturelijst met één filter op vakgebied (Specified vroeg geen filters
 * op regio en uren). Elke rij is een link naar de pagina van de vacature.
 */
export default function VacaturesClient({ vacatures }: { vacatures: VacatureRij[] }) {
  const vakgebieden = Array.from(new Set(vacatures.map((v) => v.vakgebied).filter(Boolean)));
  const [actief, setActief] = useState(ALLE);
  const zichtbaar = vacatures.filter((v) => actief === ALLE || v.vakgebied === actief);

  return (
    <>
      {/* Eén optie kan niets filteren; dan tonen we de filter niet. */}
      {vakgebieden.length > 1 && (
        <fieldset className="filter">
          <legend>Vakgebied</legend>
          <div className="filter__knoppen">
            {[ALLE, ...vakgebieden].map((w) => (
              <button key={w} type="button" aria-pressed={actief === w} onClick={() => setActief(w)}>
                {w}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <p className="sr-only" role="status">
        {zichtbaar.length} vacature{zichtbaar.length === 1 ? "" : "s"} getoond
      </p>

      {zichtbaar.length === 0 ? (
        <p className="lead jobs__leeg">Geen vacatures gevonden in dit vakgebied.</p>
      ) : (
        <ul className="jobs__lijst">
          {zichtbaar.map((v) => {
            const vers = v.ingevuld ? null : versheid(v.dagen);
            return (
              <li key={v.slug}>
                <Link href={`/vacatures/${v.slug}`} className="jobs__rij" data-ingevuld={v.ingevuld || undefined}>
                  <span className="jobs__vers" data-leeg={!vers && !v.ingevuld}>
                    {v.ingevuld ? (
                      <span className="jobs__ingevuld">Ingevuld</span>
                    ) : (
                      vers && (
                        <>
                          <span className="jobs__getal display">{vers.getal}</span>
                          <span className="jobs__vers-label">{vers.label}</span>
                        </>
                      )
                    )}
                  </span>
                  <span className="jobs__titel">{v.titel}</span>
                  <span className="jobs__meta">{v.locatie}</span>
                  <span className="jobs__meta">{v.vakgebied}</span>
                  <span className="jobs__meta">{v.ervaring}</span>
                  <span className="jobs__meta">{v.uren}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
