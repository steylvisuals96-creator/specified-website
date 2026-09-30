import { NextRequest } from "next/server";
import { huidigeBeheerder, json, leesToken, wisSessie } from "@/lib/adminServer";

// Wie is er ingelogd? Het admin-balkje vraagt dit alleen als de vlag-cookie er is.
export async function GET(req: NextRequest) {
  const token = leesToken(req);
  const beheerder = await huidigeBeheerder(token);
  if (!beheerder) {
    const antwoord = json({ ingelogd: false });
    if (token) wisSessie(antwoord); // verlopen of ingetrokken: opruimen
    return antwoord;
  }
  return json({ ingelogd: true, naam: beheerder.naam, rol: beheerder.rol });
}
