"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "../supabase/server";
import { vereisSessie } from "../sessie";
import { datum, dbFout, lijst, slugify, tekst, uuidOfNull, vinkje, type Resultaat } from "../formulier";
import { CONTRACTEN, ERVARING, OPLEIDING, STATUSSEN, TALEN, UREN, VAKGEBIEDEN, toegestaan } from "../opties";
import { schoonDocument } from "../richtekst";
import { verversWebsite } from "../website";

const keuzeOfNull = (lijstOpties: typeof UREN, v: string) => (v && toegestaan(lijstOpties, v) ? v : null);

export async function slaVacatureOp(_: Resultaat, fd: FormData): Promise<Resultaat> {
  await vereisSessie();
  const id = uuidOfNull(tekst(fd, "id", 40));

  const velden: Record<string, string> = {};
  const titel = tekst(fd, "titel", 120);
  const vakgebied = tekst(fd, "vakgebied", 40);
  const contract = tekst(fd, "contract", 40);
  const status = tekst(fd, "status", 40) || "actief";
  if (!titel) velden.titel = "Geef de vacature een titel.";
  if (!toegestaan(VAKGEBIEDEN, vakgebied)) velden.vakgebied = "Kies een vakgebied.";
  if (!toegestaan(CONTRACTEN, contract)) velden.contract = "Kies een type contract.";
  if (!toegestaan(STATUSSEN, status)) velden.status = "Kies een status.";
  if (Object.keys(velden).length) return { ok: false, velden, melding: "Nog niet alles is ingevuld." };

  const rij = {
    titel,
    vakgebied,
    contract,
    status,
    locatie: tekst(fd, "locatie", 80) || "België",
    ervaring: keuzeOfNull(ERVARING, tekst(fd, "ervaring", 20)),
    uren: keuzeOfNull(UREN, tekst(fd, "uren", 20)),
    opleiding: keuzeOfNull(OPLEIDING, tekst(fd, "opleiding", 20)),
    talen: lijst(fd, "talen", 4, 4).filter((t) => toegestaan(TALEN, t)),
    beschrijving: schoonDocument(fd.get("beschrijving")),
    vereisten: lijst(fd, "vereisten", 20, 200),
    nice_to_have: lijst(fd, "nice_to_have", 20, 200),
    aanbod: lijst(fd, "aanbod", 20, 200),
    geplaatst_op: datum(fd, "geplaatst_op"),
    zichtbaar: vinkje(fd, "zichtbaar"),
  };
  const salaris = tekst(fd, "salaris", 120);

  const sb = await supabaseServer();
  let vacatureId = id;
  let slug: string;

  if (id) {
    const { data, error } = await sb.from("vacatures").update(rij).eq("id", id).select("slug").single();
    if (error || !data) return { ok: false, melding: dbFout(error) };
    slug = data.slug;
  } else {
    // Het adres wordt één keer gemaakt en blijft daarna staan, zodat links in Google en mails niet breken.
    slug = `${slugify(titel) || "vacature"}-${crypto.randomUUID().slice(0, 6)}`;
    const { data, error } = await sb.from("vacatures").insert({ ...rij, slug, geplaatst_op: rij.geplaatst_op ?? new Date().toISOString().slice(0, 10) }).select("id").single();
    if (error || !data) return { ok: false, melding: dbFout(error) };
    vacatureId = data.id;
  }

  const { error: internFout } = await sb.from("vacatures_intern").upsert({ vacature_id: vacatureId, salaris });
  if (internFout) return { ok: false, melding: "De vacature is opgeslagen, het interne salarisveld niet." };

  await verversWebsite(["/", "/vacatures", `/vacatures/${slug}`]);
  revalidatePath("/vacatures");
  revalidatePath("/");
  if (!id) redirect(`/vacatures/${vacatureId}?nieuw=1`);
  return { ok: true, melding: "Opgeslagen", opgeslagen: new Date().toISOString(), id: vacatureId ?? undefined };
}

export async function verwijderVacature(fd: FormData) {
  await vereisSessie();
  const id = uuidOfNull(tekst(fd, "id", 40));
  if (!id) return;
  const sb = await supabaseServer();
  const { data } = await sb.from("vacatures").delete().eq("id", id).select("slug").maybeSingle();
  if (data) await verversWebsite(["/", "/vacatures", `/vacatures/${data.slug}`]);
  revalidatePath("/vacatures");
  redirect("/vacatures?verwijderd=1");
}
