// Payload-migraties voor Postgres, via de API (de payload-CLI laadt de config
// als CommonJS en struikelt over de rich-text-editor).
//   DATABASE_URI=... npx tsx scripts/db-migratie.ts maak <naam>   nieuwe migratie
//   DATABASE_URI=... npx tsx scripts/db-migratie.ts draai         migraties uitvoeren
//   npx tsx scripts/db-migratie.ts types                          payload-types.ts opnieuw maken
//   npx tsx scripts/db-migratie.ts importmap                      admin/importMap.js opnieuw maken
import { generateImportMap, getPayload } from "payload";
import { generateTypes } from "payload/node";

async function main() {
  const [actie, naam] = process.argv.slice(2);
  if (actie === "importmap") {
    // Productie draait met R2-opslag; zonder deze waarden laat de generator de
    // S3-uploadcomponent weg en breken uploads in /admin. Er wordt niets verbonden.
    for (const k of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]) process.env[k] ||= "importmap";
  }
  // Pas hier laden: de config leest de R2-variabelen bij het importeren.
  const configPromise = (await import("../payload.config")).default;
  if (actie === "types") {
    await generateTypes(await configPromise);
    process.exit(0);
  }
  if (actie === "importmap") {
    await generateImportMap(await configPromise, { log: true, force: true });
    process.exit(0);
  }
  if (!process.env.DATABASE_URI) throw new Error("DATABASE_URI ontbreekt.");
  const payload = await getPayload({ config: configPromise });
  const db = payload.db as any;
  if (actie === "maak") {
    await db.createMigration({ migrationName: naam || "migratie", payload, forceAcceptWarning: true });
  } else if (actie === "draai") {
    await db.migrate();
  } else {
    throw new Error("Gebruik: maak <naam> | draai");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
