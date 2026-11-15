"use client";

import { useActionState } from "react";
import { naamWijzigen } from "@/lib/account-acties";

export default function NaamFormulier({ naam }: { naam: string }) {
  const [staat, actie, bezig] = useActionState(naamWijzigen, { ok: false });
  return (
    <form action={actie} className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[220px]">
        <label className="veld-label" htmlFor="naam">
          Naam
        </label>
        <input id="naam" name="naam" defaultValue={naam} maxLength={80} required className="invoer" />
        {staat.velden?.naam && <p className="veld-fout">{staat.velden.naam}</p>}
      </div>
      <button className="knop knop-stil" disabled={bezig}>
        {staat.ok ? "Bewaard" : "Bewaar"}
      </button>
    </form>
  );
}
