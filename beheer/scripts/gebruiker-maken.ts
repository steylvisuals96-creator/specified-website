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

const rl = createInterface({ input: stdin, output: stdout });

async function verborgen(vraag: string): Promise<string> {
  stdout.write(vraag);
  const oud = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
  (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = () => {};
  const antwoord = await rl.question("");
  (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = oud;
  stdout.write("\n");
  return antwoord;
}

const naam = (await rl.question("Naam: ")).trim();
const email = (await rl.question("E-mail: ")).trim().toLowerCase();
const rol = ((await rl.question("Rol (creator, beheerder, redacteur) [beheerder]: ")).trim() || "beheerder") as string;
if (!["creator", "beheerder", "redacteur"].includes(rol)) {
  console.error("Onbekende rol.");
  process.exit(1);
}
const wachtwoord = await verborgen("Wachtwoord (min. 12 tekens): ");
const herhaal = await verborgen("Nog eens: ");
rl.close();
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
