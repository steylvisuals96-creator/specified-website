"use client";

import { useRef, useState } from "react";
import type { SubVeld } from "@/lib/paginas";

/**
 * Herhaalbare rijen met meerdere velden (diensten, stappen, vragen). Elke rij
 * krijgt velden met de naam <sleutel>.<rij>.<veld>; de volgorde op het scherm
 * is de volgorde van opslaan. Leeg laten = de standaardtekst van de website,
 * die als placeholder in de eerste rijen staat.
 */
export default function ItemsVeld({
  naam,
  label,
  velden,
  waarden,
  standaard,
  maxItems,
  hint,
  fouten = {},
}: {
  naam: string;
  label: string;
  velden: SubVeld[];
  waarden?: Record<string, string>[];
  standaard: Record<string, string>[];
  maxItems: number;
  hint?: string;
  fouten?: Record<string, string>;
}) {
  const teller = useRef(0);
  const nieuw = (w: Record<string, string> = {}) => ({ id: `r${teller.current++}`, w });
  // Zonder opgeslagen waarden: evenveel lege rijen als de standaard, met de standaard als placeholder.
  const [rijen, setRijen] = useState(() => (waarden?.length ? waarden.map((w) => nieuw(w)) : standaard.map(() => nieuw())));

  const verplaats = (i: number, d: -1 | 1) =>
    setRijen((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const n = [...r];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  // Na een wijziging in de rijen hoort het formulier het (niet opgeslagen, voorbeeld).
  const meld = (el: HTMLElement | null) => requestAnimationFrame(() => el?.closest("form")?.dispatchEvent(new Event("change", { bubbles: true })));
  const lijst = useRef<HTMLOListElement>(null);

  return (
    <fieldset>
      <legend className="veld-label mb-2">{label}</legend>
      <ol ref={lijst} className="flex flex-col gap-4">
        {rijen.map((r, i) => (
          <li key={r.id} className="border border-[var(--lijn)] p-4 flex flex-col gap-4 bg-[rgba(0,0,0,.12)]">
            <div className="flex items-center justify-between gap-3">
              <span className="kop text-[20px] text-[var(--limoen)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex gap-1">
                <button type="button" className="knop knop-stil knop-klein !px-2.5" onClick={() => (verplaats(i, -1), meld(lijst.current))} disabled={i === 0} aria-label={`Rij ${i + 1} omhoog`}>
                  Op
                </button>
                <button type="button" className="knop knop-stil knop-klein !px-2.5" onClick={() => (verplaats(i, 1), meld(lijst.current))} disabled={i === rijen.length - 1} aria-label={`Rij ${i + 1} omlaag`}>
                  Neer
                </button>
                <button type="button" className="knop knop-gevaar knop-klein !px-2.5" onClick={() => (setRijen((x) => x.filter((y) => y.id !== r.id)), meld(lijst.current))} aria-label={`Rij ${i + 1} verwijderen`}>
                  Weg
                </button>
              </span>
            </div>
            {velden.map((s) => {
              const id = `${naam}-${r.id}-${s.sleutel}`;
              const veldNaam = `${naam}.${i}.${s.sleutel}`;
              const placeholder = waarden?.length ? undefined : standaard[i]?.[s.sleutel];
              const fout = fouten[veldNaam];
              return (
                <div key={s.sleutel}>
                  <label className="veld-label" htmlFor={id}>
                    {s.label}
                  </label>
                  {s.soort === "tekstvak" ? (
                    <textarea id={id} name={veldNaam} defaultValue={r.w[s.sleutel] ?? ""} maxLength={s.max} rows={3} placeholder={placeholder} data-veld={naam} className="invoer" />
                  ) : (
                    <input id={id} name={veldNaam} defaultValue={r.w[s.sleutel] ?? ""} maxLength={s.max} placeholder={placeholder} data-veld={naam} className="invoer" aria-invalid={fout ? true : undefined} />
                  )}
                  {fout && <p className="veld-fout">{fout}</p>}
                </div>
              );
            })}
          </li>
        ))}
      </ol>
      {rijen.length < maxItems && (
        <button type="button" className="tekstknop mt-3" onClick={() => (setRijen((x) => [...x, nieuw()]), meld(lijst.current))}>
          Rij toevoegen
        </button>
      )}
      {hint && <p className="veld-hint">{hint}</p>}
      {!waarden?.length && <p className="veld-hint">Leeg gelaten rijen tonen de standaardtekst (grijs). Vul je er één in, dan telt alleen wat je invult.</p>}
    </fieldset>
  );
}
