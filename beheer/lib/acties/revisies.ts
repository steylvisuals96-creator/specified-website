"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "../supabase/server";
import { vereisSessie, vereisBeheerder } from "../sessie";
import { dbFout, uuidOfNull, type Resultaat } from "../formulier";
import { revisieInvoer, STATUS, PRIORITEIT, isKeuze } from "../revisies";

export async function maakRevisie(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisSessie();
  const { rij, velden } = revisieInvoer(fd);
  if (Object.keys(velden).length) return { ok: false, velden, melding: "Kijk de aangeduide velden na." };
  const sb = await supabaseServer();
  const { data, error } = await sb.from("revisies").insert(rij).select("id").single();
  if (error || !data) return { ok: false, melding: dbFout(error) };
  revalidatePath("/revisies");
  redirect(`/revisies/${data.id}`);
}

export async function volgRevisieOp(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisBeheerder();
  const id = uuidOfNull(String(fd.get("id") ?? ""));
  const status = String(fd.get("status") ?? "");
  const prioriteit = String(fd.get("prioriteit") ?? "");
  const gewijzigd = String(fd.get("gewijzigd") ?? "");
  if (!id || !isKeuze(STATUS, status) || !isKeuze(PRIORITEIT, prioriteit) || !gewijzigd || Number.isNaN(Date.parse(gewijzigd))) return { ok: false, melding: "Laad de revisie opnieuw en probeer het nog eens." };
  const sb = await supabaseServer();
  const { data, error } = await sb.from("revisies").update({ status, prioriteit }).eq("id", id).eq("gewijzigd", gewijzigd).select("gewijzigd").maybeSingle();
  if (error) return { ok: false, melding: dbFout(error) };
  if (!data) return { ok: false, melding: "Iemand heeft deze revisie intussen gewijzigd. Vernieuw de pagina voordat je verdergaat." };
  revalidatePath("/revisies");
  revalidatePath(`/revisies/${id}`);
  return { ok: true, melding: "Opvolging opgeslagen.", opgeslagen: data.gewijzigd };
}

export async function reageerOpRevisie(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisSessie();
  const id = uuidOfNull(String(fd.get("id") ?? ""));
  const tekst = String(fd.get("tekst") ?? "").trim();
  if (!id || !tekst || tekst.length > 4000) return { ok: false, melding: "Vul een reactie van maximaal 4.000 tekens in." };
  const sb = await supabaseServer();
  const { error } = await sb.from("revisie_reacties").insert({ revisie_id: id, tekst });
  if (error) return { ok: false, melding: dbFout(error) };
  revalidatePath(`/revisies/${id}`);
  return { ok: true, melding: "Reactie toegevoegd.", opgeslagen: new Date().toISOString() };
}
