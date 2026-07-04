"use server";

import { getPayload } from "payload";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const configPromise = import("@payload-config").then((m) => m.default);

export async function createKandidaat(data: Record<string, any>) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const doc = await payload.create({ collection: "kandidaten" as any, data });
  revalidatePath("/dashboard/kandidaten");
  revalidatePath("/dashboard");
  return { id: (doc as any).id };
}

export async function createBedrijf(data: Record<string, any>) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const doc = await payload.create({ collection: "bedrijven" as any, data });
  revalidatePath("/dashboard/bedrijven");
  revalidatePath("/dashboard");
  return { id: (doc as any).id };
}

export async function createSollicitatie(data: Record<string, any>) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const doc = await payload.create({ collection: "sollicitaties" as any, data });
  revalidatePath("/dashboard/sollicitaties");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
  return { id: (doc as any).id };
}
