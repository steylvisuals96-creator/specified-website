import { NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

const SEED_SECRET = process.env.SEED_SECRET || "som-seed-2026";

const PANDEN = [
  { titel: "Uitzonderlijke woning met karakter", type: "woning", transactie: "koop", status: "beschikbaar", prijs: 499900, gemeente: "Riemst", postcode: "3770", slaapkamers: 3, bewoonbare_opp: 184, uitgelicht: true },
  { titel: "Ruime gezinswoning", type: "woning", transactie: "koop", status: "beschikbaar", prijs: 497500, gemeente: "Hasselt", postcode: "3500", slaapkamers: 4, bewoonbare_opp: 317, uitgelicht: true },
  { titel: "Modern appartement", type: "appartement", transactie: "koop", status: "beschikbaar", prijs: 274900, gemeente: "Hasselt", postcode: "3500", slaapkamers: 2, bewoonbare_opp: 90, uitgelicht: false },
  { titel: "Luxe penthouse", type: "appartement", transactie: "koop", status: "beschikbaar", prijs: 419000, gemeente: "Diest", postcode: "3290", slaapkamers: 2, bewoonbare_opp: 122, uitgelicht: false },
  { titel: "Instapklare eengezinswoning", type: "woning", transactie: "koop", status: "beschikbaar", prijs: 397000, gemeente: "Genk", postcode: "3600", slaapkamers: 4, bewoonbare_opp: 173, uitgelicht: false },
  { titel: "Appartement met ruim terras", type: "appartement", transactie: "koop", status: "beschikbaar", prijs: 349000, gemeente: "Maasmechelen", postcode: "3630", slaapkamers: 2, bewoonbare_opp: 100, terras: true, uitgelicht: false },
];

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 401 });
  }

  const config = await configPromise;
  const payload = await getPayload({ config: config as any });

  const results = [];
  for (const pand of PANDEN) {
    try {
      const doc = await payload.create({ collection: "panden", data: pand as any });
      results.push({ ok: true, id: doc.id, titel: doc.titel });
    } catch (err: any) {
      results.push({ ok: false, titel: pand.titel, error: err?.message });
    }
  }

  return NextResponse.json({ results });
}
