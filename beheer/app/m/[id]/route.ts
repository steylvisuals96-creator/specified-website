import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ondertekendeLink, r2Ingesteld } from "@/lib/r2";

/**
 * Publiek adres van een beeld: /m/<id>. Stuurt door naar een ondertekende
 * R2-link die een uur geldig is. Alleen wat in de tabel media staat (publiek
 * leesbaar via RLS) is zo bereikbaar; de bucket zelf blijft privé.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !r2Ingesteld()) return new NextResponse(null, { status: 404 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await sb.from("media").select("sleutel").eq("id", id).maybeSingle();
  if (!data) return new NextResponse(null, { status: 404 });

  const link = await ondertekendeLink(data.sleutel, 3600);
  return NextResponse.redirect(link, {
    status: 302,
    // Korter dan de geldigheid van de link, zodat een bewaarde doorverwijzing nooit naar een verlopen link wijst.
    headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" },
  });
}
