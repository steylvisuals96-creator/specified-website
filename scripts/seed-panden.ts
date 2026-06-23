import { getPayload } from "payload";
import config from "../payload.config";

const PANDEN = [
  {
    titel: "Uitzonderlijke woning met karakter",
    type: "woning",
    transactie: "koop",
    status: "beschikbaar",
    prijs: 499900,
    gemeente: "Riemst",
    postcode: "3770",
    slaapkamers: 3,
    bewoonbare_opp: 184,
    uitgelicht: true,
    beschrijving: null,
  },
  {
    titel: "Ruime gezinswoning",
    type: "woning",
    transactie: "koop",
    status: "beschikbaar",
    prijs: 497500,
    gemeente: "Hasselt",
    postcode: "3500",
    slaapkamers: 4,
    bewoonbare_opp: 317,
    uitgelicht: true,
    beschrijving: null,
  },
  {
    titel: "Modern appartement",
    type: "appartement",
    transactie: "koop",
    status: "beschikbaar",
    prijs: 274900,
    gemeente: "Hasselt",
    postcode: "3500",
    slaapkamers: 2,
    bewoonbare_opp: 90,
    uitgelicht: false,
    beschrijving: null,
  },
  {
    titel: "Luxe penthouse",
    type: "appartement",
    transactie: "koop",
    status: "beschikbaar",
    prijs: 419000,
    gemeente: "Diest",
    postcode: "3290",
    slaapkamers: 2,
    bewoonbare_opp: 122,
    uitgelicht: false,
    beschrijving: null,
  },
  {
    titel: "Instapklare eengezinswoning",
    type: "woning",
    transactie: "koop",
    status: "beschikbaar",
    prijs: 397000,
    gemeente: "Genk",
    postcode: "3600",
    slaapkamers: 4,
    bewoonbare_opp: 173,
    uitgelicht: false,
    beschrijving: null,
  },
  {
    titel: "Appartement met ruim terras",
    type: "appartement",
    transactie: "koop",
    status: "beschikbaar",
    prijs: 349000,
    gemeente: "Maasmechelen",
    postcode: "3630",
    slaapkamers: 2,
    bewoonbare_opp: 100,
    terras: true,
    uitgelicht: false,
    beschrijving: null,
  },
];

async function main() {
  console.log("🏠 Panden seeden...");
  const payload = await getPayload({ config: config as any });

  for (const pand of PANDEN) {
    try {
      const created = await payload.create({
        collection: "panden",
        data: pand as any,
      });
      console.log(`✅ ${created.titel} (${created.id})`);
    } catch (err) {
      console.error(`❌ Fout bij ${pand.titel}:`, err);
    }
  }

  console.log("✓ Klaar!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
