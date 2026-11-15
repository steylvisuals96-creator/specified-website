"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "../supabase/server";
import { vereisSessie } from "../sessie";
import { datum, dbFout, slugify, tekst, uuidOfNull, type Resultaat } from "../formulier";
import { schoonDocument } from "../richtekst";
import { verversWebsite } from "../website";

export async function slaArtikelOp(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisSessie();
  const id = uuidOfNull(tekst(fd, "id", 40));
  const velden: Record<string, string> = {};

  const titel = tekst(fd, "titel", 160);
  const status = tekst(fd, "status", 20) === "gepubliceerd" ? "gepubliceerd" : "concept";
  const slugInvoer = slugify(tekst(fd, "slug", 140), 140);
  const coverUrl = tekst(fd, "cover_url", 500);
  if (!titel) velden.titel = "Geef het artikel een titel.";
  if (coverUrl && !/^https:\/\//i.test(coverUrl)) velden.cover_url = "Een extern beeld moet met https:// beginnen.";
  const inhoud = schoonDocument(fd.get("inhoud"));
  if (status === "gepubliceerd" && !inhoud) velden.inhoud = "Een gepubliceerd artikel heeft tekst nodig.";
  if (Object.keys(velden).length) return { ok: false, velden, melding: "Nog niet alles klopt." };

  const rij = {
    titel,
    slug: slugInvoer || slugify(titel, 80) || `artikel-${crypto.randomUUID().slice(0, 6)}`,
    status,
    publicatiedatum: datum(fd, "publicatiedatum") ?? new Date().toISOString().slice(0, 10),
    auteur_id: uuidOfNull(tekst(fd, "auteur_id", 40)),
    cover_id: uuidOfNull(tekst(fd, "cover_id", 40)),
    cover_url: coverUrl || null,
    samenvatting: tekst(fd, "samenvatting", 400),
    inhoud,
    meta_titel: tekst(fd, "meta_titel", 70),
    meta_beschrijving: tekst(fd, "meta_beschrijving", 170),
  };

  const sb = await supabaseServer();
  const vorige = id ? (await sb.from("blog").select("slug").eq("id", id).maybeSingle()).data?.slug : null;
  const { data, error } = id
    ? await sb.from("blog").update(rij).eq("id", id).select("id, slug").single()
    : await sb.from("blog").insert(rij).select("id, slug").single();
  if (error || !data) {
    if (error?.code === "23505") return { ok: false, velden: { slug: "Dit adres bestaat al. Kies een ander." }, melding: "Het adres is al in gebruik." };
    return { ok: false, melding: dbFout(error) };
  }

  await verversWebsite(["/blog", `/blog/${data.slug}`, ...(vorige && vorige !== data.slug ? [`/blog/${vorige}`] : [])]);
  revalidatePath("/blog");
  if (!id) redirect(`/blog/${data.id}?nieuw=1`);
  return { ok: true, melding: status === "gepubliceerd" ? "Staat online" : "Concept bewaard", opgeslagen: new Date().toISOString(), id: data.id };
}

export async function verwijderArtikel(fd: FormData) {
  await vereisSessie();
  const id = uuidOfNull(tekst(fd, "id", 40));
  if (!id) return;
  const sb = await supabaseServer();
  const { data } = await sb.from("blog").delete().eq("id", id).select("slug").maybeSingle();
  if (data) await verversWebsite(["/blog", `/blog/${data.slug}`]);
  revalidatePath("/blog");
  redirect("/blog?verwijderd=1");
}
