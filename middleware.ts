import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Login pagina altijd toestaan
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Lees de Payload auth cookie (JWT)
  const token = req.cookies.get("payload-token")?.value;

  if (!token) {
    // Niet ingelogd → naar login
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Decodeer JWT payload (middle deel, geen verificatie nodig hier — Payload verifieert server-side)
  try {
    const base64 = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(base64, "base64url").toString("utf-8"));
    // Payloads eigen beheer is alleen voor de bouwer. Klanten werken in /dashboard,
    // ook voor blog, team en homepage (daar staat het live voorbeeld).
    if (decoded?.rol !== "creator" && pathname !== "/admin/logout") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
