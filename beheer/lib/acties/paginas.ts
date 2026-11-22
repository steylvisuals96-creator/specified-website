"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "../supabase/server";
import { vereisBeheerder } from "../sessie";
import { controleerPagina, uitFormulierPagina } from "../paginas";
import { paginaSchema } from "../paginas-server";
import { dbFout, tekst, type Resultaat } from "../formulier";
import { verversWebsite } from "../website";
import { leesTaal, metTaal, rijSleutel } from "../taal";

export async function slaPaginaOp(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisBeheerder();
  const sleutel = tekst(fd, "__pagina", 40);
  const taal = leesTaal(fd.get("__taal"));
  const schema = await paginaSchema(taal);
  const def = schema.find((p) => p.sleutel === sleutel);
  if (!def) return { ok: false, melding: "Onbekende pagina, of de website is even niet bereikbaar. Probeer het opnieuw." };

  const waarde = uitFormulierPagina(def, fd);
  const velden = controleerPagina(def, waarde);
  if (Object.keys(velden).length) return { ok: false, velden, melding: "Een paar velden kloppen nog niet." };

  const sb = await supabaseServer();
  const { data, error } = await sb.from("pagina_inhoud").update({ waarde }).eq("sleutel", rijSleutel(sleutel, taal)).select("sleutel").single();
  if (error || !data) return { ok: false, melding: dbFout(error) };

  // Gedeelde lijsten staan op meerdere pagina's: die allemaal verversen.
  const paden = sleutel === "algemeen" ? schema.map((p) => p.pad).filter((p): p is string => Boolean(p)) : def.pad ? [def.pad] : [];
  await verversWebsite(paden);
  revalidatePath(`/paginas/${sleutel}`);
  revalidatePath(metTaal("/paginas", taal));
  return { ok: true, melding: "Staat online", opgeslagen: new Date().toISOString() };
}
