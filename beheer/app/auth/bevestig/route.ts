import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Uitnodigings- en herstellinks komen hier binnen. De beheerder maakt de link
 * in Gebruikers en bezorgt hem zelf; Supabase hoeft dus geen mail te sturen.
 * Na de controle kiest de gebruiker zijn eigen wachtwoord.
 */
export async function GET(req: NextRequest) {
  const tokenHash = req.nextUrl.searchParams.get("token_hash") ?? "";
  const type = req.nextUrl.searchParams.get("type");
  const naarLogin = () => NextResponse.redirect(new URL("/login?link=ongeldig", req.url));

  if (!/^[a-f0-9]{20,200}$/i.test(tokenHash) || (type !== "invite" && type !== "recovery")) return naarLogin();

  const sb = await supabaseServer();
  const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) return naarLogin();
  return NextResponse.redirect(new URL("/auth/wachtwoord", req.url));
}
