"use server";

import { revalidatePath } from "next/cache";
import { adminIngesteld, supabaseAdmin, supabaseServer } from "../supabase/server";
import { vereisBeheerder } from "../sessie";
import { tekst, uuidOfNull, type Resultaat } from "../formulier";
import { BEHEER_URL } from "../website";

export type LinkResultaat = Resultaat & { link?: string };

const linkVan = (hash: string, type: "invite" | "recovery") => `${BEHEER_URL}/auth/bevestig?token_hash=${hash}&type=${type}`;

/**
 * Nodigt iemand uit: maakt het account en geeft een link terug die de
 * beheerder zelf bezorgt (mail, Teams). Supabase verstuurt niets, zodat dit
 * werkt zonder eigen mailserver. De link is 24 uur geldig
 * (Supabase: Email OTP expiration, 86400 s).
 */
export async function uitnodigen(_: LinkResultaat, fd: FormData): Promise<LinkResultaat> {
  await vereisBeheerder();
  if (!adminIngesteld()) return { ok: false, melding: "SUPABASE_SECRET_KEY ontbreekt in de instellingen van het beheer." };

  const naam = tekst(fd, "naam", 80);
  const email = tekst(fd, "email", 200).toLowerCase();
  const rol = tekst(fd, "rol", 20);
  const velden: Record<string, string> = {};
  if (!naam) velden.naam = "Vul een naam in.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) velden.email = "Vul een geldig e-mailadres in.";
  if (rol !== "beheerder" && rol !== "redacteur") velden.rol = "Kies een rol.";
  if (Object.keys(velden).length) return { ok: false, velden };

  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email, options: { data: { naam } } });
  if (error || !data?.user) {
    const bestaat = /already|registered|exists/i.test(error?.message ?? "");
    return { ok: false, melding: bestaat ? "Er bestaat al een account met dit e-mailadres. Maak dan een nieuwe inloglink." : "Uitnodigen lukte niet." };
  }
  const { error: profielFout } = await admin.from("profielen").insert({ id: data.user.id, naam, rol });
  if (profielFout) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, melding: "Het profiel aanmaken lukte niet; er is niets bewaard." };
  }
  revalidatePath("/gebruikers");
  return { ok: true, melding: `Account voor ${naam} aangemaakt.`, link: linkVan(data.properties.hashed_token, "invite") };
}

/** Nieuwe inloglink voor wie zijn wachtwoord kwijt is. */
export async function nieuweLink(_: LinkResultaat, fd: FormData): Promise<LinkResultaat> {
  const ik = await vereisBeheerder();
  if (!adminIngesteld()) return { ok: false, melding: "SUPABASE_SECRET_KEY ontbreekt in de instellingen van het beheer." };
  const id = uuidOfNull(tekst(fd, "id", 40));
  if (!id) return { ok: false, melding: "Onbekende gebruiker." };

  // Wat de beheerder via RLS mag zien, mag hij herstellen (dus nooit het creator-account, tenzij hij creator is).
  const sb = await supabaseServer();
  const { data: profiel } = await sb.from("profielen").select("id, rol").eq("id", id).maybeSingle();
  if (!profiel || (profiel.rol === "creator" && ik.rol !== "creator")) return { ok: false, melding: "Onbekende gebruiker." };

  const admin = supabaseAdmin();
  const { data: gebruiker } = await admin.auth.admin.getUserById(id);
  if (!gebruiker?.user?.email) return { ok: false, melding: "Onbekende gebruiker." };
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email: gebruiker.user.email });
  if (error || !data) return { ok: false, melding: "Een link maken lukte niet." };
  return { ok: true, melding: "Nieuwe inloglink, 24 uur geldig.", link: linkVan(data.properties.hashed_token, "recovery") };
}

export async function rolWijzigen(fd: FormData) {
  const ik = await vereisBeheerder();
  const id = uuidOfNull(tekst(fd, "id", 40));
  const rol = tekst(fd, "rol", 20);
  if (!id || id === ik.id || (rol !== "beheerder" && rol !== "redacteur") || !adminIngesteld()) return;
  const admin = supabaseAdmin();
  // Nooit het creator-account aanpassen via dit scherm.
  await admin.from("profielen").update({ rol }).eq("id", id).neq("rol", "creator");
  revalidatePath("/gebruikers");
}

export async function gebruikerVerwijderen(fd: FormData) {
  const ik = await vereisBeheerder();
  const id = uuidOfNull(tekst(fd, "id", 40));
  if (!id || id === ik.id || !adminIngesteld()) return;
  const admin = supabaseAdmin();
  const { data: profiel } = await admin.from("profielen").select("rol").eq("id", id).maybeSingle();
  if (!profiel || profiel.rol === "creator") return;
  await admin.auth.admin.deleteUser(id);
  revalidatePath("/gebruikers");
}
