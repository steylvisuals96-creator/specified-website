import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { headers } from "next/headers";

const configPromise = import("@payload-config").then((m) => m.default);

function fmtICS(date: string | Date) {
  // Format: 20260627T140000Z
  return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICS(str: string) {
  return (str ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });

  // Een activiteit bevat het volledige e-mailverkeer met kandidaten en
  // bedrijven. De Local API negeert standaard de toegangsregels van de
  // collectie, dus die controle moet hier expliciet gebeuren — anders is elke
  // activiteit leesbaar voor wie een id raadt.
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await payload
    .findByID({ collection: "activiteiten" as any, id, depth: 1, overrideAccess: false, user })
    .catch(() => null);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const d = doc as any;
  const start = new Date(d.datum);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1 hour

  const kandidaatNaam = d.kandidaat?.naam || [d.kandidaat?.voornaam, d.kandidaat?.achternaam].filter(Boolean).join(" ") || null;
  const bedrijfNaam = d.bedrijf?.naam || null;
  const locatie = [kandidaatNaam, bedrijfNaam].filter(Boolean).join(" @ ") || "Specified";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Specified CMS//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${id}@specified-cms`,
    `DTSTAMP:${fmtICS(new Date())}`,
    `DTSTART:${fmtICS(start)}`,
    `DTEND:${fmtICS(end)}`,
    `SUMMARY:${escapeICS(d.onderwerp)}`,
    `DESCRIPTION:${escapeICS(d.inhoud ?? "")}`,
    `LOCATION:${escapeICS(locatie)}`,
    `ORGANIZER;CN=Specified:mailto:${d.van || "tom@specified.be"}`,
    d.naar ? `ATTENDEE;ROLE=REQ-PARTICIPANT:mailto:${d.naar}` : "",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="meeting-${id}.ics"`,
    },
  });
}
