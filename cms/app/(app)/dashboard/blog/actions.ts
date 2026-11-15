"use server";

import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { revalidatePath } from "next/cache";

const configPromise = import("@payload-config").then((m) => m.default);

async function client() {
  return payloadAlsGebruiker();
}

export async function createArtikel(data: Record<string, any>) {
  const { payload: p, als } = await client();
  const doc = await p.create({ ...als, collection: "blog" as any, data });
  revalidatePath("/dashboard/blog");
  return { id: (doc as any).id };
}

export async function updateArtikel(id: string, data: Record<string, any>) {
  const { payload: p, als } = await client();
  await p.update({ ...als, collection: "blog" as any, id, data });
  revalidatePath("/dashboard/blog");
}

export async function verwijderArtikel(id: string) {
  const { payload: p, als } = await client();
  await p.delete({ ...als, collection: "blog" as any, id });
  revalidatePath("/dashboard/blog");
}
