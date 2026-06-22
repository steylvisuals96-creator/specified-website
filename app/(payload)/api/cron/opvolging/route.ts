import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

export async function GET(req: NextRequest) {
  // Vercel cron authenticatie
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFICATIE_EMAIL = process.env.NOTIFICATIE_EMAIL || "steylvisuals96@gmail.com";

  const config = await configPromise;
  const payload = await getPayload({ config: config as any });

  // Leads die 2+ dagen geleden binnenkwamen en nog status "nieuw" hebben
  const tweedagenGeleden = new Date();
  tweedagenGeleden.setDate(tweedagenGeleden.getDate() - 2);

  const leads = await payload.find({
    collection: "leads",
    where: {
      and: [
        { status: { equals: "nieuw" } },
        { createdAt: { less_than: tweedagenGeleden.toISOString() } },
      ],
    },
    limit: 50,
  });

  if (leads.docs.length === 0) {
    return NextResponse.json({ ok: true, herinnerd: 0 });
  }

  const lijst = leads.docs.map((l: any) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#e0dbd0">${l.naam}</td><td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#888">${l.email}</td><td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#facb04">${Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 86400000)} dagen</td></tr>`
  ).join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0d0d0d;color:#fff;padding:32px;border-radius:8px;max-width:580px">
      <div style="border-bottom:2px solid #facb04;padding-bottom:16px;margin-bottom:24px">
        <span style="color:#facb04;font-weight:700;font-size:1.1rem;letter-spacing:0.05em">SOM VASTGOED</span>
        <span style="color:#666;font-size:0.85rem;margin-left:8px">Opvolging herinnering</span>
      </div>
      <h2 style="color:#fff;margin:0 0 8px">⚠️ ${leads.docs.length} lead${leads.docs.length > 1 ? "s" : ""} wacht${leads.docs.length === 1 ? "" : "en"} op opvolging</h2>
      <p style="color:#888;margin:0 0 20px;font-size:0.85rem">De volgende leads hebben status "Nieuw" en zijn nog niet gecontacteerd:</p>
      <table style="width:100%;border-collapse:collapse;background:#111;border-radius:6px;overflow:hidden;margin-bottom:24px">
        <thead><tr>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">Naam</th>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">E-mail</th>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">Wacht al</th>
        </tr></thead>
        <tbody>${lijst}</tbody>
      </table>
      <div style="text-align:center">
        <a href="${process.env.NEXT_PUBLIC_CMS_URL || "https://som-vastgoed-cms.vercel.app"}/dashboard/leads" style="display:inline-block;background:#facb04;color:#111;padding:10px 24px;border-radius:4px;text-decoration:none;font-weight:700;font-size:0.82rem">Bekijk leads →</a>
      </div>
    </div>`;

  if (RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "SOM Vastgoed CRM <onboarding@resend.dev>",
        to: [NOTIFICATIE_EMAIL],
        subject: `⚠️ Opvolging nodig: ${leads.docs.length} lead${leads.docs.length > 1 ? "s" : ""} wacht`,
        html,
      }),
    });
  }

  return NextResponse.json({ ok: true, herinnerd: leads.docs.length });
}
