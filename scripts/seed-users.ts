// Tijdelijk seed script — eenmalig uitvoeren via: npx tsx scripts/seed-users.ts
import { getPayload } from "payload";
import configPromise from "../payload.config";

async function main() {
  const payload = await getPayload({ config: configPromise });

  const users = [
    { naam: "Tom Wijdooghe", email: "tom@specified.be", password: "Specified2024!", rol: "consultant" },
    { naam: "Simon Claeys", email: "simon@specified.be", password: "Specified2024!", rol: "consultant" },
  ];

  for (const u of users) {
    try {
      await payload.create({ collection: "gebruikers", data: u });
      console.log(`✓ ${u.naam} aangemaakt`);
    } catch (e: any) {
      console.log(`⚠ ${u.naam}: ${e.message}`);
    }
  }

  process.exit(0);
}

main();
