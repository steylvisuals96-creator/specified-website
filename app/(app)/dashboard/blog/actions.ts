"use server";

import { getPayload } from "payload";
import { revalidatePath } from "next/cache";

const configPromise = import("@payload-config").then((m) => m.default);

async function client() {
  const config = await configPromise;
  return getPayload({ config: config as any });
}

export async function createArtikel(data: Record<string, any>) {
  const p = await client();
  const doc = await p.create({ collection: "blog" as any, data });
  revalidatePath("/dashboard/blog");
  return { id: (doc as any).id };
}

export async function updateArtikel(id: string, data: Record<string, any>) {
  const p = await client();
  await p.update({ collection: "blog" as any, id, data });
  revalidatePath("/dashboard/blog");
}

export async function verwijderArtikel(id: string) {
  const p = await client();
  await p.delete({ collection: "blog" as any, id });
  revalidatePath("/dashboard/blog");
}
