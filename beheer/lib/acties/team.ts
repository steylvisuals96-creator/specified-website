"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "../supabase/server";
import { vereisSessie } from "../sessie";
import { dbFout, tekst, uuidOfNull, vinkje, type Resultaat } from "../formulier";
import { verversWebsite } from "../website";

export async function slaTeamlidOp(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisSessie();
  const id = uuidOfNull(tekst(fd, "id", 40));
  const velden: Record<string, string> = {};

  const voornaam = tekst(fd, "voornaam", 60);
  const email = tekst(fd, "email", 120);
  const linkedin = tekst(fd, "linkedin", 200);
  const volgorde = Number.parseInt(tekst(fd, "volgorde", 4), 10);
  if (!voornaam) velden.voornaam = "Vul een voornaam in.";
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) velden.email = "Dat is geen geldig e-mailadres.";
  if (linkedin && !/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(linkedin)) velden.linkedin = "Plak het volledige adres, beginnend met https://www.linkedin.com/";
  if (Object.keys(velden).length) return { ok: false, velden, melding: "Nog niet alles klopt." };

  const rij = {
    voornaam,
    achternaam: tekst(fd, "achternaam", 60),
    rol: tekst(fd, "rol", 60),
    bio: tekst(fd, "bio", 1200),
    foto_id: uuidOfNull(tekst(fd, "foto_id", 40)),
    email: email || null,
    linkedin: linkedin || null,
    volgorde: Number.isFinite(volgorde) ? Math.max(0, Math.min(999, volgorde)) : 99,
    actief: vinkje(fd, "actief"),
  };

  const sb = await supabaseServer();
  const { data, error } = id ? await sb.from("team").update(rij).eq("id", id).select("id").single() : await sb.from("team").insert(rij).select("id").single();
  if (error || !data) return { ok: false, melding: dbFout(error) };

  await verversWebsite(["/"]);
  revalidatePath("/team");
  if (!id) redirect(`/team/${data.id}?nieuw=1`);
  return { ok: true, melding: "Opgeslagen", opgeslagen: new Date().toISOString(), id: data.id };
}

export async function verwijderTeamlid(fd: FormData) {
  await vereisSessie();
  const id = uuidOfNull(tekst(fd, "id", 40));
  if (!id) return;
  const sb = await supabaseServer();
  await sb.from("team").delete().eq("id", id);
  await verversWebsite(["/"]);
  revalidatePath("/team");
  redirect("/team?verwijderd=1");
}
