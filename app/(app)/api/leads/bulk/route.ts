import { getPayload } from "payload";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const configPromise = import("@payload-config").then((m) => m.default);

export async function DELETE(req: Request) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "Geen IDs" }, { status: 400 });

  await Promise.all(ids.map((id: string) => payload.delete({ collection: "leads", id })));
  return NextResponse.json({ ok: true, verwijderd: ids.length });
}

export async function PATCH(req: Request) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { ids, veld, waarde } = await req.json();
  if (!Array.isArray(ids) || !veld) return NextResponse.json({ error: "Ongeldige data" }, { status: 400 });

  await Promise.all(ids.map((id: string) =>
    payload.update({ collection: "leads", id, data: { [veld]: waarde } as any })
  ));
  return NextResponse.json({ ok: true, bijgewerkt: ids.length });
}
