// Maakt het creator-account (SteylVisuals) aan, of zet een bestaand account op
// de creator-rol. Nooit wachtwoorden in de code: alles komt uit de omgeving.
//
//   CREATOR_EMAIL=... CREATOR_NAAM=... CREATOR_WACHTWOORD=... npx tsx scripts/seed-creator.ts
//
// Draai dit bewust per omgeving (lokaal, preview, productie).
import { getPayload } from "payload";
import configPromise from "../payload.config";

async function main() {
  const email = process.env.CREATOR_EMAIL;
  const wachtwoord = process.env.CREATOR_WACHTWOORD;
  const naam = process.env.CREATOR_NAAM || "SteylVisuals";
  if (!email || !wachtwoord) {
    console.error("CREATOR_EMAIL en CREATOR_WACHTWOORD zijn verplicht.");
    process.exit(1);
  }
  if (wachtwoord.length < 14) {
    console.error("Kies een wachtwoord van minstens 14 tekens.");
    process.exit(1);
  }

  const payload = await getPayload({ config: configPromise });
  const bestaand = await payload.find({
    collection: "gebruikers",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  if (bestaand.docs[0]) {
    await payload.update({
      collection: "gebruikers",
      id: bestaand.docs[0].id,
      data: { rol: "creator", naam, password: wachtwoord } as any,
      overrideAccess: true,
    });
    console.log(`Bestaand account ${email} is nu creator.`);
  } else {
    await payload.create({
      collection: "gebruikers",
      data: { naam, email, password: wachtwoord, rol: "creator" } as any,
      overrideAccess: true,
    });
    console.log(`Creator-account ${email} aangemaakt.`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
