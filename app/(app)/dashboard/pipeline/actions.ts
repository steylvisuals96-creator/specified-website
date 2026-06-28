"use server";

import { getPayload } from "payload";
import { revalidatePath } from "next/cache";

const configPromise = import("@payload-config").then((m) => m.default);

export async function moveSollicitatie(id: string, status: string) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  await payload.update({ collection: "sollicitaties", id, data: { status } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/sollicitaties");
}
