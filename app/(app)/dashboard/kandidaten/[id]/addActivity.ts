"use server";

import { getPayload } from "payload";
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
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  await payload.create({ collection: "activiteiten" as any, data });
  if (data.kandidaat) revalidatePath(`/dashboard/kandidaten/${data.kandidaat}`);
  if (data.bedrijf) revalidatePath(`/dashboard/bedrijven/${data.bedrijf}`);
  revalidatePath("/dashboard/activiteiten");
}
