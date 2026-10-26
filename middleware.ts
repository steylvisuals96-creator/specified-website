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
    // Payloads beheer is voor de bouwer. De rest komt alleen bij de blog, waar
    // het live voorbeeld zit; de rest van het werk gebeurt in /dashboard.
    const blog = pathname === "/admin/collections/blog" || pathname.startsWith("/admin/collections/blog/");
    const uitloggen = pathname === "/admin/logout";
    if (decoded?.rol !== "creator" && !blog && !uitloggen) {
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
