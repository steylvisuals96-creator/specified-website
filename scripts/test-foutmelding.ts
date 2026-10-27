/**
 * Stuurt één proefmail via de foutmelder, om de Resend-instellingen te testen.
 *
 *   RESEND_API_KEY=re_... FOUTMELDING_AAN=jij@voorbeeld.be npx tsx scripts/test-foutmelding.ts
 */
import { meldFout } from "../lib/foutmelding";

process.env.FOUTMELDING_TEST = "1";
if (!process.env.RESEND_API_KEY || !process.env.FOUTMELDING_AAN) {
  console.error("Zet RESEND_API_KEY en FOUTMELDING_AAN.");
  process.exit(1);
}

await meldFout(new Error(`Proefmelding ${new Date().toISOString()}: alles werkt`), {
  bron: "test",
  route: "scripts/test-foutmelding.ts",
});
console.log(`Verstuurd naar ${process.env.FOUTMELDING_AAN}. Niets ontvangen? Kijk in Resend > Logs.`);
