"use server";

import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { KANDIDAAT_STATUS } from "@/lib/labels";
import { revalidatePath } from "next/cache";

export async function updateKandidaat(id: string, data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  await payload.update({ ...als, collection: "kandidaten" as any, id, data });
  revalidatePath(`/dashboard/kandidaten/${id}`);
}

/** Pipeline-status wijzigen en dat meteen als notitie in de tijdlijn zetten. */
export async function zetKandidaatStatus(id: string, status: string) {
  if (!(status in KANDIDAAT_STATUS)) throw new Error("Onbekende status.");
  const { payload, als } = await payloadAlsGebruiker();
  await payload.update({ ...als, collection: "kandidaten", id, data: { status: status as any } });
  await payload.create({
    ...als,
    collection: "activiteiten",
    data: {
      type: "notitie",
      datum: new Date().toISOString(),
      onderwerp: `Status gewijzigd naar ${KANDIDAAT_STATUS[status].label.toLowerCase()}`,
      kandidaat: id,
    },
  });
  revalidatePath(`/dashboard/kandidaten/${id}`);
  revalidatePath("/dashboard/kandidaten");
  revalidatePath("/dashboard");
}

export type NotitieStaat = { fout?: string; ok?: number };

/** Snelle notitie vanaf de kandidaatpagina. */
export async function notitieToevoegen(id: string, _vorige: NotitieStaat, form: FormData): Promise<NotitieStaat> {
  const tekst = String(form.get("notitie") ?? "").trim();
  if (!tekst) return { fout: "Schrijf eerst een notitie." };
  if (tekst.length > 5000) return { fout: "Een notitie mag maximaal 5000 tekens lang zijn." };

  const { payload, als } = await payloadAlsGebruiker();
  const eersteRegel = tekst.split("\n")[0];
  await payload.create({
    ...als,
    collection: "activiteiten",
    data: {
      type: "notitie",
      datum: new Date().toISOString(),
      onderwerp: eersteRegel.length > 90 ? eersteRegel.slice(0, 87) + "…" : eersteRegel,
      inhoud: tekst.includes("\n") || eersteRegel.length > 90 ? tekst : undefined,
      kandidaat: id,
    },
  });
  revalidatePath(`/dashboard/kandidaten/${id}`);
  return { ok: Date.now() };
}
