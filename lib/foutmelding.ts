/**
 * Mailt serverfouten via Resend, met een limiet zodat één probleem je inbox
 * niet overspoelt.
 *
 * - Dezelfde fout (zelfde soort, route en boodschap zonder getallen/ID's)
 *   wordt hooguit één keer per uur gemaild. Dat loopt via Resends
 *   Idempotency-Key, die geldt over alle Vercel-servers heen.
 * - Daarbovenop per server maximaal MAX_PER_UUR mails per uur.
 * - Gebruikersfouten (status < 500, bv. ongeldige invoer) en Next-interne
 *   signalen (redirect, notFound) worden genegeerd.
 * - Werkt alleen in productie en als RESEND_API_KEY en FOUTMELDING_AAN gezet
 *   zijn. De melder zelf gooit nooit een fout.
 *
 * Werkt in Node en Edge: geen Node-specifieke imports.
 */

const PROJECT = "specified-website";
const MAX_PER_UUR = 10;
const UUR = 60 * 60 * 1000;

type Context = {
  /** Waar de fout vandaan komt, bv. "action", "route", "render" of een eigen label. */
  bron: string;
  /** Pad zonder querystring. */
  pad?: string;
  methode?: string;
  /** Routebestand, bv. /dashboard/kandidaten/[id]. */
  route?: string;
};

// Per server(instantie): wanneer een fout laatst gemaild is en hoe vaak hij
// sindsdien nog voorkwam.
const laatst = new Map<string, { tijd: number; onderdrukt: number }>();
let venster = { start: 0, aantal: 0 };

function normaliseer(tekst: string): string {
  return tekst
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<id>")
    .replace(/\b[0-9a-f]{12,}\b/gi, "<hex>")
    .replace(/\d+/g, "#")
    .slice(0, 300);
}

// FNV-1a: kort, stabiel en zonder crypto-module.
function hash(tekst: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

function eigenschap(err: unknown, naam: string): unknown {
  return typeof err === "object" && err !== null && naam in err ? (err as Record<string, unknown>)[naam] : undefined;
}

export function moetGemeldWorden(err: unknown): boolean {
  const status = eigenschap(err, "status") ?? eigenschap(err, "statusCode");
  if (typeof status === "number" && status < 500) return false;
  const digest = eigenschap(err, "digest");
  if (typeof digest === "string" && /^(NEXT_|DYNAMIC_SERVER_USAGE)/.test(digest)) return false;
  return true;
}

export async function meldFout(err: unknown, ctx: Context): Promise<void> {
  try {
    const sleutel = process.env.RESEND_API_KEY;
    const aan = process.env.FOUTMELDING_AAN;
    if (!sleutel || !aan) return;
    if (process.env.NODE_ENV !== "production" && process.env.FOUTMELDING_TEST !== "1") return;
    if (!moetGemeldWorden(err)) return;

    const naam = err instanceof Error ? err.name : "Fout";
    const boodschap = err instanceof Error ? err.message : String(err);
    const vingerafdruk = hash(`${ctx.bron}|${ctx.route ?? ctx.pad ?? ""}|${naam}|${normaliseer(boodschap)}`);

    const nu = Date.now();
    const vorige = laatst.get(vingerafdruk);
    if (vorige && nu - vorige.tijd < UUR) {
      vorige.onderdrukt++;
      return;
    }
    if (nu - venster.start >= UUR) venster = { start: nu, aantal: 0 };
    if (venster.aantal >= MAX_PER_UUR) return;
    venster.aantal++;
    const onderdrukt = vorige?.onderdrukt ?? 0;
    laatst.set(vingerafdruk, { tijd: nu, onderdrukt: 0 });
    if (laatst.size > 500) laatst.clear();

    const digest = eigenschap(err, "digest");
    // De stack begint zelf al met "Naam: boodschap".
    const stack = err instanceof Error && err.stack ? err.stack.split("\n").slice(0, 15).join("\n") : `${naam}: ${boodschap}`;
    const regels = [
      `Project:   ${PROJECT}`,
      `Omgeving:  ${process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "?"}`,
      `Tijd:      ${new Date(nu).toISOString()}`,
      `Bron:      ${ctx.bron}`,
      ctx.route ? `Route:     ${ctx.route}` : null,
      ctx.pad ? `Pad:       ${ctx.methode ? ctx.methode + " " : ""}${ctx.pad}` : null,
      typeof digest === "string" ? `Digest:    ${digest}` : null,
      onderdrukt > 0 ? `\nDeze fout kwam sinds de vorige mail nog ${onderdrukt} keer voor (op deze server).` : null,
      "",
      stack,
      "",
      "Dezelfde fout wordt hooguit één keer per uur gemaild. Volledige logs: Vercel > Logs.",
    ].filter((r) => r !== null);

    const uurVak = Math.floor(nu / UUR);
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sleutel}`,
        "Content-Type": "application/json",
        // Zelfde fout binnen hetzelfde uur = zelfde sleutel; Resend verstuurt dan niets.
        "Idempotency-Key": `${PROJECT}-${vingerafdruk}-${uurVak}`,
      },
      body: JSON.stringify({
        from: process.env.FOUTMELDING_VAN || "Specified monitoring <onboarding@resend.dev>",
        to: aan.split(",").map((a) => a.trim()).filter(Boolean),
        subject: `[${PROJECT}] ${naam}: ${boodschap}`.replace(/\s+/g, " ").slice(0, 150),
        text: regels.join("\n"),
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // De melder mag zelf nooit iets laten mislukken.
  }
}

/** Pad zonder querystring: daar kan persoonlijke info in zitten. */
export function zonderQuery(pad: string): string {
  return pad.split("?")[0];
}
