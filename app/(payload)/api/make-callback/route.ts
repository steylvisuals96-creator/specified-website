import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

// Make.com roept dit endpoint aan om data terug te schrijven in het CMS
// Authenticatie via x-make-secret header (zet MAKE_SECRET in Vercel)

// Waar Make in mag schrijven. Zonder deze lijst gold het secret voor élke
// collectie, inclusief "gebruikers" — één gelekt secret volstond dan om een
// eigen beheerdersaccount aan te maken. Payload's toegangsregels vangen dat
// niet af: de Local API hieronder draait standaard zonder die controle.
const TOEGESTANE_COLLECTIES = new Set([
  "vacatures",
  "kandidaten",
  "bedrijven",
  "sollicitaties",
  "activiteiten",
]);

export async function POST(req: NextRequest) {
  const verwacht = process.env.MAKE_SECRET;
  if (!verwacht) {
    console.error("MAKE_SECRET ontbreekt — callback geweigerd.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const secret = req.headers.get("x-make-secret");
  if (secret !== verwacht) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { actie, collection, id, data } = body;

  if (!collection || !TOEGESTANE_COLLECTIES.has(collection)) {
    return NextResponse.json({ error: "Collectie niet toegestaan" }, { status: 403 });
  }

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
