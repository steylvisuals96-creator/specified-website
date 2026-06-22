import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { emailWekelijksRapport } from "@/lib/emailRapport";

const configPromise = import("@payload-config").then((m) => m.default);

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await configPromise;
  const payload = await getPayload({ config: config as any });

  const weekGeleden = new Date();
  weekGeleden.setDate(weekGeleden.getDate() - 7);

  const volgendeWeek = new Date();
  volgendeWeek.setDate(volgendeWeek.getDate() + 7);

  const [nieuweLeads, openTaken, afsprakenDezeWeek] = await Promise.all([
    payload.find({
      collection: "leads",
      where: { createdAt: { greater_than: weekGeleden.toISOString() } },
      limit: 100,
    }),
    payload.find({
      collection: "taken",
      where: { status: { not_equals: "afgerond" } },
      limit: 0,
    }),
    payload.find({
      collection: "afspraken",
      where: {
        and: [
          { datum: { greater_than: new Date().toISOString() } },
          { datum: { less_than: volgendeWeek.toISOString() } },
        ],
      },
      limit: 100,
      sort: "datum",
    }),
  ]);

  await emailWekelijksRapport({
    nieuweLeads: nieuweLeads.totalDocs,
    openTaken: openTaken.totalDocs,
    afsprakenDezeWeek: afsprakenDezeWeek.totalDocs,
    leads: nieuweLeads.docs.map((l: any) => ({ naam: l.naam, status: l.status, bron: l.bron || "—" })),
    afspraken: afsprakenDezeWeek.docs.map((a: any) => ({ titel: a.titel, datum: a.datum, type: a.type })),
  });

  return NextResponse.json({ ok: true });
}
