import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Logt uit en gaat naar het inlogscherm, eventueel met een reden. Gebruikt als
 * de sessie niet (meer) geldig is of het account geen toegang heeft, zodat de
 * bezoeker nooit heen en weer blijft springen tussen inlogscherm en overzicht.
 * Ook als Supabase het uitloggen weigert (sessie al ongeldig) worden de
 * sessiecookies hier gewist.
 */
export async function GET(req: NextRequest) {
  const sb = await supabaseServer();
  await sb.auth.signOut({ scope: "local" }).catch(() => {});
  const reden = req.nextUrl.searchParams.get("reden") === "geen-toegang" ? "?melding=geen-toegang" : "";
  const res = NextResponse.redirect(new URL(`/login${reden}`, req.url));
  for (const c of req.cookies.getAll()) {
    if (c.name.startsWith("sb-")) res.cookies.set(c.name, "", { path: "/", maxAge: 0 });
  }
  return res;
}
