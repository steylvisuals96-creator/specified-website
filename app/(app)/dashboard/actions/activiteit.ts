"use server";

import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { revalidatePath } from "next/cache";

const configPromise = import("@payload-config").then((m) => m.default);

export async function addActiviteit(data: {
  type: string;
  richting?: string;
  datum: string;
  onderwerp: string;
  inhoud?: string;
  van?: string;
  naar?: string;
  kandidaat?: string;
  bedrijf?: string;
}) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  const doc = await payload.create({ ...als, collection: "activiteiten" as any, data });
  if (data.kandidaat) revalidatePath(`/dashboard/kandidaten/${data.kandidaat}`);
  if (data.bedrijf) revalidatePath(`/dashboard/bedrijven/${data.bedrijf}`);
  revalidatePath("/dashboard/activiteiten");
  revalidatePath("/dashboard/agenda");
  return { id: (doc as any).id };
}
