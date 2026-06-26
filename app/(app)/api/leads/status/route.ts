import { getPayload } from "payload";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const configPromise = import("@payload-config").then((m) => m.default);

export async function PATCH(req: NextRequest) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Ontbrekende velden" }, { status: 400 });

  await payload.update({ collection: "leads", id, data: { status } as any });
  return NextResponse.json({ ok: true });
}
