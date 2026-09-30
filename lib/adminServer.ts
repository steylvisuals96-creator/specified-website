import { NextRequest, NextResponse } from "next/server";
import { CMS_URL } from "@/lib/settings";

/**
 * Gedeelde hulp voor de beheer-API van de website (app/api/admin/*).
 *
 * Inloggen gaat via het CRM: de website stuurt e-mail en wachtwoord door naar het
 * CRM en bewaart de sessietoken in een httpOnly-cookie op het websitedomein. De
 * browser ziet de token dus nooit, en een cookie tussen twee domeinen is niet nodig.
 * Elke wijziging gaat vanaf de server naar het CRM met die token, zodat het CRM
 * zelf bepaalt wat mag (alleen een beheerder).
 */

export const COOKIE_TOKEN = "sp_admin";
/** Geen geheim: enkel een vlag zodat gewone bezoekers nooit de beheer-API aanroepen. */
export const COOKIE_VLAG = "sp_admin_actief";
/** Wie teksten mag aanpassen en publiceren. */
export const TOEGESTANE_ROLLEN = ["beheerder", "creator"];

export type Beheerder = { naam: string; rol: string; email: string };

export function json(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function leesToken(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_TOKEN)?.value || null;
}

/** Roept het CRM aan, met de token van de beheerder als die er is. */
export async function cms(path: string, opties: { token?: string | null; method?: string; body?: unknown } = {}) {
  return fetch(`${CMS_URL}${path}`, {
    method: opties.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opties.token ? { Authorization: `JWT ${opties.token}` } : {}),
    },
    body: opties.body === undefined ? undefined : JSON.stringify(opties.body),
    cache: "no-store",
  });
}

type CmsGebruiker = { naam?: unknown; rol?: unknown; email?: unknown };

export function alsBeheerder(gebruiker: CmsGebruiker | null | undefined): Beheerder | null {
  if (!gebruiker || typeof gebruiker.rol !== "string" || !TOEGESTANE_ROLLEN.includes(gebruiker.rol)) return null;
  return {
    naam: typeof gebruiker.naam === "string" && gebruiker.naam ? gebruiker.naam : "Beheerder",
    rol: gebruiker.rol,
    email: typeof gebruiker.email === "string" ? gebruiker.email : "",
  };
}

/** Wie hoort bij deze token? null als ze verlopen, ongeldig of niet van een beheerder is. */
export async function huidigeBeheerder(token: string | null): Promise<Beheerder | null> {
  if (!token) return null;
  try {
    const res = await cms("/api/gebruikers/me", { token });
    if (!res.ok) return null;
    const data: { user?: CmsGebruiker | null } = await res.json();
    return alsBeheerder(data.user);
  } catch {
    return null;
  }
}

/**
 * Wijzigende aanvragen moeten van onze eigen pagina komen. SameSite=Lax op de
 * cookie dekt het meeste af; dit controleert bovendien de Origin-header, die een
 * browser bij elke POST meestuurt en een andere site niet kan vervalsen.
 */
export function herkomstOk(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function zetSessie(res: NextResponse, token: string, verlooptOp: number | undefined) {
  const productie = process.env.NODE_ENV === "production";
  const seconden = verlooptOp ? Math.max(60, Math.floor(verlooptOp - Date.now() / 1000)) : 7200;
  const basis = { path: "/", sameSite: "lax" as const, secure: productie, maxAge: seconden };
  res.cookies.set({ name: COOKIE_TOKEN, value: token, httpOnly: true, ...basis });
  res.cookies.set({ name: COOKIE_VLAG, value: "1", httpOnly: false, ...basis });
}

export function wisSessie(res: NextResponse) {
  for (const name of [COOKIE_TOKEN, COOKIE_VLAG]) res.cookies.set({ name, value: "", path: "/", maxAge: 0 });
}

// Beperkt het aantal pogingen per IP. Op serverless houdt elke instantie haar eigen
// teller bij: dit vangt gewone misbruikers af, geen bot die er bewust omheen werkt.
// (Het CRM blokkeert bovendien een account na 5 foute wachtwoorden.)
const pogingen = new Map<string, { aantal: number; reset: number }>();

export function teVaak(sleutel: string, max: number, vensterMs: number): boolean {
  const nu = Date.now();
  const huidig = pogingen.get(sleutel);
  if (!huidig || huidig.reset < nu) {
    pogingen.set(sleutel, { aantal: 1, reset: nu + vensterMs });
    return false;
  }
  huidig.aantal += 1;
  return huidig.aantal > max;
}

export function ipVan(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "onbekend";
}

/**
 * Gemeenschappelijke poort voor alle wijzigende routes: juiste herkomst, een
 * geldige beheerder, en de token die we daarna aan het CRM doorgeven.
 */
export async function eisBeheerder(
  req: NextRequest,
  wijzigend: boolean
): Promise<{ beheerder: Beheerder; token: string } | { fout: NextResponse }> {
  // Een gewone GET vanaf dezelfde pagina stuurt geen Origin mee; wijzigen wel altijd.
  if (wijzigend && !herkomstOk(req)) return { fout: json({ error: "Aanvraag geweigerd." }, 403) };
  const token = leesToken(req);
  const beheerder = await huidigeBeheerder(token);
  if (!beheerder || !token) return { fout: json({ error: "Niet ingelogd." }, 401) };
  return { beheerder, token };
}
