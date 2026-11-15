import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Staat voor elke pagina van het beheer: ververst de sessie en stuurt wie niet
 * (volledig) ingelogd is naar het inlogscherm. Dit is de eerste deur; elke
 * pagina en actie controleert daarna zelf nog eens (lib/sessie.ts) en RLS in
 * de database is de laatste.
 */
const ZONDER_LOGIN = ["/login", "/auth/"];

export async function proxy(req: NextRequest) {
  // Vercel Cron heeft geen sessiecookie. Deze route controleert zelf CRON_SECRET.
  if (req.nextUrl.pathname === "/api/cron/seo") return NextResponse.next();
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lijst) => {
        for (const { name, value } of lijst) req.cookies.set(name, value);
        res = NextResponse.next({ request: req });
        for (const { name, value, options } of lijst) res.cookies.set(name, value, options);
      },
    },
  });

  const pad = req.nextUrl.pathname;
  const open = ZONDER_LOGIN.some((p) => pad === p || pad.startsWith(p));

  // Doorsturen met behoud van de (ververste) sessiecookies.
  const naar = (doel: string) => {
    const r = NextResponse.redirect(new URL(doel, req.url));
    for (const c of res.cookies.getAll()) r.cookies.set(c);
    return r;
  };

  // Alleen of er een geldig token is (lokaal gecontroleerd, snel). De tweede stap en de
  // rol controleert lib/sessie.ts met de geverifieerde gebruiker; die stuurt zelf door
  // naar /login/code als de code uit de app nog ontbreekt.
  const { data } = await sb.auth.getClaims();
  const ingelogd = Boolean(data?.claims?.sub);

  if (!ingelogd) return open && pad !== "/login/code" ? res : naar("/login");
  if (pad === "/login") return naar("/");

  return res;
}

export const config = {
  matcher: [
    // Niet voor statische bestanden, beeldlinks (/m/...) en de gezondheidscheck.
    "/((?!_next/static|_next/image|m/|api/health|merk/|icon.svg|favicon.ico).*)",
  ],
};
