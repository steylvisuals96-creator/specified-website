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

/**
 * De ingelogde gebruiker met zijn rol, of null. Null ook als de tweede stap
 * (code uit de app) nog ontbreekt, of als er geen profiel is: een account
 * zonder profiel heeft in het beheer niets te zoeken.
 */
export const huidigeSessie = cache(async (): Promise<Sessie | null> => {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: niveau } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (niveau && niveau.nextLevel === "aal2" && niveau.currentLevel !== "aal2") return null;

  const { data: profiel } = await sb.from("profielen").select("naam, rol").eq("id", user.id).maybeSingle();
  if (!profiel) return null;

  const tweestapAan = niveau?.currentLevel === "aal2";
  return {
    id: user.id,
    email: user.email ?? "",
    naam: profiel.naam || user.email || "",
    rol: profiel.rol as Rol,
    tweestapAan,
    tweestapNodig: process.env.MFA_VERPLICHT === "1" && !tweestapAan,
  };
});

/** Voor pagina's en acties: zonder geldige sessie naar het inlogscherm. */
export async function vereisSessie(opties: { ookZonderTweestap?: boolean } = {}): Promise<Sessie> {
  const s = await huidigeSessie();
  if (!s) redirect("/login");
  if (s.tweestapNodig && !opties.ookZonderTweestap) redirect("/account?tweestap=verplicht");
  return s;
}

export async function vereisBeheerder(): Promise<Sessie> {
  const s = await vereisSessie();
  if (!isBeheerder(s)) redirect("/");
  return s;
}
