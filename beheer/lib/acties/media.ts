"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "../supabase/server";
import { vereisSessie } from "../sessie";
import { verwijderBestand } from "../r2";
import { tekst, uuidOfNull, type Resultaat } from "../formulier";
import { verversWebsite } from "../website";

export async function altWijzigen(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisSessie();
  const id = uuidOfNull(tekst(fd, "id", 40));
  if (!id) return { ok: false, melding: "Onbekend beeld." };
  const sb = await supabaseServer();
  const { error } = await sb.from("media").update({ alt: tekst(fd, "alt", 200) }).eq("id", id);
  if (error) return { ok: false, melding: "Opslaan lukte niet." };
  revalidatePath("/media");
  return { ok: true, melding: "Opgeslagen", opgeslagen: new Date().toISOString() };
}

export async function verwijderMedia(fd: FormData) {
  await vereisSessie();
  const id = uuidOfNull(tekst(fd, "id", 40));
  if (!id) return;
  const sb = await supabaseServer();
  // Eerst uit de tabel (daar beslist RLS wie mag), dan pas het bestand.
  const { data } = await sb.from("media").delete().eq("id", id).select("sleutel").maybeSingle();
  if (data?.sleutel) await verwijderBestand(data.sleutel).catch(() => {});
  await verversWebsite(["/", "/blog"]);
  revalidatePath("/media");
}
