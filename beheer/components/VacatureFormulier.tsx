"use client";

import { useActionState } from "react";
import { slaVacatureOp } from "@/lib/acties/vacatures";
import type { Resultaat } from "@/lib/formulier";
import type { Vacature } from "@/lib/data";
import { CONTRACTEN, ERVARING, OPLEIDING, STATUSSEN, TALEN, UREN, VAKGEBIEDEN } from "@/lib/opties";
import { Chips, Keuze, LijstVeld, Schakelaar, Tekstveld } from "./Velden";
import RichTekst from "./RichTekst";
import OpslaanBalk from "./OpslaanBalk";

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

  return (
    <form id="vacature" action={actie} noValidate>
      {v && <input type="hidden" name="id" value={v.id} />}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <section className="paneel blad flex flex-col gap-7">
            <Tekstveld naam="titel" label="Functietitel" waarde={v?.titel} max={120} verplicht fout={f.titel} placeholder="Bijvoorbeeld Automation Engineer" />
            <RichTekst naam="beschrijving" label="Jobomschrijving" waarde={v?.beschrijving} placeholder="Wat ga je doen, bij welk soort klanten, in welk team?" />
          </section>
          <section className="paneel flex flex-col gap-8">
            <LijstVeld naam="vereisten" label="Profiel: wat vragen we" waarden={v?.vereisten} nieuw="Vereiste toevoegen" hint="Eén vereiste per regel. Enter maakt een nieuwe regel." />
            <LijstVeld naam="nice_to_have" label="Mooi meegenomen" waarden={v?.nice_to_have} nieuw="Punt toevoegen" />
            <LijstVeld naam="aanbod" label="Wat we bieden" waarden={v?.aanbod} nieuw="Voordeel toevoegen" />
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
          <section className="paneel flex flex-col gap-6">
            <Keuze naam="status" label="Status" waarde={v?.status ?? "actief"} opties={STATUSSEN} fout={f.status} hint="Actief en ingevuld staan op de website." />
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
            <Keuze naam="vakgebied" label="Vakgebied" waarde={v?.vakgebied} opties={VAKGEBIEDEN} leeg="Kies een vakgebied" verplicht fout={f.vakgebied} />
            <Keuze naam="contract" label="Contract" waarde={v?.contract ?? "vast"} opties={CONTRACTEN} verplicht fout={f.contract} />
            <Tekstveld naam="locatie" label="Locatie" waarde={v?.locatie ?? "België"} max={80} />
            <Keuze naam="uren" label="Uren" waarde={v?.uren} opties={UREN} leeg="Niet vermelden" />
            <Keuze naam="ervaring" label="Ervaring" waarde={v?.ervaring} opties={ERVARING} leeg="Niet vermelden" />
            <Keuze naam="opleiding" label="Opleiding" waarde={v?.opleiding} opties={OPLEIDING} leeg="Niet vermelden" />
            <Chips naam="talen" label="Talen" opties={TALEN} gekozen={v?.talen} />
            <Tekstveld naam="geplaatst_op" label="Plaatsingsdatum" type="date" waarde={v?.geplaatst_op ?? ""} hint="Leeg bij een nieuwe vacature wordt vandaag." />
          </section>
          <section className="paneel flex flex-col gap-6">
            <Tekstveld naam="salaris" label="Salaris (intern)" waarde={v?.salaris} max={120} hint="Komt nooit op de website: staat in een aparte, afgeschermde tabel." />
          </section>
        </aside>
      </div>
      <OpslaanBalk staat={staat} formId="vacature" label={v ? "Opslaan" : "Vacature aanmaken"} />
    </form>
  );
}
