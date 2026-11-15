import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Logt uit en gaat naar het inlogscherm met een reden. Voor een account dat
 * wel bestaat maar geen toegang tot het beheer heeft (geen profiel), zodat
 * het niet heen en weer blijft springen tussen inlogscherm en overzicht.
 */
export async function GET(req: NextRequest) {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  const reden = req.nextUrl.searchParams.get("reden") === "geen-toegang" ? "?melding=geen-toegang" : "";
  return NextResponse.redirect(new URL(`/login${reden}`, req.url));
}
