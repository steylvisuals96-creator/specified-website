import { NextRequest } from "next/server";
import { alsBeheerder, cms, herkomstOk, ipVan, json, teVaak, zetSessie } from "@/lib/adminServer";

// Inloggen voor het admin-balkje. Het CRM controleert het wachtwoord; wij bewaren
// alleen de sessietoken, in een httpOnly-cookie (zie lib/adminServer.ts).
export async function POST(req: NextRequest) {
  if (!herkomstOk(req)) return json({ error: "Aanvraag geweigerd." }, 403);
  if (teVaak(`login:${ipVan(req)}`, 10, 15 * 60 * 1000)) {
    return json({ error: "Te veel pogingen. Probeer het over enkele minuten opnieuw." }, 429);
  }

  let invoer: { email?: unknown; wachtwoord?: unknown };
  try {
    invoer = await req.json();
  } catch {
    return json({ error: "Ongeldige aanvraag." }, 400);
  }
  const email = typeof invoer.email === "string" ? invoer.email.trim().slice(0, 200) : "";
  const wachtwoord = typeof invoer.wachtwoord === "string" ? invoer.wachtwoord.slice(0, 200) : "";
  if (!email || !wachtwoord) return json({ error: "Vul je e-mailadres en wachtwoord in." }, 400);

  let res: Response;
  try {
    res = await cms("/api/gebruikers/login", { method: "POST", body: { email, password: wachtwoord } });
  } catch {
    return json({ error: "Het CRM is niet bereikbaar. Probeer het later opnieuw." }, 502);
  }
  if (res.status >= 500) return json({ error: "Het CRM is niet bereikbaar. Probeer het later opnieuw." }, 502);
  if (!res.ok) return json({ error: "Inloggen mislukt. Controleer je e-mailadres en wachtwoord." }, 401);

  const data: { token?: unknown; exp?: unknown; user?: { naam?: unknown; rol?: unknown; email?: unknown } } = await res.json();
  const token = typeof data.token === "string" ? data.token : null;
  const beheerder = alsBeheerder(data.user);
  if (!token) return json({ error: "Inloggen mislukt." }, 502);
  if (!beheerder) {
    // Een consultant kan wel in het CRM, maar mag de website niet aanpassen. De sessie
    // die het CRM net opende, sluiten we meteen weer.
    await cms("/api/gebruikers/logout", { token, method: "POST" }).catch(() => undefined);
    return json({ error: "Dit account mag de website niet aanpassen." }, 403);
  }

  const antwoord = json({ ok: true, naam: beheerder.naam });
  zetSessie(antwoord, token, typeof data.exp === "number" ? data.exp : undefined);
  return antwoord;
}
