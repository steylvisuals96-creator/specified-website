"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "./supabase/server";
import { tekst, type Resultaat } from "./formulier";

// Eenvoudige rem per server-instantie: na 5 foute pogingen in 15 minuten per
// IP even niet meer. Supabase Auth heeft daarnaast zijn eigen limieten.
const pogingen = new Map<string, { aantal: number; tot: number }>();
const KWARTIER = 15 * 60 * 1000;

async function ipAdres() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "onbekend";
}

function geremd(ip: string) {
  const p = pogingen.get(ip);
  return Boolean(p && p.tot > Date.now() && p.aantal >= 5);
}

function mislukt(ip: string) {
  const p = pogingen.get(ip);
  if (!p || p.tot < Date.now()) pogingen.set(ip, { aantal: 1, tot: Date.now() + KWARTIER });
  else p.aantal++;
}

export async function inloggen(_: Resultaat, fd: FormData): Promise<Resultaat> {
  const ip = await ipAdres();
  if (geremd(ip)) return { ok: false, melding: "Te veel foute pogingen. Probeer het over een kwartier opnieuw." };

  const email = tekst(fd, "email", 200).toLowerCase();
  const wachtwoord = typeof fd.get("wachtwoord") === "string" ? (fd.get("wachtwoord") as string) : "";
  if (!email || !wachtwoord) return { ok: false, melding: "Vul je e-mailadres en wachtwoord in." };

  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password: wachtwoord });
  if (error) {
    mislukt(ip);
    return { ok: false, melding: "Dat e-mailadres of wachtwoord klopt niet." };
  }
  pogingen.delete(ip);

  // Met tweestapslogin stuurt lib/sessie.ts van hier door naar /login/code.
  redirect("/");
}

/** Tweede stap: de zescijferige code uit de authenticator-app. */
export async function codeControleren(_: Resultaat, fd: FormData): Promise<Resultaat> {
  const ip = await ipAdres();
  if (geremd(ip)) return { ok: false, melding: "Te veel foute pogingen. Probeer het over een kwartier opnieuw." };

  const code = tekst(fd, "code", 10).replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, melding: "De code bestaat uit zes cijfers." };

  const sb = await supabaseServer();
  const { data: factoren } = await sb.auth.mfa.listFactors();
  const factor = factoren?.totp?.find((f) => f.status === "verified");
  if (!factor) redirect("/");

  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) {
    mislukt(ip);
    return { ok: false, melding: "Die code klopt niet of is verlopen. Probeer de volgende." };
  }
  pogingen.delete(ip);
  // Na een herstellink: terug naar het scherm om een nieuw wachtwoord te kiezen.
  redirect(fd.get("verder") === "wachtwoord" ? "/auth/wachtwoord" : "/");
}

export async function uitloggen() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/login");
}
