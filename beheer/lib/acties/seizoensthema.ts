"use server";

import { revalidatePath } from "next/cache";
import { type Resultaat, dbFout } from "../formulier";
import { geldigeDatum, themaOptie } from "../seizoensthema";
import { vereisBeheerder } from "../sessie";
import { supabaseServer } from "../supabase/server";
import { verversWebsite } from "../website";

export async function slaSeizoensthemaOp(_: Resultaat, form: FormData): Promise<Resultaat> {
  await vereisBeheerder();
  const keuze = themaOptie(form.get("thema"));
  if (!keuze) return { ok: false, melding: "Kies een thema uit de lijst." };

  const vanaf = keuze.id === "standaard" ? "" : String(form.get("vanaf") ?? "");
  const tot = keuze.id === "standaard" ? "" : String(form.get("tot_en_met") ?? "");
  if ((vanaf && !geldigeDatum(vanaf)) || (tot && !geldigeDatum(tot))) {
    return { ok: false, melding: "Vul een geldige datum in." };
  }
  if (vanaf && tot && vanaf > tot) {
    return { ok: false, melding: "Kies een einddatum op of na de begindatum.", velden: { tot_en_met: "Ongeldige einddatum" } };
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.from("seizoensthema")
    .update({ thema: keuze.id, vanaf: vanaf || null, tot_en_met: tot || null })
    .eq("id", true)
    .select("thema")
    .single();
  if (error || !data) return { ok: false, melding: dbFout(error) };

  await verversWebsite(["layout"]);
  revalidatePath("/seizoensthema");
  return { ok: true, melding: "Thema opgeslagen." };
}
