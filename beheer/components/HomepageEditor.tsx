"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { slaHomepageOp } from "@/lib/acties/homepage";
import { CALLOUT_LETTERS, CALLOUT_STANDAARD, GROEPEN, PROFIELEN_STANDAARD, lees, uitFormulier } from "@/lib/homepage";
import { LijstVeld, Tekstvak, Tekstveld } from "./Velden";
import OpslaanBalk from "./OpslaanBalk";
import Voorbeeld, { type VoorbeeldBericht } from "./Voorbeeld";

/**
 * Homepage bewerken met de website ernaast. Typ je in een veld, dan scrollt
 * het voorbeeld naar dat stuk van de pagina en zie je de tekst meteen
 * veranderen. Opslaan bewaart de inhoud in het beheer.
 */
export default function HomepageEditor({ waarde, websiteUrl }: { waarde: Record<string, unknown>; websiteUrl: string }) {
  const [staat, actie] = useActionState(slaHomepageOp, { ok: false });
  const form = useRef<HTMLFormElement>(null);
  const [bericht, setBericht] = useState<VoorbeeldBericht>({ data: waarde, veld: null });
  const veldRef = useRef<{ veld: string | null; label?: string }>({ veld: null });
  const f = staat.velden ?? {};

  const stuur = useCallback(() => {
    if (!form.current) return;
    setBericht({ data: uitFormulier(new FormData(form.current)), ...veldRef.current });
  }, []);

  // Typen: kort wachten zodat niet elke toetsaanslag een bericht wordt.
  const wacht = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bijInvoer = () => {
    if (wacht.current) clearTimeout(wacht.current);
    wacht.current = setTimeout(stuur, 120);
  };

  const bijFocus = (e: React.FocusEvent<HTMLFormElement>) => {
    const el = e.target as HTMLElement;
    const veld = el.dataset.veld ?? (el as HTMLInputElement).name ?? null;
    if (!veld || veld === veldRef.current.veld) return;
    const label = el.closest("div, li, fieldset")?.querySelector("label, legend")?.textContent ?? undefined;
    veldRef.current = { veld, label };
    stuur();
  };

  // Na het verlaten van het formulier geen kader meer in het voorbeeld.
  const bijBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (form.current?.contains(e.relatedTarget as Node)) return;
    veldRef.current = { veld: null };
    stuur();
  };

  useEffect(() => () => void (wacht.current && clearTimeout(wacht.current)), []);

  const tekst = (sleutel: string) => {
    const w = lees(waarde, sleutel);
    return typeof w === "string" ? w : "";
  };
  const callouts = Array.isArray(waarde.callouts) ? (waarde.callouts as { label?: string; tekst?: string }[]) : [];
  const profielen = (lees(waarde, "consultants.profielen") as { naam?: string }[] | undefined)?.map((p) => p.naam ?? "").filter(Boolean);

  return (
    // Vanaf 1024 px naast elkaar. Smaller blijft het voorbeeld bovenaan het scherm plakken en schuiven
    // de velden eronder door: zo zie je ook op een tablet het voorbeeld meescrollen.
    <div className="grid gap-5 lg:gap-6 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] items-start">
      <form id="homepage" ref={form} action={actie} onInput={bijInvoer} onChange={bijInvoer} onFocus={bijFocus} onBlur={bijBlur} noValidate className="min-w-0 order-2 lg:order-none">
        <div className="flex flex-col gap-5">
          {GROEPEN.map((g, gi) => (
            <section key={g.sleutel} className={`paneel flex flex-col gap-6 ${gi === 0 ? "blad" : ""}`}>
              <div>
                <h2 className="text-[30px]">{g.titel}</h2>
                {g.uitleg && <p className="text-[13.5px] zwak mt-1.5">{g.uitleg}</p>}
              </div>
              {g.velden.map((v) =>
                v.soort === "tekstvak" ? (
                  <Tekstvak key={v.sleutel} naam={v.sleutel} veld={v.sleutel} label={v.label} waarde={tekst(v.sleutel)} max={v.max} placeholder={v.standaard} fout={f[v.sleutel]} rijen={3} />
                ) : (
                  <Tekstveld
                    key={v.sleutel}
                    naam={v.sleutel}
                    veld={v.sleutel}
                    label={v.label}
                    type={v.soort === "email" ? "email" : "text"}
                    waarde={tekst(v.sleutel)}
                    max={v.max}
                    placeholder={v.standaard}
                    fout={f[v.sleutel]}
                    hint={v.hint}
                  />
                ),
              )}
              {g.sleutel === "tekening" && (
                <fieldset className="flex flex-col gap-4">
                  <legend className="veld-label mb-2">Letters van SPECIFIED, elk met een korte toelichting</legend>
                  {CALLOUT_STANDAARD.map(([label, uitleg], i) => (
                    <div key={i} className="grid grid-cols-[22px_minmax(0,1fr)_minmax(0,1.4fr)] gap-3 items-end">
                      <span className="kop text-[24px] text-[var(--limoen)] pb-1.5" aria-hidden="true">
                        {CALLOUT_LETTERS[i]}
                      </span>
                      <Tekstveld naam={`callouts.${i}.label`} veld={`callouts.${i}.label`} label={`Woord ${i + 1}`} waarde={callouts[i]?.label} max={24} placeholder={label} fout={f[`callouts.${i}.label`]} />
                      <Tekstveld naam={`callouts.${i}.tekst`} veld={`callouts.${i}.tekst`} label="Toelichting" waarde={callouts[i]?.tekst} max={44} placeholder={uitleg} />
                    </div>
                  ))}
                </fieldset>
              )}
              {g.sleutel === "consultants" && (
                <LijstVeld
                  naam="consultants.profielen"
                  veld="consultants.profielen"
                  label="Profielen die meeschuiven met de scroll"
                  waarden={profielen?.length ? profielen : PROFIELEN_STANDAARD}
                  max={36}
                  maxItems={12}
                  nieuw="Profiel toevoegen"
                />
              )}
            </section>
          ))}
        </div>
        <OpslaanBalk staat={staat} formId="homepage" />
      </form>

      <div className="order-1 lg:order-none sticky z-10 top-[calc(env(safe-area-inset-top)+52px)] md:top-2 lg:top-6 h-[42dvh] lg:h-[calc(100dvh-3rem)] -mx-1 px-1 pb-2 lg:pb-0 bg-[var(--grond)] lg:bg-transparent">
        <Voorbeeld websiteUrl={websiteUrl} pad="/voorbeeld/home" bericht={bericht} />
      </div>
    </div>
  );
}
