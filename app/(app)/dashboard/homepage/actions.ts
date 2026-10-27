"use server";

import { revalidatePath } from "next/cache";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { isBeheerder } from "@/lib/access";

const GROEPEN = ["hero", "tekening", "callouts", "consultants", "diensten_bedrijven", "diensten_engineers", "jobs"];

/** Slaat de homepage-teksten op vanuit het scherm "op de pagina bewerken". */
export async function bewaarHomepage(data: Record<string, any>): Promise<{ ok: boolean; fout?: string }> {
  const { payload, user, als } = await payloadAlsGebruiker();
  if (!isBeheerder(user)) return { ok: false, fout: "Geen toegang." };
  const schoon = Object.fromEntries(Object.entries(data ?? {}).filter(([k]) => GROEPEN.includes(k)));
  try {
    await (payload as any).updateGlobal({ ...als, slug: "website", data: schoon });
  } catch (e: any) {
    const velden: string[] = (e?.data?.errors ?? []).map((x: any) => x?.message).filter(Boolean);
    return { ok: false, fout: (velden.length ? velden.join(" ") : "Opslaan is niet gelukt. Probeer het opnieuw.").slice(0, 300) };
  }
  revalidatePath("/dashboard/homepage");
  return { ok: true };
}
