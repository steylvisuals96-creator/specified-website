import { NextRequest } from "next/server";
import { cms, herkomstOk, json, leesToken, wisSessie } from "@/lib/adminServer";

export async function POST(req: NextRequest) {
  if (!herkomstOk(req)) return json({ error: "Aanvraag geweigerd." }, 403);
  const token = leesToken(req);
  // Ook de sessie in het CRM sluiten, niet alleen de cookie wissen: anders bleef de
  // token geldig tot hij vanzelf verliep. Mislukt dat, dan wissen we de cookie toch.
  if (token) await cms("/api/gebruikers/logout", { token, method: "POST" }).catch(() => undefined);
  const antwoord = json({ ok: true });
  wisSessie(antwoord);
  return antwoord;
}
