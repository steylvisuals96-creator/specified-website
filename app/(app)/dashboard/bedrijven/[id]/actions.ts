"use server";

import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { revalidatePath } from "next/cache";

const configPromise = import("@payload-config").then((m) => m.default);

export async function updateBedrijf(id: string, data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  await payload.update({ ...als, collection: "bedrijven" as any, id, data });
  revalidatePath(`/dashboard/bedrijven/${id}`);
}
