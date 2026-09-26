import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

// Parse email addresses from strings like "Tom Wijdooghe <tom@specified.be>"
function parseAddresses(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => {
      const match = s.match(/<([^>]+)>/);
      return match ? match[1].toLowerCase().trim() : s.toLowerCase().trim();
    })
    .filter(Boolean);
}

// Keywords that suggest a spontaneous candidate application
const SOLLICITATIE_KEYWORDS = [
  "cv", "sollicitatie", "kandidatuur", "application", "resume",
  "interesse", "vacature", "job", "werk", "positie",
];

function looksLikeSollicitatie(subject: string, body: string): boolean {
  const text = `${subject} ${body}`.toLowerCase();
  return SOLLICITATIE_KEYWORDS.some((kw) => text.includes(kw));
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret. Ontbreekt het secret in de omgeving, dan weigeren
    // we alles: eerder verviel de controle stilzwijgend en kon iedereen
    // e-mails in het CRM schrijven.
    const verwacht = process.env.EMAIL_WEBHOOK_SECRET;
    if (!verwacht) {
      console.error("EMAIL_WEBHOOK_SECRET ontbreekt — inkomende e-mail geweigerd.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== verwacht) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await configPromise;
    const payload = await getPayload({ config: config as any });

    // Parse Postmark inbound payload
    const body = await req.json();

    const fromAddresses = parseAddresses(body.From ?? body.from ?? "");
    const toAddresses = parseAddresses(body.To ?? body.to ?? "");
    const ccAddresses = parseAddresses(body.Cc ?? body.cc ?? "");
    const allAddresses = [...fromAddresses, ...toAddresses, ...ccAddresses];

    const onderwerp = body.Subject ?? body.subject ?? "(geen onderwerp)";
    const inhoud = body.TextBody ?? body.text ?? body.StrippedTextReply ?? "";
    const emailId = body.MessageID ?? body.messageId ?? null;
    const datum = body.Date ?? body.date ?? new Date().toISOString();

    // Deduplication: skip if already logged
    if (emailId) {
      const existing = await payload.find({
        collection: "activiteiten" as any,
        where: { emailId: { equals: emailId } },
        limit: 1,
      });
      if (existing.totalDocs > 0) {
        return NextResponse.json({ status: "duplicate", skipped: true });
      }
    }

    // Find matching kandidaten
    const kandidaatMatches = await payload.find({
      collection: "kandidaten" as any,
      where: { email: { in: allAddresses } },
      limit: 5,
    });

    // Find matching bedrijven (by contactpersoon email)
    const bedrijfMatches = await payload.find({
      collection: "bedrijven" as any,
      where: { email: { in: allAddresses } },
      limit: 5,
    });

    const fromFirst = fromAddresses[0] ?? "";
    const toFirst = toAddresses[0] ?? "";

    // Determine richting: inkomend = from candidate/company, uitgaand = from specified
    const specifiedDomains = ["specified.be", "specified-cms.vercel.app"];
    const isUitgaand = specifiedDomains.some((d) => fromFirst.endsWith(d));
    const richting = isUitgaand ? "uitgaand" : "inkomend";

    const created: string[] = [];

    // Log for each matched kandidaat
    for (const kandidaat of kandidaatMatches.docs as any[]) {
      const doc = await payload.create({
        collection: "activiteiten" as any,
        data: {
          type: "email",
          richting,
          datum,
          onderwerp,
          inhoud: inhoud.substring(0, 2000),
          van: fromFirst,
          naar: toFirst,
          kandidaat: kandidaat.id,
          bedrijf: bedrijfMatches.docs[0]?.id ?? null,
          emailId,
        },
      });
      created.push(`kandidaat:${kandidaat.id}`);
    }

    // Log for each matched bedrijf (only if not already linked via kandidaat)
    for (const bedrijf of bedrijfMatches.docs as any[]) {
      if (kandidaatMatches.totalDocs > 0) continue; // already logged with kandidaat link
      await payload.create({
        collection: "activiteiten" as any,
        data: {
          type: "email",
          richting,
          datum,
          onderwerp,
          inhoud: inhoud.substring(0, 2000),
          van: fromFirst,
          naar: toFirst,
          kandidaat: null,
          bedrijf: bedrijf.id,
          emailId,
        },
      });
      created.push(`bedrijf:${bedrijf.id}`);
    }

    // Unknown sender + looks like spontaneous application → auto-create kandidaat
    if (
      kandidaatMatches.totalDocs === 0 &&
      bedrijfMatches.totalDocs === 0 &&
      !isUitgaand &&
      looksLikeSollicitatie(onderwerp, inhoud)
    ) {
      const nameParts = (body.FromName ?? body.fromName ?? "").trim().split(" ");
      const voornaam = nameParts[0] ?? "Onbekend";
      const achternaam = nameParts.slice(1).join(" ") || "—";

      const nieuw = await payload.create({
        collection: "kandidaten" as any,
        data: { voornaam, achternaam, email: fromFirst, status: "nieuw" },
      });

      await payload.create({
        collection: "activiteiten" as any,
        data: {
          type: "email",
          richting: "inkomend",
          datum,
          onderwerp,
          inhoud: inhoud.substring(0, 2000),
          van: fromFirst,
          naar: toFirst,
          kandidaat: (nieuw as any).id,
          emailId,
        },
      });
      created.push(`nieuw_kandidaat:${(nieuw as any).id}`);
    }

    return NextResponse.json({ status: "ok", created });
  } catch (err: any) {
    // Details alleen in de serverlog; de aanroeper krijgt geen interne foutmeldingen.
    console.error("Email webhook error:", err);
    return NextResponse.json({ error: "Verwerking mislukt" }, { status: 500 });
  }
}

// Postmark also sends GET for verification
export async function GET() {
  return NextResponse.json({ status: "email webhook active" });
}
