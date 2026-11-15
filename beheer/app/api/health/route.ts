import { NextResponse } from "next/server";

/**
 * Gezondheidscheck voor de uptime-monitor: draait het beheer en bereikt het de
 * database? Raakt elke keer de database, zodat het gratis Supabase-project niet
 * na 7 dagen pauzeert. Geeft alleen ok of fout terug.
 */
export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pagina_inhoud?select=sleutel&limit=1`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
