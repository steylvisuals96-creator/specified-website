"use client";

import { useActionState } from "react";
import { wachtwoordZetten } from "@/lib/account-acties";
import { LEEG } from "@/lib/formulier";

export default function WachtwoordFormulier({ naHerstel = false }: { naHerstel?: boolean }) {
  const [staat, actie, bezig] = useActionState(wachtwoordZetten, LEEG);
  return (
    <form action={actie} className={`flex flex-col gap-6 ${naHerstel ? "paneel blad" : ""}`}>
      {naHerstel && <input type="hidden" name="naHerstel" value="1" />}
      <div>
        <label className="veld-label" htmlFor="wachtwoord">
          Nieuw wachtwoord
        </label>
        <input
          id="wachtwoord"
          name="wachtwoord"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          className="invoer"
          aria-invalid={Boolean(staat.velden?.wachtwoord)}
        />
        {staat.velden?.wachtwoord && <p className="veld-fout">{staat.velden.wachtwoord}</p>}
      </div>
      <div>
        <label className="veld-label" htmlFor="herhaal">
          Nog eens
        </label>
        <input
          id="herhaal"
          name="herhaal"
          type="password"
          autoComplete="new-password"
          required
          className="invoer"
          aria-invalid={Boolean(staat.velden?.herhaal)}
        />
        {staat.velden?.herhaal && <p className="veld-fout">{staat.velden.herhaal}</p>}
      </div>
      {staat.melding && (
        <p role="status" className={staat.ok ? "text-[13.5px]" : "veld-fout !mt-0"}>
          {staat.melding}
        </p>
      )}
      <button className="knop self-start" disabled={bezig}>
        {bezig ? "Opslaan" : naHerstel ? "Wachtwoord instellen" : "Wachtwoord wijzigen"}
      </button>
    </form>
  );
}
