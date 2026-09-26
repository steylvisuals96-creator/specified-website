"use server";

import { payloadAlsGebruiker } from "@/lib/serverPayload";
import type { Sollicitaty } from "@/payload-types";
import { revalidatePath } from "next/cache";

// De geldige statussen staan in collections/Sollicitaties.ts; Payload weigert
// een onbekende waarde zelf, dus hier volstaat het type doorgeven.
type SollicitatieStatus = NonNullable<Sollicitaty["status"]>;

export async function moveSollicitatie(id: string, status: string) {
  const { payload, als } = await payloadAlsGebruiker();
  await payload.update({ ...als, collection: "sollicitaties", id, data: { status: status as SollicitatieStatus } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/sollicitaties");
}
