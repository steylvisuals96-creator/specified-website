import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { cms, eisBeheerder, json } from "@/lib/adminServer";
import { haalConcepten } from "@/lib/adminTeksten";
import { TEKSTEN_TAG } from "@/lib/tekstenServer";

// Zet alle concepten live: het concept wordt de live tekst en het concept zelf
// wordt leeg. Daarna wordt de cache van de site ongeldig gemaakt, zodat bezoekers
// de nieuwe tekst meteen zien.
export async function POST(req: NextRequest) {
  const poort = await eisBeheerder(req, true);
  if ("fout" in poort) return poort.fout;

  const concepten = await haalConcepten(poort.token);
  if (!concepten) return json({ error: "Het CRM is niet bereikbaar." }, 502);

  let gepubliceerd = 0;
  let mislukt = 0;
  for (const c of concepten) {
    try {
      const res = await cms(`/api/teksten/${c.id}`, {
        token: poort.token,
        method: "PATCH",
        body: { waarde: c.concept, concept: null, concept_door: null },
      });
      if (res.ok) gepubliceerd += 1;
      else mislukt += 1;
    } catch {
      mislukt += 1;
    }
  }

  // Ook bij een gedeeltelijke mislukking verversen: wat wél gelukt is, moet zichtbaar worden.
  // { expire: 0 }: geen oude versie meer tonen, zodat de beheerder meteen het resultaat ziet.
  revalidateTag(TEKSTEN_TAG, { expire: 0 });
  return json({ ok: mislukt === 0, gepubliceerd, mislukt });
}
