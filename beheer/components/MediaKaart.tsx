"use client";

import { useActionState } from "react";
import { altWijzigen, verwijderMedia } from "@/lib/acties/media";
import type { Media } from "@/lib/data";
import VerwijderKnop from "./VerwijderKnop";

const grootte = (b: number) => (b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.round(b / 1000)} kB`);

export default function MediaKaart({ m }: { m: Media }) {
  const [staat, actie, bezig] = useActionState(altWijzigen, { ok: false });
  return (
    <li className="glas overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-[rgba(0,0,0,.25)] grid place-items-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/m/${m.id}`} alt={m.alt} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-[13px] truncate" title={m.bestandsnaam}>
          {m.bestandsnaam}
        </p>
        <p className="text-[12px] zwak -mt-2">
          {m.breedte && m.hoogte ? `${m.breedte} x ${m.hoogte}, ` : ""}
          {grootte(m.grootte)}
        </p>
        <form action={actie} className="flex items-end gap-2">
          <input type="hidden" name="id" value={m.id} />
          <div className="flex-1">
            <label className="veld-label" htmlFor={`alt-${m.id}`}>
              Omschrijving voor schermlezers
            </label>
            <input id={`alt-${m.id}`} name="alt" defaultValue={m.alt} maxLength={200} className="invoer text-[14px]" placeholder="Wat staat er op de foto?" />
          </div>
          <button className="knop knop-stil knop-klein" disabled={bezig}>
            {staat.ok ? "Bewaard" : "Bewaar"}
          </button>
        </form>
        <div className="mt-auto pt-1 [&_.knop]:min-h-[32px] [&_.knop]:text-[13px] [&_.knop]:px-3">
          <VerwijderKnop actie={verwijderMedia} id={m.id} wat={`het beeld ${m.bestandsnaam}`} />
        </div>
      </div>
    </li>
  );
}
