import { NextResponse, type NextRequest } from "next/server";
import { EN_NAAR_NL, NL_NAAR_EN } from "@/lib/taal";

/**
 * Taal in het adres. Intern staan alle pagina's onder app/[taal]/ met de
 * Nederlandse mapnamen. Publiek:
 *  - Nederlands zonder voorvoegsel: /voor-bedrijven → intern /nl/voor-bedrijven
 *  - Engels onder /en met Engelse namen: /en/for-companies → intern /en/voor-bedrijven
 * Dubbele adressen sturen door naar het ene juiste: /nl/... naar het adres
 * zonder voorvoegsel, /en/voor-bedrijven naar /en/for-companies.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  if (pathname === "/nl" || pathname.startsWith("/nl/")) {
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const stukken = pathname.split("/"); // ["", "en", eerste, ...]
    const eerste = stukken[2];
    if (eerste && NL_NAAR_EN[eerste]) {
      stukken[2] = NL_NAAR_EN[eerste];
      url.pathname = stukken.join("/");
      return NextResponse.redirect(url, 308);
    }
    if (eerste && EN_NAAR_NL[eerste]) {
      stukken[2] = EN_NAAR_NL[eerste];
      url.pathname = stukken.join("/");
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  url.pathname = `/nl${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Niet voor de API, Next-bestanden, Vercel-scripts en bestanden met een extensie (beelden, sitemap.xml, robots.txt).
  matcher: ["/((?!api/|_next/|_vercel/|.*\\.[a-zA-Z0-9]+$).*)"],
};
