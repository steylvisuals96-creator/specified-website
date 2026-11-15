"use client";

import { useActionState, useState } from "react";
import { slaSeizoensthemaOp } from "@/lib/acties/seizoensthema";
import { THEMAS, themaOptie, type Instelling } from "@/lib/seizoensthema";

export default function SeizoensthemaFormulier({ instelling, websiteUrl }: { instelling: Instelling; websiteUrl: string }) {
  const [thema, zetThema] = useState(instelling.thema);
  const [vanaf, zetVanaf] = useState(instelling.vanaf ?? "");
  const [tot, zetTot] = useState(instelling.tot_en_met ?? "");
  const [licht, zetLicht] = useState(false);
  const [staat, actie, bezig] = useActionState(slaSeizoensthemaOp, { ok: false });
  const datumfout = staat.velden?.tot_en_met;
  const gewijzigd = thema !== instelling.thema || (
    thema !== "standaard" && (vanaf !== (instelling.vanaf ?? "") || tot !== (instelling.tot_en_met ?? ""))
  );
  const voorbeeldTitel = `Voorbeeld: ${themaOptie(thema)?.naam} in ${licht ? "lichte" : "donkere"} weergave`;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(270px,0.85fr)_minmax(0,1.15fr)]">
      <section className="paneel min-w-0 lg:order-2" aria-labelledby="seizoenvoorbeeld">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 id="seizoenvoorbeeld" className="text-[30px]">Voorbeeld</h2>
          <button className="knop knop-stil knop-klein" type="button" onClick={() => zetLicht(!licht)}>
            {licht ? "Bekijk donker" : "Bekijk licht"}
          </button>
        </div>
        <iframe
          className="block w-full aspect-[4/3] sm:aspect-[16/10] border border-[var(--streep)]"
          title={voorbeeldTitel}
          src={`${websiteUrl.replace(/\/$/, "")}/voorbeeld/seizoen/${thema}/${licht ? "licht" : "donker"}`}
          sandbox="allow-same-origin"
        />
        <p className="mt-3 stil text-sm">Dit voorbeeld is alleen voor jou. Bezoekers kiezen zelf tussen licht en donker.</p>
      </section>

      <form className="paneel min-w-0 lg:order-1" action={actie}>
        <fieldset disabled={bezig}>
          <legend className="kop text-[30px] mb-4">Kies een thema</legend>
          {THEMAS.map((optie) => (
            <label key={optie.id} className="flex gap-3 items-center border-t border-[var(--lijn)] py-2.5 cursor-pointer">
              <input
                type="radio" name="thema" value={optie.id}
                checked={thema === optie.id}
                onChange={() => {
                  zetThema(optie.id);
                  if (optie.id === "standaard") { zetVanaf(""); zetTot(""); }
                }}
                className="size-4 shrink-0 accent-limoen"
              />
              <span>
                <span className="block font-medium">{optie.naam}</span>
                <span className="block stil text-sm">{optie.uitleg}</span>
              </span>
            </label>
          ))}
          {thema !== "standaard" && (
            <div className="border-t border-[var(--lijn)] pt-4 mt-1">
              <p className="font-medium mb-1">Periode <span className="stil font-normal">(optioneel)</span></p>
              <p id="seizoenperiode" className="stil text-sm mb-3">Zonder begindatum gaat het thema meteen in. Na de einddatum keert de standaardstijl terug.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <label className="veld-label min-w-0">
                  Vanaf
                  <input className="invoer mt-1 w-full" type="date" name="vanaf" value={vanaf}
                    onChange={(e) => zetVanaf(e.target.value)} aria-describedby="seizoenperiode" />
                </label>
                <label className="veld-label min-w-0">
                  Tot en met
                  <input className="invoer mt-1 w-full" type="date" name="tot_en_met" value={tot} min={vanaf || undefined}
                    onChange={(e) => zetTot(e.target.value)} aria-invalid={Boolean(datumfout)}
                    aria-describedby={datumfout ? "seizoenperiode thema-melding" : "seizoenperiode"} />
                </label>
              </div>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3 items-center">
            <button className="knop" disabled={bezig || !gewijzigd} type="submit">
              {bezig ? "Opslaan…" : "Thema opslaan"}
            </button>
            <p id="thema-melding" role="status" className={staat.ok ? "stil text-sm" : "veld-fout"}>
              {(!staat.ok || !gewijzigd) && staat.melding}
            </p>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
