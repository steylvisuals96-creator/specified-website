"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "./supabase/server";
import { vereisSessie } from "./sessie";
import { tekst, type Resultaat } from "./formulier";

const nu = () => new Date().toISOString();

/** Nieuw wachtwoord, na een uitnodigings- of herstellink of vanuit Account. */
export async function wachtwoordZetten(_: Resultaat, fd: FormData): Promise<Resultaat> {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const nieuw = typeof fd.get("wachtwoord") === "string" ? (fd.get("wachtwoord") as string) : "";
  const herhaal = typeof fd.get("herhaal") === "string" ? (fd.get("herhaal") as string) : "";
  if (nieuw.length < 12) return { ok: false, velden: { wachtwoord: "Minstens 12 tekens." } };
  if (nieuw.length > 128) return { ok: false, velden: { wachtwoord: "Hoogstens 128 tekens." } };
  if (nieuw !== herhaal) return { ok: false, velden: { herhaal: "De twee wachtwoorden zijn niet gelijk." } };

  const { error } = await sb.auth.updateUser({ password: nieuw });
  if (error) {
    const zwak = /weak|pwned|leaked|short/i.test(error.message);
    return { ok: false, melding: zwak ? "Dat wachtwoord is te zwak of komt voor in gelekte lijsten. Kies een ander." : "Opslaan lukte niet. Probeer het opnieuw." };
  }
  if (fd.get("naHerstel") === "1") redirect("/");
  return { ok: true, melding: "Je wachtwoord is gewijzigd.", opgeslagen: nu() };
}

export async function naamWijzigen(_: Resultaat, fd: FormData): Promise<Resultaat> {
  const s = await vereisSessie({ ookZonderTweestap: true });
  const naam = tekst(fd, "naam", 80);
  if (!naam) return { ok: false, velden: { naam: "Vul je naam in." } };
  const sb = await supabaseServer();
  const { error } = await sb.from("profielen").update({ naam }).eq("id", s.id);
  if (error) return { ok: false, melding: "Opslaan lukte niet." };
  revalidatePath("/", "layout");
  return { ok: true, melding: "Opgeslagen.", opgeslagen: nu() };
}

// ── Tweestapslogin (TOTP) ──────────────────────────────────────────────

export type TweestapStart = { ok: boolean; melding?: string; factorId?: string; qr?: string; geheim?: string };

/** Start het koppelen van een authenticator-app: geeft een QR-code terug. */
export async function tweestapStarten(): Promise<TweestapStart> {
  const s = await vereisSessie({ ookZonderTweestap: true });
  const sb = await supabaseServer();
  // Een eerder, niet afgewerkt koppelpoging opruimen; anders weigert Supabase een nieuwe.
  const { data: factoren } = await sb.auth.mfa.listFactors();
  for (const f of factoren?.all ?? []) {
    if (f.status === "unverified") await sb.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await sb.auth.mfa.enroll({
    factorType: "totp",
    issuer: "Specified",
    friendlyName: `Specified ${s.email}`.slice(0, 60),
  });
  if (error || !data) return { ok: false, melding: "Tweestapslogin starten lukte niet. Probeer het opnieuw." };
  return { ok: true, factorId: data.id, qr: data.totp.qr_code, geheim: data.totp.secret };
}

export async function tweestapBevestigen(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisSessie({ ookZonderTweestap: true });
  const factorId = tekst(fd, "factorId", 64);
  const code = tekst(fd, "code", 10).replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, velden: { code: "De code bestaat uit zes cijfers." } };
  const sb = await supabaseServer();
  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { ok: false, velden: { code: "Die code klopt niet. Controleer of de klok van je telefoon juist staat." } };
  revalidatePath("/", "layout");
  return { ok: true, melding: "Tweestapslogin staat aan. Vanaf nu vragen we bij het inloggen ook een code.", opgeslagen: nu() };
}

export async function tweestapUitzetten(): Promise<Resultaat> {
  const s = await vereisSessie();
  if (process.env.MFA_VERPLICHT === "1") return { ok: false, melding: "Tweestapslogin is verplicht voor dit beheer." };
  if (!s.tweestapAan) return { ok: false, melding: "Tweestapslogin stond niet aan." };
  const sb = await supabaseServer();
  const { data: factoren } = await sb.auth.mfa.listFactors();
  for (const f of factoren?.all ?? []) await sb.auth.mfa.unenroll({ factorId: f.id });
  revalidatePath("/", "layout");
  return { ok: true, melding: "Tweestapslogin staat uit.", opgeslagen: nu() };
}
