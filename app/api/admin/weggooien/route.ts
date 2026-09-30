import { NextRequest } from "next/server";
import { cms, eisBeheerder, json } from "@/lib/adminServer";
import { haalConcepten } from "@/lib/adminTeksten";

// Gooit alle concepten weg. De live teksten blijven zoals ze waren.
export async function POST(req: NextRequest) {
  const poort = await eisBeheerder(req, true);
  if ("fout" in poort) return poort.fout;

  const concepten = await haalConcepten(poort.token);
  if (!concepten) return json({ error: "Het CRM is niet bereikbaar." }, 502);

  let weggegooid = 0;
  let mislukt = 0;
  for (const c of concepten) {
    try {
      const res = await cms(`/api/teksten/${c.id}`, {
        token: poort.token,
        method: "PATCH",
        body: { concept: null, concept_door: null },
      });
      if (res.ok) weggegooid += 1;
      else mislukt += 1;
    } catch {
      mislukt += 1;
    }
  }
  return json({ ok: mislukt === 0, weggegooid, mislukt });
}
