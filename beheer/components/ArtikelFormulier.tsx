"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import { slaArtikelOp } from "@/lib/acties/blog";
import type { Resultaat } from "@/lib/formulier";
import type { Artikel, Media, Teamlid } from "@/lib/data";
import { Keuze, Tekstvak, Tekstveld } from "./Velden";
import RichTekst from "./RichTekst";
import MediaKiezer from "./MediaKiezer";
import OpslaanBalk from "./OpslaanBalk";
import Voorbeeld, { type VoorbeeldBericht } from "./Voorbeeld";

export default function ArtikelFormulier({
  artikel,
  team,
  media,
  websiteUrl,
  beheerUrl,
  nieuwOpgeslagen,
}: {
  artikel?: Artikel;
  team: Pick<Teamlid, "id" | "voornaam" | "achternaam">[];
  media: Pick<Media, "id" | "alt" | "bestandsnaam">[];
  websiteUrl: string;
  beheerUrl: string;
  nieuwOpgeslagen?: boolean;
}) {
  const start: Resultaat = nieuwOpgeslagen ? { ok: true, melding: "Aangemaakt", opgeslagen: new Date().toISOString() } : { ok: false };
  const [staat, actie] = useActionState(slaArtikelOp, start);
  const a = artikel;
  const f = staat.velden ?? {};
  const form = useRef<HTMLFormElement>(null);
  const inhoud = useRef<unknown>(a?.inhoud ?? null);

  // Het voorbeeld krijgt de vorm die de artikelpagina van de website al kent.
  const maakData = useCallback(() => {
    if (!form.current) return {};
    const fd = new FormData(form.current);
    const s = (k: string) => String(fd.get(k) ?? "");
    const auteur = team.find((t) => t.id === s("auteur_id"));
    const coverId = s("cover_id");
    return {
      titel: s("titel"),
      samenvatting: s("samenvatting"),
      publicatiedatum: s("publicatiedatum"),
      cover_url: coverId ? `${beheerUrl}/m/${coverId}` : s("cover_url") || undefined,
      auteur: auteur ? { voornaam: auteur.voornaam, achternaam: auteur.achternaam } : undefined,
      inhoud: inhoud.current,
    };
  }, [team, beheerUrl]);

  const [bericht, setBericht] = useState<VoorbeeldBericht>({ data: null, veld: null });
  const wacht = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ververs = () => {
    if (wacht.current) clearTimeout(wacht.current);
    wacht.current = setTimeout(() => setBericht({ data: maakData(), veld: null }), 150);
  };

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
      <form id="artikel" ref={form} action={actie} onInput={ververs} onChange={ververs} onFocus={() => bericht.data === null && ververs()} noValidate className="min-w-0">
        {a && <input type="hidden" name="id" value={a.id} />}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-1 items-start">
          <section className="paneel blad flex flex-col gap-7 min-w-0">
            <Tekstveld naam="titel" label="Titel" waarde={a?.titel} max={160} verplicht fout={f.titel} />
            <Tekstvak naam="samenvatting" label="Korte samenvatting" waarde={a?.samenvatting} max={400} rijen={3} hint="Eén of twee zinnen. Staat in het overzicht en in Google." />
            <div>
              <RichTekst
                naam="inhoud"
                label="Artikel"
                waarde={a?.inhoud}
                onWijzig={(doc) => {
                  inhoud.current = doc;
                  ververs();
                }}
              />
              {f.inhoud && <p className="veld-fout">{f.inhoud}</p>}
            </div>
          </section>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-6 2xl:static">
            <section className="paneel flex flex-col gap-6">
              <Keuze
                naam="status"
                label="Status"
                waarde={a?.status ?? "concept"}
                opties={[
                  { waarde: "concept", label: "Concept (niet zichtbaar)" },
                  { waarde: "gepubliceerd", label: "Gepubliceerd" },
                ]}
              />
              <Tekstveld naam="publicatiedatum" label="Publicatiedatum" type="date" waarde={a?.publicatiedatum ?? new Date().toISOString().slice(0, 10)} hint="Een datum in de toekomst verschijnt pas op die dag." />
              <Keuze naam="auteur_id" label="Auteur" waarde={a?.auteur_id} leeg="Geen auteur" opties={team.map((t) => ({ waarde: t.id, label: `${t.voornaam} ${t.achternaam}`.trim() }))} />
            </section>
            <section className="paneel flex flex-col gap-6">
              <MediaKiezer naam="cover_id" label="Coverbeeld" waarde={a?.cover_id} media={media} onWijzig={ververs} />
              <Tekstveld naam="cover_url" label="Of een extern beeld (https)" waarde={a?.cover_url} max={500} fout={f.cover_url} hint="Alleen als er geen beeld gekozen is." />
            </section>
            <section className="paneel flex flex-col gap-6">
              <Tekstveld naam="slug" label="Adres op de website" waarde={a?.slug} max={140} fout={f.slug} hint={a ? "Pas je dit aan, dan werkt de oude link niet meer." : "Leeg laten: wordt gemaakt uit de titel."} />
              <Tekstveld naam="meta_titel" label="Titel in Google" waarde={a?.meta_titel} max={70} hint="Leeg: de titel van het artikel." />
              <Tekstvak naam="meta_beschrijving" label="Beschrijving in Google" waarde={a?.meta_beschrijving} max={170} rijen={2} hint="Leeg: de samenvatting." />
            </section>
          </aside>
        </div>
        <OpslaanBalk staat={staat} formId="artikel" label={a ? "Opslaan" : "Artikel aanmaken"} />
      </form>

      <div className="hidden 2xl:block sticky top-6 h-[calc(100dvh-3rem)]">
        <Voorbeeld websiteUrl={websiteUrl} pad="/blog/voorbeeld" bericht={bericht} />
      </div>
    </div>
  );
}
