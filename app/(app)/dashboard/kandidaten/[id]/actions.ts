"use server";

import { getPayload } from "payload";
import { revalidatePath } from "next/cache";

const configPromise = import("@payload-config").then((m) => m.default);

export async function updateKandidaat(id: string, data: Record<string, any>) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  await payload.update({ collection: "kandidaten" as any, id, data });
  revalidatePath(`/dashboard/kandidaten/${id}`);
}
