import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

// Make.com roept dit endpoint aan om data terug te schrijven in het CMS
// Authenticatie via x-make-secret header (zet MAKE_SECRET in Vercel)
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-make-secret");
  if (secret !== process.env.MAKE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { actie, collection, id, data } = body;

  const config = await configPromise;
  const payload = await getPayload({ config: config as any });

  if (actie === "update" && collection && id && data) {
    await payload.update({ collection, id, data } as any);
    return NextResponse.json({ ok: true });
  }

  if (actie === "create" && collection && data) {
    const result = await payload.create({ collection, data } as any);
    return NextResponse.json({ ok: true, id: result.id });
  }

  return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
}
