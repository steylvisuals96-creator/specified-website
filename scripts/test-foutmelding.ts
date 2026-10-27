/**
 * Stuurt één proefmail via de foutmelder, om de Resend-instellingen te testen.
 * Toont het echte antwoord van Resend, ook als het misgaat.
 *
 *   read -s RESEND_API_KEY && export RESEND_API_KEY      (plak de sleutel, Enter)
 *   FOUTMELDING_AAN=steylvisuals96@gmail.com npx tsx scripts/test-foutmelding.ts
 */
import { meldFout } from "../lib/foutmelding";

process.env.FOUTMELDING_TEST = "1";
const sleutel = process.env.RESEND_API_KEY ?? "";
if (!sleutel || !process.env.FOUTMELDING_AAN) {
  console.error("Zet RESEND_API_KEY en FOUTMELDING_AAN.");
  process.exit(1);
}
if (sleutel === "re_..." || /voorbeeld\.be$/.test(process.env.FOUTMELDING_AAN)) {
  console.error("Dat zijn de voorbeeldwaarden uit de handleiding. Vul je echte sleutel en e-mailadres in.");
  process.exit(1);
}

const uitkomst = await meldFout(new Error(`Proefmelding ${new Date().toISOString()}: alles werkt`), {
  bron: "test",
  route: "scripts/test-foutmelding.ts",
});

if (uitkomst.verstuurd) {
  console.log(`Verstuurd naar ${process.env.FOUTMELDING_AAN}. Kijk ook in je spam.`);
} else {
  console.error(`Niet verstuurd: ${uitkomst.reden}`);
  process.exit(1);
}
