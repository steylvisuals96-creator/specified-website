"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { slaVacatureOp } from "@/lib/acties/vacatures";
import type { Resultaat } from "@/lib/formulier";
import type { Vacature } from "@/lib/data";
import { CONTRACTEN, ERVARING, OPLEIDING, STATUSSEN, TALEN, UREN, VAKGEBIEDEN } from "@/lib/opties";
import { Chips, Keuze, LijstVeld, Schakelaar, Tekstveld } from "./Velden";
import RichTekst from "./RichTekst";
import OpslaanBalk from "./OpslaanBalk";
import Voorbeeld, { type VoorbeeldBericht } from "./Voorbeeld";

/**
 * Vacature bewerken, met vanaf 1280 px de echte vacaturepagina ernaast. Klik je
 * in een veld, dan scrollt het voorbeeld naar dat stuk (zelfde werking als de
 * homepage). Het salaris komt nooit in het voorbeeld: het is intern.
 */
export default function VacatureFormulier({
  vacature,
  websiteUrl,
  nieuwOpgeslagen,
}: {
  vacature?: Vacature & { salaris: string };
  websiteUrl: string;
  nieuwOpgeslagen?: boolean;
}) {
  const start: Resultaat = nieuwOpgeslagen ? { ok: true, melding: "Aangemaakt", opgeslagen: new Date().toISOString() } : { ok: false };
  const [staat, actie] = useActionState(slaVacatureOp, start);
  const v = vacature;
  const f = staat.velden ?? {};
  const form = useRef<HTMLFormElement>(null);
  const veldRef = useRef<{ veld: string | null; label?: string }>({ veld: null });
  const [bericht, setBericht] = useState<VoorbeeldBericht>({ data: null, veld: null });

  // Het formulier in de vorm van een rij uit de tabel vacatures; de website maakt er de pagina van.
  const stuur = useCallback(() => {
    if (!form.current) return;
    const fd = new FormData(form.current);
    const s = (k: string) => String(fd.get(k) ?? "").trim();
    const l = (k: string) => fd.getAll(k).map((x) => String(x).trim()).filter(Boolean);
    let beschrijving: unknown = null;
    try {
      beschrijving = s("beschrijving") ? JSON.parse(s("beschrijving")) : null;
    } catch {
      beschrijving = null;
    }
    setBericht({
      ...veldRef.current,
      data: {
        slug: v?.slug,
        titel: s("titel"),
        vakgebied: s("vakgebied"),
        contract: s("contract"),
        status: s("status"),
        locatie: s("locatie"),
        ervaring: s("ervaring") || null,
        uren: s("uren") || null,
        opleiding: s("opleiding") || null,
        talen: l("talen"),
        beschrijving,
        vereisten: l("vereisten"),
        nice_to_have: l("nice_to_have"),
        aanbod: l("aanbod"),
        geplaatst_op: s("geplaatst_op") || null,
      },
    });
  }, [v?.slug]);

  const wacht = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bijInvoer = () => {
    if (wacht.current) clearTimeout(wacht.current);
    wacht.current = setTimeout(stuur, 150);
  };
  useEffect(() => {
    stuur();
    return () => void (wacht.current && clearTimeout(wacht.current));
  }, [stuur]);

  const bijFocus = (e: React.FocusEvent<HTMLFormElement>) => {
    const el = e.target as HTMLElement;
    const veld = el.dataset.veld ?? (el as HTMLInputElement).name ?? null;
    if (!veld || veld === veldRef.current.veld || veld === "salaris") return;
    const label = el.closest("div, li, fieldset")?.querySelector("label, legend, .veld-label")?.textContent ?? undefined;
    veldRef.current = { veld, label };
    stuur();
  };
  const bijBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (form.current?.contains(e.relatedTarget as Node)) return;
    veldRef.current = { veld: null };
    stuur();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
      <form id="vacature" ref={form} action={actie} onInput={bijInvoer} onChange={bijInvoer} onFocus={bijFocus} onBlur={bijBlur} noValidate className="min-w-0">
        {v && <input type="hidden" name="id" value={v.id} />}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-1 items-start">
          <div className="flex flex-col gap-6 min-w-0">
            <section className="paneel blad flex flex-col gap-7">
              <Tekstveld naam="titel" veld="titel" label="Functietitel" waarde={v?.titel} max={120} verplicht fout={f.titel} placeholder="Bijvoorbeeld Automation Engineer" />
              <RichTekst naam="beschrijving" label="Jobomschrijving" waarde={v?.beschrijving} placeholder="Wat ga je doen, bij welk soort klanten, in welk team?" />
            </section>
            <section className="paneel flex flex-col gap-8">
              <LijstVeld naam="vereisten" veld="vereisten" label="Profiel: wat vragen we" waarden={v?.vereisten} nieuw="Vereiste toevoegen" hint="Eén vereiste per regel. Enter maakt een nieuwe regel." />
              <LijstVeld naam="nice_to_have" veld="nice_to_have" label="Mooi meegenomen" waarden={v?.nice_to_have} nieuw="Punt toevoegen" />
              <LijstVeld naam="aanbod" veld="aanbod" label="Wat we bieden" waarden={v?.aanbod} nieuw="Voordeel toevoegen" />
            </section>
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-6 xl:static">
            <section className="paneel flex flex-col gap-6">
              <Keuze naam="status" veld="status" label="Status" waarde={v?.status ?? "actief"} opties={STATUSSEN} fout={f.status} hint="Actief en ingevuld staan op de website." />
              <Schakelaar naam="zichtbaar" label="Toon op de website" aan={v ? v.zichtbaar : true} />
              {v && (
                <div>
                  <p className="veld-label">Adres op de website</p>
                  <a href={`${websiteUrl}/vacatures/${v.slug}`} target="_blank" rel="noopener noreferrer" className="tekstknop break-all">
                    /vacatures/{v.slug}
                  </a>
                  <p className="veld-hint">Blijft vast, ook als de titel verandert.</p>
                </div>
              )}
            </section>
            <section className="paneel flex flex-col gap-6">
              <Keuze naam="vakgebied" veld="vakgebied" label="Vakgebied" waarde={v?.vakgebied} opties={VAKGEBIEDEN} leeg="Kies een vakgebied" verplicht fout={f.vakgebied} />
              <Keuze naam="contract" veld="contract" label="Contract" waarde={v?.contract ?? "vast"} opties={CONTRACTEN} verplicht fout={f.contract} />
              <Tekstveld naam="locatie" veld="locatie" label="Locatie" waarde={v?.locatie ?? "België"} max={80} />
              <Keuze naam="uren" veld="uren" label="Uren" waarde={v?.uren} opties={UREN} leeg="Niet vermelden" />
              <Keuze naam="ervaring" veld="ervaring" label="Ervaring" waarde={v?.ervaring} opties={ERVARING} leeg="Niet vermelden" />
              <Keuze naam="opleiding" veld="opleiding" label="Opleiding" waarde={v?.opleiding} opties={OPLEIDING} leeg="Niet vermelden" />
              <Chips naam="talen" label="Talen" opties={TALEN} gekozen={v?.talen} />
              <Tekstveld naam="geplaatst_op" veld="geplaatst_op" label="Plaatsingsdatum" type="date" waarde={v?.geplaatst_op ?? ""} hint="Leeg bij een nieuwe vacature wordt vandaag." />
            </section>
            <section className="paneel flex flex-col gap-6">
              <Tekstveld naam="salaris" label="Salaris (intern)" waarde={v?.salaris} max={120} hint="Komt nooit op de website: staat in een aparte, afgeschermde tabel." />
            </section>
          </aside>
        </div>
        <OpslaanBalk staat={staat} formId="vacature" label={v ? "Opslaan" : "Vacature aanmaken"} />
      </form>

      <div className="hidden xl:block sticky top-6 h-[calc(100dvh-3rem)]">
        <Voorbeeld websiteUrl={websiteUrl} pad="/voorbeeld/vacature" bericht={bericht} />
      </div>
    </div>
  );
}
