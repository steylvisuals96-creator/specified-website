"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { slaPaginaOp } from "@/lib/acties/paginas";
import { uitFormulierPagina, type PaginaDef } from "@/lib/paginas";
import { LijstVeld, Tekstvak, Tekstveld } from "./Velden";
import ItemsVeld from "./ItemsVeld";
import OpslaanBalk from "./OpslaanBalk";
import Voorbeeld, { type VoorbeeldBericht } from "./Voorbeeld";
import { voorbeeldPad, type Taal } from "@/lib/taal";

/**
 * Eén editor voor elke doorklikpagina, gebouwd uit de beschrijving die de
 * website geeft. Zelfde werking als de homepage: velden links, de echte pagina
 * rechts, en het voorbeeld scrollt naar het veld waarin je typt.
 */
export default function PaginaEditor({ def, waarde, websiteUrl, taal = "nl" }: { def: PaginaDef; waarde: Record<string, unknown>; websiteUrl: string; taal?: Taal }) {
  const [staat, actie] = useActionState(slaPaginaOp, { ok: false });
  const form = useRef<HTMLFormElement>(null);
  const [bericht, setBericht] = useState<VoorbeeldBericht>({ data: waarde, veld: null });
  const veldRef = useRef<{ veld: string | null; label?: string }>({ veld: null });
  const f = staat.velden ?? {};

  const stuur = useCallback(() => {
    if (!form.current) return;
    setBericht({ data: uitFormulierPagina(def, new FormData(form.current)), ...veldRef.current });
  }, [def]);

  const wacht = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bijInvoer = () => {
    if (wacht.current) clearTimeout(wacht.current);
    wacht.current = setTimeout(stuur, 120);
  };
  useEffect(() => () => void (wacht.current && clearTimeout(wacht.current)), []);

  const bijFocus = (e: React.FocusEvent<HTMLFormElement>) => {
    const el = e.target as HTMLElement;
    const veld = el.dataset.veld ?? (el as HTMLInputElement).name ?? null;
    if (!veld || veld === veldRef.current.veld) return;
    const label = el.closest("div, li, fieldset")?.querySelector("label, legend")?.textContent ?? undefined;
    veldRef.current = { veld, label };
    stuur();
  };
  const bijBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (form.current?.contains(e.relatedTarget as Node)) return;
    veldRef.current = { veld: null };
    stuur();
  };

  const tekst = (k: string) => (typeof waarde[k] === "string" ? (waarde[k] as string) : "");

  return (
    <div className="grid gap-5 lg:gap-6 lg:grid-cols-[minmax(320px,440px)_minmax(0,1fr)] items-start">
      <form id="pagina" ref={form} action={actie} onInput={bijInvoer} onChange={bijInvoer} onFocus={bijFocus} onBlur={bijBlur} noValidate className="min-w-0 order-2 lg:order-none">
        <input type="hidden" name="__pagina" value={def.sleutel} />
        <input type="hidden" name="__taal" value={taal} />
        <div className="flex flex-col gap-5">
          {def.groepen.map((g, gi) => (
            <section key={g.titel} className={`paneel flex flex-col gap-6 ${gi === 0 ? "blad" : ""}`}>
              <div>
                <h2 className="text-[30px]">{g.titel}</h2>
                {g.uitleg && <p className="text-[13.5px] zwak mt-1.5">{g.uitleg}</p>}
              </div>
              {g.velden.map((v) => {
                if (v.soort === "tekst")
                  return <Tekstveld key={v.sleutel} naam={v.sleutel} veld={v.sleutel} label={v.label} waarde={tekst(v.sleutel)} max={v.max} placeholder={v.standaard} hint={v.hint} fout={f[v.sleutel]} />;
                if (v.soort === "tekstvak")
                  return <Tekstvak key={v.sleutel} naam={v.sleutel} veld={v.sleutel} label={v.label} waarde={tekst(v.sleutel)} max={v.max} placeholder={v.standaard} hint={v.hint} fout={f[v.sleutel]} rijen={3} />;
                if (v.soort === "lijst") {
                  const opgeslagen = Array.isArray(waarde[v.sleutel]) ? (waarde[v.sleutel] as string[]) : [];
                  return (
                    <LijstVeld
                      key={v.sleutel}
                      naam={v.sleutel}
                      veld={v.sleutel}
                      label={v.label}
                      waarden={opgeslagen.length ? opgeslagen : v.standaard}
                      max={v.max}
                      maxItems={v.maxItems}
                      hint={v.hint ?? "Eén per regel. Enter maakt een nieuwe regel."}
                    />
                  );
                }
                if (v.soort !== "items") return null;
                const opgeslagen = Array.isArray(waarde[v.sleutel]) ? (waarde[v.sleutel] as Record<string, string>[]) : undefined;
                return (
                  <ItemsVeld key={v.sleutel} naam={v.sleutel} label={v.label} velden={v.velden} waarden={opgeslagen} standaard={v.standaard} maxItems={v.maxItems} hint={v.hint} fouten={f} />
                );
              })}
            </section>
          ))}
        </div>
        <OpslaanBalk staat={staat} formId="pagina" />
      </form>

      <div className="order-1 lg:order-none sticky z-10 top-[calc(env(safe-area-inset-top)+52px)] md:top-2 lg:top-6 h-[42dvh] lg:h-[calc(100dvh-3rem)] -mx-1 px-1 pb-2 lg:pb-0 bg-[var(--grond)] lg:bg-transparent">
        <Voorbeeld key={taal} websiteUrl={websiteUrl} pad={voorbeeldPad(`/voorbeeld/pagina/${def.voorbeeld}?bewerk=${def.sleutel}`, taal)} bericht={bericht} />
      </div>
    </div>
  );
}
