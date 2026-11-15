"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "../supabase/server";
import { vereisBeheerder } from "../sessie";
import { controleer, uitFormulier } from "../homepage";
import { dbFout, type Resultaat } from "../formulier";
import { verversWebsite } from "../website";

export async function slaHomepageOp(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisBeheerder();
  const waarde = uitFormulier(fd);
  const velden = controleer(waarde);
  if (Object.keys(velden).length) return { ok: false, velden, melding: "Een paar velden kloppen nog niet." };

  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("pagina_inhoud")
    .update({ waarde })
    .eq("sleutel", "homepage")
    .select("sleutel")
    .single();
  if (error || !data) return { ok: false, melding: dbFout(error) };

  // Contact en footer staan op elke pagina.
  await verversWebsite(["/", "layout"]);
  revalidatePath("/homepage");
  // Sinds de overstap (2026-11-15) leest de website uit Supabase: opslaan is meteen online.
  return { ok: true, melding: "Staat online", opgeslagen: new Date().toISOString() };
}
