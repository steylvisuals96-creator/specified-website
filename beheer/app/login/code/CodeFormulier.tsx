"use client";

import { useActionState } from "react";
import { codeControleren, uitloggen } from "@/lib/auth-acties";
import { LEEG } from "@/lib/formulier";

export default function CodeFormulier() {
  const [staat, actie, bezig] = useActionState(codeControleren, LEEG);
  return (
    <>
      <form action={actie} className="paneel blad flex flex-col gap-6">
        <div>
          <label className="veld-label" htmlFor="code">
            Code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            autoFocus
            className="invoer text-[26px] tracking-[0.3em] tabular-nums"
          />
        </div>
        {staat.melding && (
          <p role="alert" className="veld-fout !mt-0">
            {staat.melding}
          </p>
        )}
        <button className="knop self-start" disabled={bezig}>
          {bezig ? "Controleren" : "Bevestigen"}
        </button>
      </form>
      <form action={uitloggen} className="mt-6">
        <button className="tekstknop">Ander account gebruiken</button>
      </form>
    </>
  );
}
