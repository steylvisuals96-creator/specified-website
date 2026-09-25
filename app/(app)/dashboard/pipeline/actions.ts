"use server";

import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { revalidatePath } from "next/cache";

const configPromise = import("@payload-config").then((m) => m.default);

export async function moveSollicitatie(id: string, status: string) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  await payload.update({ ...als, collection: "sollicitaties", id, data: { status } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/sollicitaties");
}
