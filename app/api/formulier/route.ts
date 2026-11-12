import { NextResponse, after } from "next/server";
import { meldFout } from "@/lib/foutmelding";
import { CV_EXTENSIES, CV_MAX_BYTES, FORMULIEREN, SOORT_TITEL, isSoort } from "@/lib/formulieren";

/**
 * Ontvangt de formulieren van de site (sollicitatie, open sollicitatie,
 * contact, aanvraag consultant) en mailt ze via Resend:
 *  - een melding naar Specified (FORMULIER_AAN), met het cv als bijlage en
 *    het adres van de bezoeker als antwoordadres;
 *  - een bevestiging naar de bezoeker.
 *
 * Er wordt niets opgeslagen: Specified wil aanvragen alleen in de mail
 * (invullijst 2026-11-12). Daarom geldt een formulier pas als verstuurd als
 * Resend de melding aanvaard heeft.
 *
 * Nodig in Vercel: RESEND_API_KEY, FORMULIER_AAN en FORMULIER_VAN (een adres
 * op een in Resend geverifieerd domein; zonder dat bezorgt Resend alleen bij
 * de eigenaar van het account).
 */
export const runtime = "nodejs";

const MAX_PER_VENSTER = 5;
const VENSTER = 10 * 60 * 1000;
const pogingen = new Map<string, number[]>();

/** Per server(instantie); remt een bot die één formulier blijft insturen. */
function teVaak(ip: string): boolean {
  const nu = Date.now();
  const recent = (pogingen.get(ip) ?? []).filter((t) => nu - t < VENSTER);
  recent.push(nu);
  pogingen.set(ip, recent);
  if (pogingen.size > 2000) pogingen.clear();
  return recent.length > MAX_PER_VENSTER;
}

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const eenRegel = (v: string) => v.replace(/[\r\n\t]+/g, " ").trim();

function fout(boodschap: string, status = 400, veld?: string) {
  return NextResponse.json({ ok: false, fout: boodschap, veld }, { status });
}

async function stuur(sleutel: string, mail: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${sleutel}`, "Content-Type": "application/json" },
    body: JSON.stringify(mail),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Resend weigerde de mail (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return true;
}

export async function POST(req: Request) {
  // Alleen formulieren van de eigen site.
  const origin = req.headers.get("origin");
  if (origin) {
    let host = "";
    try {
      host = new URL(origin).host;
    } catch {
      /* "null" of onzin: geen eigen pagina */
    }
    if (host !== req.headers.get("host")) return fout("Ongeldige aanvraag.", 403);
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "onbekend";
  if (teVaak(ip)) return fout("Te veel aanvragen na elkaar. Probeer het over tien minuten opnieuw.", 429);

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return fout("Het formulier kon niet gelezen worden. Is het bestand kleiner dan 4 MB?", 413);
  }

  const soort = data.get("soort");
  if (!isSoort(soort)) return fout("Onbekend formulier.");

  // Valkuil voor bots: een veld dat mensen niet zien. Ingevuld of te snel
  // verstuurd betekent doen alsof het gelukt is, zonder te mailen.
  const gestart = Number(data.get("gestart"));
  if (data.get("website") || !gestart || Date.now() - gestart < 2500) return NextResponse.json({ ok: true });

  if (data.get("akkoord") !== "ja") return fout("Vink aan dat je akkoord gaat met de privacyverklaring.", 400, "akkoord");

  const { velden } = FORMULIEREN[soort];
  const waarden: [string, string][] = [];
  let cv: File | null = null;

  for (const v of velden) {
    const ruw = data.get(v.naam);
    if (v.type === "file") {
      const bestand = ruw instanceof File && ruw.size > 0 ? ruw : null;
      if (!bestand) {
        if (v.verplicht) return fout("Voeg je cv toe.", 400, v.naam);
        continue;
      }
      const naam = bestand.name.toLowerCase();
      if (!CV_EXTENSIES.some((e) => naam.endsWith(e))) return fout("Het cv moet een pdf- of Word-bestand zijn.", 400, v.naam);
      if (bestand.size > CV_MAX_BYTES) return fout("Het cv is groter dan 4 MB.", 400, v.naam);
      cv = bestand;
      continue;
    }
    let waarde = typeof ruw === "string" ? ruw.trim() : "";
    if (v.type !== "textarea") waarde = eenRegel(waarde);
    if (!waarde) {
      if (v.verplicht) return fout(`Vul "${v.label}" in.`, 400, v.naam);
      continue;
    }
    if (v.max && waarde.length > v.max) return fout(`"${v.label}" is te lang.`, 400, v.naam);
    if (v.type === "email" && !EMAIL.test(waarde)) return fout("Dat e-mailadres klopt niet.", 400, v.naam);
    if (v.type === "url" && !/^https?:\/\/\S+$/i.test(waarde)) return fout("De link moet met https:// beginnen.", 400, v.naam);
    if (v.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(waarde)) return fout(`"${v.label}" is geen geldige datum.`, 400, v.naam);
    if (v.type === "select" && !v.opties?.includes(waarde)) return fout(`Kies een optie bij "${v.label}".`, 400, v.naam);
    waarden.push([v.label, waarde]);
  }

  const veld = (naam: string) => {
    const v = velden.find((x) => x.naam === naam);
    return waarden.find(([l]) => l === v?.label)?.[1] ?? "";
  };
  const naam = veld("naam");
  const email = veld("email");
  const vacature = eenRegel(String(data.get("vacature") ?? "")).slice(0, 200);
  const pagina = eenRegel(String(data.get("pagina") ?? "")).slice(0, 200);

  const sleutel = process.env.RESEND_API_KEY;
  const aan = process.env.FORMULIER_AAN;
  if (!sleutel || !aan) {
    // Lokaal en op een testomgeving zonder sleutels: het formulier is te
    // testen, maar er vertrekt niets. In productie is dit een echte fout.
    if (process.env.VERCEL_ENV !== "production" && process.env.NODE_ENV !== "production") {
      console.info(`[formulier] ${soort} van ${email} (niet gemaild: RESEND_API_KEY of FORMULIER_AAN ontbreekt)`);
      return NextResponse.json({ ok: true, test: true });
    }
    after(() => meldFout(new Error("Formulier ontvangen, maar RESEND_API_KEY of FORMULIER_AAN ontbreekt"), { bron: "route", route: "/api/formulier", methode: "POST" }));
    return fout("Versturen lukt nu niet. Mail ons op info@specified.be, dan helpen we je verder.", 503);
  }

  const van = process.env.FORMULIER_VAN || "Specified website <onboarding@resend.dev>";
  const titel = SOORT_TITEL[soort] + (vacature ? `: ${vacature}` : "");
  const regels = [
    titel,
    "",
    ...waarden.map(([l, w]) => (w.includes("\n") ? `${l}:\n${w}\n` : `${l}: ${w}`)),
    "",
    cv ? `Cv in bijlage: ${cv.name}` : null,
    pagina ? `Verstuurd vanaf: ${pagina}` : null,
    `Tijdstip: ${new Date().toLocaleString("nl-BE", { timeZone: "Europe/Brussels" })}`,
    "",
    "Antwoorden op deze mail gaat rechtstreeks naar de afzender.",
  ].filter((r) => r !== null);

  try {
    await stuur(sleutel, {
      from: van,
      to: aan.split(",").map((a) => a.trim()).filter(Boolean),
      reply_to: email,
      subject: eenRegel(`${titel}, ${naam}`).slice(0, 180),
      text: regels.join("\n"),
      ...(cv
        ? { attachments: [{ filename: cv.name.replace(/[^\w.\- ]+/g, "_").slice(-120), content: Buffer.from(await cv.arrayBuffer()).toString("base64") }] }
        : {}),
    });
  } catch (err) {
    after(() => meldFout(err, { bron: "route", route: "/api/formulier", methode: "POST" }));
    return fout("Versturen lukt nu niet. Probeer het later opnieuw of mail ons op info@specified.be.", 502);
  }

  // De bevestiging mag het formulier niet laten mislukken: de aanvraag is binnen.
  after(async () => {
    try {
      await stuur(sleutel, {
        from: van,
        to: [email],
        reply_to: process.env.FORMULIER_ANTWOORD || "info@specified.be",
        subject: `We hebben je ${soort === "contact" ? "bericht" : soort === "aanvraag" ? "aanvraag" : "sollicitatie"} ontvangen`,
        text: [
          `Dag ${naam},`,
          "",
          FORMULIEREN[soort].bedankt,
          vacature ? `\nHet gaat om: ${vacature}` : null,
          "",
          "Dit is een automatische bevestiging. Heb je nog een vraag, antwoord dan gewoon op deze mail.",
          "",
          "Specified NV",
          "Veldkant 31a, 2550 Kontich",
          "specified.be",
        ].filter((r) => r !== null).join("\n"),
      });
    } catch (err) {
      await meldFout(err, { bron: "bevestigingsmail", route: "/api/formulier", methode: "POST" });
    }
  });

  return NextResponse.json({ ok: true });
}
