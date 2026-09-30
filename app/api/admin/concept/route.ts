import { NextRequest } from "next/server";
import { eisBeheerder, json } from "@/lib/adminServer";
import { haalConcepten } from "@/lib/adminTeksten";

// Alle wijzigingen die nog niet live staan, als { sleutel: tekst }.
export async function GET(req: NextRequest) {
  const poort = await eisBeheerder(req, false);
  if ("fout" in poort) return poort.fout;
  const docs = await haalConcepten(poort.token);
  if (!docs) return json({ error: "Het CRM is niet bereikbaar." }, 502);
  return json({ concept: Object.fromEntries(docs.map((d) => [d.sleutel, d.concept])) });
}
