import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export type Rol = "creator" | "beheerder" | "redacteur";

export type Sessie = {
  id: string;
  email: string;
  naam: string;
  rol: Rol;
  /** Heeft een geverifieerde tweestapslogin ingesteld. */
  tweestapAan: boolean;
  /** Moet eerst tweestapslogin instellen (MFA_VERPLICHT=1) voor hij verder mag. */
  tweestapNodig: boolean;
};

export const isBeheerder = (s: Pick<Sessie, "rol">) => s.rol === "creator" || s.rol === "beheerder";

type Stand =
  | { soort: "uit" }
  | { soort: "code" } // wachtwoord klopt, code uit de app ontbreekt nog
  | { soort: "geenProfiel" } // wel een account, maar geen toegang tot het beheer
  | { soort: "in"; sessie: Sessie };

/**
 * Waar de bezoeker staat. De proxy kijkt alleen of er een geldig token is;
 * hier, met de geverifieerde gebruiker, komen tweede stap en rol erbij.
 * Het tweestapsniveau komt uit het gecontroleerde token, de factoren van de
 * geverifieerde gebruiker (niet uit de onbevestigde sessie).
 */
export const sessieStand = cache(async (): Promise<Stand> => {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { soort: "uit" };

  const heeftFactor = (user.factors ?? []).some((f) => f.status === "verified");
  const { data: token } = await sb.auth.getClaims();
  const tweestapAan = token?.claims?.aal === "aal2";
  if (heeftFactor && !tweestapAan) return { soort: "code" };

  const { data: profiel } = await sb.from("profielen").select("naam, rol").eq("id", user.id).maybeSingle();
  if (!profiel) return { soort: "geenProfiel" };

  return {
    soort: "in",
    sessie: {
      id: user.id,
      email: user.email ?? "",
      naam: profiel.naam || user.email || "",
      rol: profiel.rol as Rol,
      tweestapAan,
      tweestapNodig: process.env.MFA_VERPLICHT === "1" && !tweestapAan,
    },
  };
});

/** De ingelogde gebruiker met zijn rol, of null (niet, of niet volledig ingelogd). */
export async function huidigeSessie(): Promise<Sessie | null> {
  const stand = await sessieStand();
  return stand.soort === "in" ? stand.sessie : null;
}

/** Voor pagina's en acties: zonder geldige sessie naar de juiste stap. */
export async function vereisSessie(opties: { ookZonderTweestap?: boolean } = {}): Promise<Sessie> {
  const stand = await sessieStand();
  // De proxy liet dit verzoek door (token klopt), maar de server kent de gebruiker niet
  // (sessie beëindigd, account weg): netjes uitloggen, anders stuurt /login weer naar /.
  if (stand.soort === "uit") redirect("/auth/uitloggen");
  if (stand.soort === "code") redirect("/login/code");
  if (stand.soort === "geenProfiel") redirect("/auth/uitloggen?reden=geen-toegang");
  const s = stand.sessie;
  if (s.tweestapNodig && !opties.ookZonderTweestap) redirect("/account?tweestap=verplicht");
  return s;
}

export async function vereisBeheerder(): Promise<Sessie> {
  const s = await vereisSessie();
  if (!isBeheerder(s)) redirect("/");
  return s;
}
