/**
 * Maakt het eerste account (of een extra) rechtstreeks, zonder dat iemand al
 * kan inloggen. Vraagt naam, e-mail, rol en wachtwoord; het wachtwoord wordt
 * niet getoond tijdens het typen.
 *
 *   cd beheer && npm run gebruiker:maken
 *
 * Nodig in .env.local: NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SECRET_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const geheim = process.env.SUPABASE_SECRET_KEY;
if (!url || !geheim) {
  console.error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SECRET_KEY moeten in beheer/.env.local staan.");
  process.exit(1);
}

/**
 * Leest een wachtwoord zonder het te tonen: de terminal in ruwe modus, elke
 * toets zelf verwerkt (Enter klaar, Backspace wist, Ctrl-C stopt). De eerdere
 * versie leunde op een interne functie van readline en toonde het wachtwoord
 * toch (2026-11-15).
 */
function verborgen(vraag: string): Promise<string> {
  if (!stdin.isTTY) throw new Error("Draai dit script in een echte terminal: het wachtwoord moet onzichtbaar ingetypt worden.");
  return new Promise((klaar) => {
    let invoer = "";
    stdout.write(vraag);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const opToets = (stuk: string) => {
      for (const teken of stuk) {
        if (teken === "\r" || teken === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", opToets);
          stdout.write("\n");
          return klaar(invoer);
        }
        if (teken === "\u0003") {
          stdin.setRawMode(false);
          stdout.write("\nGestopt.\n");
          process.exit(130);
        }
        if (teken === "\u007f" || teken === "\b") invoer = invoer.slice(0, -1);
        else if (teken >= " ") invoer += teken;
      }
    };
    stdin.on("data", opToets);
  });
}

const rl = createInterface({ input: stdin, output: stdout });
const naam = (await rl.question("Naam: ")).trim();
const email = (await rl.question("E-mail: ")).trim().toLowerCase();
const rol = ((await rl.question("Rol (creator, beheerder, redacteur) [beheerder]: ")).trim() || "beheerder") as string;
rl.close();
if (!["creator", "beheerder", "redacteur"].includes(rol)) {
  console.error("Onbekende rol.");
  process.exit(1);
}
const wachtwoord = await verborgen("Wachtwoord (min. 12 tekens, je ziet niets verschijnen): ");
const herhaal = await verborgen("Nog eens: ");
if (wachtwoord.length < 12 || wachtwoord !== herhaal) {
  console.error("Wachtwoord te kort of niet gelijk.");
  process.exit(1);
}

const admin = createClient(url, geheim, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await admin.auth.admin.createUser({ email, password: wachtwoord, email_confirm: true, user_metadata: { naam } });
if (error || !data.user) {
  console.error("Account aanmaken mislukt:", error?.message);
  process.exit(1);
}
const { error: profielFout } = await admin.from("profielen").insert({ id: data.user.id, naam, rol });
if (profielFout) {
  await admin.auth.admin.deleteUser(data.user.id);
  console.error("Profiel aanmaken mislukt, account weer verwijderd:", profielFout.message);
  process.exit(1);
}
console.log(`Klaar: ${naam} (${email}) is ${rol}. Inloggen kan op /login.`);
