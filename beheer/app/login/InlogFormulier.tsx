"use client";

import { useActionState } from "react";
import { inloggen } from "@/lib/auth-acties";
import { LEEG } from "@/lib/formulier";

export default function InlogFormulier() {
  const [staat, actie, bezig] = useActionState(inloggen, LEEG);
  return (
    <form action={actie} className="paneel blad flex flex-col gap-6">
      <div>
        <label className="veld-label" htmlFor="email">
          E-mailadres
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus className="invoer" />
      </div>
      <div>
        <label className="veld-label" htmlFor="wachtwoord">
          Wachtwoord
        </label>
        <input id="wachtwoord" name="wachtwoord" type="password" autoComplete="current-password" required className="invoer" />
      </div>
      {staat.melding && (
        <p role="alert" className="veld-fout !mt-0">
          {staat.melding}
        </p>
      )}
      <button className="knop self-start" disabled={bezig}>
        {bezig ? "Bezig met inloggen" : "Inloggen"}
      </button>
    </form>
  );
}
