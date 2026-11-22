import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { INHOUD_TAG } from "@/lib/beheer";
import { nlPadVan, taalVanPad } from "@/lib/taal";

/** Een publiek adres ("/voor-bedrijven", "/en/for-companies") naar de interne route onder app/[taal]. */
function interneRoute(pad: string) {
  const nl = nlPadVan(pad);
  return `/${taalVanPad(pad)}${nl === "/" ? "" : nl}`;
}

/**
 * Het beheer roept dit aan na elke wijziging, zodat de nieuwe inhoud meteen
 * online staat in plaats van na maximaal een minuut. Alleen met het gedeelde
 * geheim (VERVERS_GEHEIM hier, WEBSITE_VERVERS_GEHEIM in het beheer). Zonder
 * geheim geweigerd. Doet niets anders dan cache leegmaken.
 */
function geheimKlopt(gegeven: string | null) {
  const verwacht = process.env.VERVERS_GEHEIM;
  if (!verwacht || !gegeven) return false;
  const a = Buffer.from(gegeven);
  const b = Buffer.from(verwacht);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!geheimKlopt(req.headers.get("x-ververs-geheim"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const paden: string[] = Array.isArray(body?.paden) ? body.paden.filter((p: unknown): p is string => typeof p === "string").slice(0, 20) : [];

  // Alle gegevens uit het beheer dragen deze tag: meteen vers bij het volgende bezoek.
  revalidateTag(INHOUD_TAG, { expire: 0 });
  for (const pad of paden) {
    if (pad === "layout") revalidatePath("/", "layout");
    else if (/^\/[a-z0-9/_-]{0,160}$/i.test(pad)) revalidatePath(interneRoute(pad));
  }
  return NextResponse.json({ ok: true });
}
