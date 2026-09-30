import { NextRequest } from "next/server";
import { cms, eisBeheerder, json } from "@/lib/adminServer";
import { GELDIGE_SLEUTELS, ontsmet } from "@/lib/tekstenBasis";

// Bewaart een wijziging als concept. Niets hiervan is zichtbaar voor bezoekers tot
// iemand publiceert (zie ../publiceren).
export async function PUT(req: NextRequest) {
  const poort = await eisBeheerder(req, true);
  if ("fout" in poort) return poort.fout;

  let invoer: { sleutel?: unknown; tekst?: unknown };
  try {
    invoer = await req.json();
  } catch {
    return json({ error: "Ongeldige aanvraag." }, 400);
  }
  const sleutel = typeof invoer.sleutel === "string" ? invoer.sleutel : "";
  if (!GELDIGE_SLEUTELS.has(sleutel)) return json({ error: "Onbekende tekst." }, 400);
  const tekst = typeof invoer.tekst === "string" ? ontsmet(invoer.tekst) : "";
  if (!tekst) return json({ error: "Een tekst mag niet leeg zijn." }, 400);

  try {
    const zoek = await cms(`/api/teksten?where[sleutel][equals]=${encodeURIComponent(sleutel)}&limit=1&depth=0`, {
      token: poort.token,
    });
    if (!zoek.ok) return json({ error: "Het CRM is niet bereikbaar." }, 502);
    const bestaand: { docs?: { id?: unknown }[] } = await zoek.json();
    const id = bestaand.docs?.[0]?.id;

    const data = { concept: tekst, concept_door: poort.beheerder.naam };
    const res =
      typeof id === "string"
        ? await cms(`/api/teksten/${id}`, { token: poort.token, method: "PATCH", body: data })
        : await cms("/api/teksten", { token: poort.token, method: "POST", body: { sleutel, ...data } });
    if (!res.ok) return json({ error: "Opslaan in het CRM is niet gelukt." }, 502);
  } catch {
    return json({ error: "Het CRM is niet bereikbaar." }, 502);
  }
  return json({ ok: true, tekst });
}
