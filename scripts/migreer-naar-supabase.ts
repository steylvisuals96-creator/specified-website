// Kopieert alle data van de oude MongoDB naar Supabase (Postgres).
//
//   MONGODB_URI=<bron> DATABASE_URI=<supabase> PAYLOAD_SECRET=<iets> npx tsx scripts/migreer-naar-supabase.ts [--opnieuw]
//
// - Leest de MongoDB rechtstreeks (alleen lezen, de bron wordt nooit gewijzigd).
// - Schrijft via Payloads database-laag naar Postgres, zodat relaties en arrays
//   in de juiste tabellen belanden. Hooks en validatie worden bewust overgeslagen:
//   dit is een kopie van bestaande data, geen nieuwe invoer.
// - Mongo-ObjectIds worden nieuwe UUID's (door Postgres toegekend); elke verwijzing
//   (relaties, uploads, afbeeldingen in rich text) wordt omgezet via een ID-tabel.
//   Dat werkt omdat VOLGORDE zo gekozen is dat verwijzingen altijd naar eerder
//   ingevoegde records gaan.
// - Wachtwoorden: de bestaande hash en salt gaan mee, iedereen houdt zijn login.
// - --opnieuw maakt de doeltabellen eerst leeg (voor een proefrun die je herhaalt).
//   Zonder die vlag weigert het script als er al data in Supabase staat.
import { MongoClient, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { getPayload } from "payload";
import configPromise from "../payload.config";

// Volgorde: eerst wat anderen nodig hebben (media, gebruikers), dan wat ernaar verwijst.
const VOLGORDE = [
  "media",
  "documenten",
  "gebruikers",
  "team",
  "bedrijven",
  "kandidaten",
  "vacatures",
  "sollicitaties",
  "activiteiten",
  "blog",
] as const;

const GLOBALS = ["instellingen"] as const;

type IdTabel = Map<string, string>;

function isObjectIdLike(v: unknown): v is ObjectId {
  return v instanceof ObjectId || (typeof v === "object" && v !== null && (v as any)._bsontype === "ObjectId");
}

// Zet een ruw Mongo-document om naar Payload-vorm met nieuwe ID's.
function omzetten(waarde: unknown, ids: IdTabel, pad: string[] = []): unknown {
  if (isObjectIdLike(waarde)) {
    const hex = waarde.toHexString();
    return ids.get(hex) ?? null;
  }
  if (typeof waarde === "string" && /^[a-f0-9]{24}$/.test(waarde) && ids.has(waarde)) {
    return ids.get(waarde);
  }
  if (waarde instanceof Date) return waarde.toISOString();
  if (Array.isArray(waarde)) {
    return waarde.map((x) => {
      const rij = omzetten(x, ids, [...pad, "[]"]);
      // Arrayrijen zonder eigen id krijgen er een (Postgres vereist het).
      if (rij && typeof rij === "object" && !Array.isArray(rij) && (rij as any).id == null) {
        (rij as any).id = new ObjectId().toHexString();
      }
      return rij;
    });
  }
  if (waarde && typeof waarde === "object") {
    const uit: Record<string, unknown> = {};
    const obj = waarde as Record<string, unknown>;
    // Rijen in arrays hebben een eigen id nodig; MongoDB bewaart die als _id.
    if (pad.length > 0 && obj.id === undefined && isObjectIdLike(obj._id)) {
      uit.id = obj._id.toHexString();
    }
    for (const [k, v] of Object.entries(waarde)) {
      if (k === "_id" || k === "__v") continue;
      uit[k] = omzetten(v, ids, [...pad, k]);
    }
    return uit;
  }
  return waarde;
}

async function main() {
  const opnieuw = process.argv.includes("--opnieuw");
  const bron = process.env.MONGODB_URI;
  if (!bron || !process.env.DATABASE_URI) {
    throw new Error("MONGODB_URI (bron) en DATABASE_URI (Supabase) zijn allebei verplicht.");
  }

  const mongo = new MongoClient(bron);
  await mongo.connect();
  const mdb = mongo.db();
  const payload = await getPayload({ config: configPromise });
  const db = payload.db as any;

  // Veiligheid: niet over bestaande data heen schrijven, tenzij --opnieuw.
  for (const slug of [...VOLGORDE].reverse()) {
    const { totalDocs } = await payload.count({ collection: slug as any, overrideAccess: true });
    if (totalDocs > 0 && !opnieuw) {
      throw new Error(`Supabase bevat al ${totalDocs} records in "${slug}". Gebruik --opnieuw om eerst leeg te maken.`);
    }
    if (totalDocs > 0) await db.deleteMany({ collection: slug, where: {} });
  }

  // Stap 1: alle bronrecords inlezen.
  // Mongoose (en dus Payload) meervoudt collectienamen: "kandidaten" staat in
  // MongoDB als "kandidatens". Zoek per collectie de naam die echt bestaat.
  const bestaande = new Set((await mdb.listCollections().toArray()).map((c) => c.name));
  const meervoud = (mongoose as any).pluralize();
  const mongoNaam = (slug: string) =>
    [slug, meervoud ? meervoud(slug) : null, `${slug}s`].find((n) => n && bestaande.has(n)) ?? null;

  const ids: IdTabel = new Map();
  const ruw: Record<string, any[]> = {};
  for (const slug of VOLGORDE) {
    const naam = mongoNaam(slug);
    if (!naam) console.warn(`Let op: geen MongoDB-collectie gevonden voor "${slug}".`);
    ruw[slug] = naam ? await mdb.collection(naam).find({}).toArray() : [];
  }

  // Stap 2: documenten invoegen; de nieuwe UUID gaat meteen in de ID-tabel.
  const verslag: Record<string, { bron: number; doel: number }> = {};
  for (const slug of VOLGORDE) {
    for (const doc of ruw[slug]) {
      const data = omzetten(doc, ids) as Record<string, unknown>;
      const nieuw = await db.create({ collection: slug, data, req: {} });
      ids.set(doc._id.toHexString(), String(nieuw.id));
    }
    const { totalDocs } = await payload.count({ collection: slug as any, overrideAccess: true });
    verslag[slug] = { bron: ruw[slug].length, doel: totalDocs };
    console.log(`${slug.padEnd(14)} ${String(ruw[slug].length).padStart(5)} → ${totalDocs}`);
  }

  // Stap 3: globals (site-instellingen).
  for (const slug of GLOBALS) {
    const doc = await mdb.collection("globals").findOne({ globalType: slug });
    if (!doc) {
      console.log(`${slug.padEnd(14)} (geen data in bron)`);
      continue;
    }
    const data = omzetten(doc, ids) as Record<string, unknown>;
    delete data.globalType;
    const bestaand = await db.findGlobal({ slug, req: {} }).catch(() => null);
    if (bestaand?.id) await db.updateGlobal({ slug, data, req: {} });
    else await db.createGlobal({ slug, data, req: {} });
    console.log(`${slug.padEnd(14)}     1 → 1`);
  }

  const fout = Object.entries(verslag).filter(([, v]) => v.bron !== v.doel);
  await mongo.close();
  if (fout.length) {
    console.error("AANTALLEN KLOPPEN NIET:", fout);
    process.exit(1);
  }
  console.log("Klaar: alle aantallen kloppen.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
