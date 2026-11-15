"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { slaTeamlidOp } from "@/lib/acties/team";
import type { Resultaat } from "@/lib/formulier";
import type { Media, Teamlid } from "@/lib/data";
import { Schakelaar, Tekstvak, Tekstveld } from "./Velden";
import MediaKiezer from "./MediaKiezer";
import OpslaanBalk from "./OpslaanBalk";
import Voorbeeld, { type VoorbeeldBericht } from "./Voorbeeld";

export default function TeamFormulier({
  lid,
  media,
  websiteUrl,
  beheerUrl,
  nieuwOpgeslagen,
}: {
  lid?: Teamlid;
  media: Pick<Media, "id" | "alt" | "bestandsnaam">[];
  websiteUrl: string;
  beheerUrl: string;
  nieuwOpgeslagen?: boolean;
}) {
  const start: Resultaat = nieuwOpgeslagen ? { ok: true, melding: "Aangemaakt", opgeslagen: new Date().toISOString() } : { ok: false };
  const [staat, actie] = useActionState(slaTeamlidOp, start);
  const f = staat.velden ?? {};
  const form = useRef<HTMLFormElement>(null);
  const [bericht, setBericht] = useState<VoorbeeldBericht>({ data: null, veld: null });

  const ververs = () => {
    if (!form.current) return;
    const fd = new FormData(form.current);
    const s = (k: string) => String(fd.get(k) ?? "");
    setBericht({
      veld: null,
      data: {
        voornaam: s("voornaam"),
        achternaam: s("achternaam"),
        rol: s("rol"),
        bio: s("bio"),
        linkedin: s("linkedin"),
        foto: s("foto_id") ? { url: `${beheerUrl}/m/${s("foto_id")}` } : undefined,
      },
    });
  };

  // Meteen de huidige gegevens in het voorbeeld, niet pas na de eerste toetsaanslag.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => ververs(), []);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(340px,480px)_minmax(0,1fr)] items-start">
      <form id="teamlid" ref={form} action={actie} onInput={ververs} onChange={ververs} noValidate className="min-w-0 flex flex-col gap-6">
        {lid && <input type="hidden" name="id" value={lid.id} />}
        <section className="paneel blad flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <Tekstveld naam="voornaam" label="Voornaam" waarde={lid?.voornaam} max={60} verplicht fout={f.voornaam} />
            <Tekstveld naam="achternaam" label="Achternaam" waarde={lid?.achternaam} max={60} />
          </div>
          <Tekstveld naam="rol" label="Functie" waarde={lid?.rol} max={60} placeholder="Bijvoorbeeld Managing Partner" />
          <Tekstvak naam="bio" label="Korte bio" waarde={lid?.bio} max={1200} rijen={4} />
          <MediaKiezer naam="foto_id" label="Foto" waarde={lid?.foto_id} media={media} onWijzig={ververs} />
        </section>
        <section className="paneel flex flex-col gap-6">
          <Tekstveld naam="email" label="E-mail" type="email" waarde={lid?.email} max={120} fout={f.email} />
          <Tekstveld naam="linkedin" label="LinkedIn" waarde={lid?.linkedin} max={200} fout={f.linkedin} />
          <div className="grid sm:grid-cols-2 gap-6 items-end">
            <Tekstveld naam="volgorde" label="Volgorde" type="number" waarde={String(lid?.volgorde ?? 99)} hint="Lager staat eerder." />
            <Schakelaar naam="actief" label="Toon op de website" aan={lid ? lid.actief : true} />
          </div>
        </section>
        <OpslaanBalk staat={staat} formId="teamlid" label={lid ? "Opslaan" : "Teamlid toevoegen"} />
      </form>
      <div className="hidden xl:block sticky top-6 h-[calc(100dvh-3rem)]">
        <Voorbeeld websiteUrl={websiteUrl} pad={`/voorbeeld/team${lid ? `?id=${lid.id}` : ""}`} bericht={bericht} />
      </div>
    </div>
  );
}
