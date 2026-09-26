"use server";

import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const configPromise = import("@payload-config").then((m) => m.default);

export async function createKandidaat(data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  const doc = await payload.create({ ...als, collection: "kandidaten" as any, data });
  revalidatePath("/dashboard/kandidaten");
  revalidatePath("/dashboard");
  return { id: (doc as any).id };
}

export async function createBedrijf(data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  const doc = await payload.create({ ...als, collection: "bedrijven" as any, data });
  revalidatePath("/dashboard/bedrijven");
  revalidatePath("/dashboard");
  return { id: (doc as any).id };
}

export async function createTeamlid(data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  const doc = await payload.create({ ...als, collection: "team" as any, data });
  revalidatePath("/dashboard/team");
  return { id: (doc as any).id };
}

export async function createGebruiker(data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  const doc = await payload.create({ ...als, collection: "gebruikers" as any, data });
  revalidatePath("/dashboard/gebruikers");
  return { id: (doc as any).id };
}

export async function createActiviteit(data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  const doc = await payload.create({ ...als, collection: "activiteiten" as any, data });
  revalidatePath("/dashboard/activiteiten");
  return { id: (doc as any).id };
}

export async function createVacature(data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  const doc = await payload.create({ ...als, collection: "vacatures" as any, data });
  revalidatePath("/dashboard/vacatures");
  revalidatePath("/dashboard");
  return { id: (doc as any).id };
}

export async function createSollicitatie(data: Record<string, any>) {
  const { payload: payload, als } = await payloadAlsGebruiker();
  const doc = await payload.create({ ...als, collection: "sollicitaties" as any, data });
  revalidatePath("/dashboard/sollicitaties");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
  return { id: (doc as any).id };
}
