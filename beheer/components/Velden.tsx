"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Optie } from "@/lib/opties";

type Basis = {
  naam: string;
  label: string;
  hint?: string;
  fout?: string;
  /** Sleutel voor het live voorbeeld (bv. "hero.woord"); zie components/Voorbeeld.tsx. */
  veld?: string;
  className?: string;
};

function Kader({ id, label, hint, fout, teller, children, className }: Basis & { id: string; teller?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label className="veld-label" htmlFor={id}>
          {label}
        </label>
        {teller}
      </div>
      {children}
      {fout ? (
        <p className="veld-fout" id={`${id}-fout`}>
          {fout}
        </p>
      ) : hint ? (
        <p className="veld-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Tekenteller die pas opvalt als je de grens nadert. */
function Teller({ lengte, max }: { lengte: number; max: number }) {
  const bijna = lengte > max * 0.85;
  return (
    <span className={`text-[12px] tabular-nums transition-colors ${lengte >= max ? "text-[var(--alarm)]" : bijna ? "text-[var(--tekst)]" : "text-[var(--zwak)]"}`} aria-hidden="true">
      {lengte}/{max}
    </span>
  );
}

export function Tekstveld({
  waarde,
  max,
  type = "text",
  verplicht,
  placeholder,
  autoComplete,
  ...b
}: Basis & { waarde?: string | null; max?: number; type?: string; verplicht?: boolean; placeholder?: string; autoComplete?: string }) {
  const id = useId();
  const [lengte, setLengte] = useState((waarde ?? "").length);
  return (
    <Kader {...b} id={id} teller={max ? <Teller lengte={lengte} max={max} /> : undefined}>
      <input
        id={id}
        name={b.naam}
        type={type}
        defaultValue={waarde ?? ""}
        maxLength={max}
        required={verplicht}
        placeholder={placeholder}
        autoComplete={autoComplete ?? "off"}
        data-veld={b.veld}
        className="invoer"
        aria-invalid={b.fout ? true : undefined}
        aria-describedby={b.fout ? `${id}-fout` : b.hint ? `${id}-hint` : undefined}
        onChange={(e) => setLengte(e.target.value.length)}
      />
    </Kader>
  );
}

export function Tekstvak({ waarde, max, rijen = 4, placeholder, ...b }: Basis & { waarde?: string | null; max?: number; rijen?: number; placeholder?: string }) {
  const id = useId();
  const [lengte, setLengte] = useState((waarde ?? "").length);
  return (
    <Kader {...b} id={id} teller={max ? <Teller lengte={lengte} max={max} /> : undefined}>
      <textarea
        id={id}
        name={b.naam}
        defaultValue={waarde ?? ""}
        maxLength={max}
        rows={rijen}
        placeholder={placeholder}
        data-veld={b.veld}
        className="invoer"
        aria-invalid={b.fout ? true : undefined}
        onChange={(e) => setLengte(e.target.value.length)}
      />
    </Kader>
  );
}

export function Keuze({ waarde, opties, leeg, verplicht, ...b }: Basis & { waarde?: string | null; opties: Optie[]; leeg?: string; verplicht?: boolean }) {
  const id = useId();
  return (
    <Kader {...b} id={id}>
      <select id={id} name={b.naam} defaultValue={waarde ?? ""} required={verplicht} data-veld={b.veld} className="invoer" aria-invalid={b.fout ? true : undefined}>
        {leeg !== undefined && <option value="">{leeg}</option>}
        {opties.map((o) => (
          <option key={o.waarde} value={o.waarde}>
            {o.label}
          </option>
        ))}
      </select>
    </Kader>
  );
}

export function Schakelaar({ naam, label, aan, hint }: { naam: string; label: string; aan?: boolean; hint?: string }) {
  return (
    <div>
      <label className="schakel">
        <input type="checkbox" name={naam} defaultChecked={aan} />
        <span className="schakel-baan" aria-hidden="true" />
        {label}
      </label>
      {hint && <p className="veld-hint">{hint}</p>}
    </div>
  );
}

export function Chips({ naam, label, opties, gekozen = [] }: { naam: string; label: string; opties: Optie[]; gekozen?: string[] }) {
  return (
    <fieldset>
      <legend className="veld-label mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {opties.map((o) => (
          <label key={o.waarde}>
            <input type="checkbox" name={naam} value={o.waarde} defaultChecked={gekozen.includes(o.waarde)} className="sr-only" />
            <span className="chip">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Lijst van korte regels (vereisten, aanbod, profielen). Elke regel is een
 * eigen invoerveld met dezelfde naam, zodat FormData.getAll() de volgorde geeft.
 */
export function LijstVeld({
  naam,
  label,
  waarden = [],
  max = 160,
  maxItems = 20,
  nieuw = "Regel toevoegen",
  hint,
  veld,
  vast,
}: {
  naam: string;
  label: string;
  waarden?: string[];
  max?: number;
  maxItems?: number;
  nieuw?: string;
  hint?: string;
  veld?: string;
  /** Vast aantal regels (geen toevoegen of verwijderen). */
  vast?: boolean;
}) {
  const teller = useRef(0);
  const maakId = () => `r${teller.current++}`;
  const [rijen, setRijen] = useState(() => waarden.map((w) => ({ id: maakId(), w })));
  const doos = useRef<HTMLFieldSetElement>(null);
  const focusOp = useRef<string | null>(null);

  useEffect(() => {
    if (!focusOp.current) return;
    doos.current?.querySelector<HTMLInputElement>(`[data-rij="${focusOp.current}"]`)?.focus();
    focusOp.current = null;
  });

  const verplaats = (i: number, d: -1 | 1) =>
    setRijen((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const n = [...r];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <fieldset ref={doos}>
      <legend className="veld-label mb-1">{label}</legend>
      <ol className="flex flex-col">
        {rijen.map((r, i) => (
          <li key={r.id} className="group flex items-center gap-3">
            <span className="w-5 text-right text-[12px] tabular-nums text-[var(--zwak)]" aria-hidden="true">
              {i + 1}
            </span>
            <input
              name={naam}
              defaultValue={r.w}
              maxLength={max}
              data-rij={r.id}
              data-veld={veld ? `${veld}.${i}` : undefined}
              aria-label={`${label}, regel ${i + 1}`}
              className="invoer flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !vast) {
                  e.preventDefault();
                  if (rijen.length >= maxItems) return;
                  const id = maakId();
                  focusOp.current = id;
                  setRijen((x) => [...x.slice(0, i + 1), { id, w: "" }, ...x.slice(i + 1)]);
                }
              }}
            />
            {!vast && (
              <span className="flex gap-1 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                <button type="button" className="knop knop-stil knop-klein !px-2.5" onClick={() => verplaats(i, -1)} disabled={i === 0} aria-label={`Regel ${i + 1} omhoog`}>
                  Op
                </button>
                <button type="button" className="knop knop-stil knop-klein !px-2.5" onClick={() => verplaats(i, 1)} disabled={i === rijen.length - 1} aria-label={`Regel ${i + 1} omlaag`}>
                  Neer
                </button>
                <button type="button" className="knop knop-gevaar knop-klein !px-2.5" onClick={() => setRijen((x) => x.filter((y) => y.id !== r.id))} aria-label={`Regel ${i + 1} verwijderen`}>
                  Weg
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!vast && rijen.length < maxItems && (
        <button
          type="button"
          className="tekstknop mt-3"
          onClick={() => {
            const id = maakId();
            focusOp.current = id;
            setRijen((x) => [...x, { id, w: "" }]);
          }}
        >
          {nieuw}
        </button>
      )}
      {hint && <p className="veld-hint">{hint}</p>}
    </fieldset>
  );
}
