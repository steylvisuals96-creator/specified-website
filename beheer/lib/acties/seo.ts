"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uuidOfNull, tekst } from "../formulier";
import { vereisBeheerder } from "../sessie";
import { adminIngesteld, supabaseAdmin } from "../supabase/server";
import { verversWebsite } from "../website";

export async function beslisSeo(fd: FormData) {
  const sessie = await vereisBeheerder();
  const id = uuidOfNull(tekst(fd, "id", 40));
  const keuze = tekst(fd, "keuze", 20);
  if (!id || !["toepassen", "verwerpen"].includes(keuze) || !adminIngesteld()) redirect("/seo?melding=fout");

  const toepassen = keuze === "toepassen";
  const { data: pad, error } = await supabaseAdmin({ timeout: 9000 }).rpc("seo_beslis", {
    p_id: id, p_toepassen: toepassen, p_beheerder: sessie.id,
  });
  if (error) redirect("/seo?melding=fout");
  if (pad && toepassen) await verversWebsite([pad]);
  revalidatePath("/seo");
  redirect(`/seo?melding=${pad ? keuze : "ingehaald"}`);
}
