export async function emailWekelijksRapport(stats: {
  nieuweLeads: number;
  openTaken: number;
  afsprakenDezeWeek: number;
  leads: { naam: string; status: string; bron: string }[];
  afspraken: { titel: string; datum: string; type: string }[];
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFICATIE_EMAIL = process.env.NOTIFICATIE_EMAIL || "steylvisuals96@gmail.com";
  if (!RESEND_API_KEY) return;

  const nu = new Date();
  const week = `${nu.getDate()}/${nu.getMonth() + 1}/${nu.getFullYear()}`;

  const leadsRows = stats.leads.map(l => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#e0dbd0">${l.naam}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#888">${l.status}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#888">${l.bron}</td>
    </tr>`).join("");

  const afspraakRows = stats.afspraken.map(a => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#e0dbd0">${a.titel}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#888">${new Date(a.datum).toLocaleDateString("nl-BE", { weekday: "short", day: "numeric", month: "short" })}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1a1a1a;color:#888">${a.type}</td>
    </tr>`).join("");

  const body = `
    <div style="font-family:system-ui,sans-serif;background:#0d0d0d;color:#fff;padding:32px;border-radius:8px;max-width:620px">
      <div style="border-bottom:2px solid #facb04;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center">
        <span style="color:#facb04;font-weight:700;font-size:1.1rem;letter-spacing:0.05em">SOM VASTGOED</span>
        <span style="color:#555;font-size:0.8rem">Week van ${week}</span>
      </div>
      <h2 style="color:#fff;font-size:1.2rem;margin:0 0 24px">Wekelijks rapport</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:28px">
        <div style="background:#111;border:1px solid #1e1e1e;border-top:2px solid #facb04;border-radius:6px;padding:16px;text-align:center">
          <div style="font-size:1.8rem;font-weight:700;color:#facb04">${stats.nieuweLeads}</div>
          <div style="font-size:0.72rem;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px">Nieuwe leads</div>
        </div>
        <div style="background:#111;border:1px solid #1e1e1e;border-top:2px solid #facb04;border-radius:6px;padding:16px;text-align:center">
          <div style="font-size:1.8rem;font-weight:700;color:#facb04">${stats.afsprakenDezeWeek}</div>
          <div style="font-size:0.72rem;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px">Afspraken</div>
        </div>
        <div style="background:#111;border:1px solid #1e1e1e;border-top:2px solid #facb04;border-radius:6px;padding:16px;text-align:center">
          <div style="font-size:1.8rem;font-weight:700;color:#facb04">${stats.openTaken}</div>
          <div style="font-size:0.72rem;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px">Open taken</div>
        </div>
      </div>

      ${stats.leads.length > 0 ? `
      <h3 style="color:#facb04;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 12px">Nieuwe leads deze week</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#111;border-radius:6px;overflow:hidden">
        <thead><tr>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">Naam</th>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">Status</th>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">Bron</th>
        </tr></thead>
        <tbody>${leadsRows}</tbody>
      </table>` : ""}

      ${stats.afspraken.length > 0 ? `
      <h3 style="color:#facb04;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 12px">Afspraken deze week</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#111;border-radius:6px;overflow:hidden">
        <thead><tr>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">Titel</th>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">Datum</th>
          <th style="padding:8px 12px;text-align:left;font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1e1e1e">Type</th>
        </tr></thead>
        <tbody>${afspraakRows}</tbody>
      </table>` : ""}

      <div style="text-align:center;margin-top:24px">
        <a href="${process.env.NEXT_PUBLIC_CMS_URL || "https://som-vastgoed-cms.vercel.app"}/dashboard" style="display:inline-block;background:#facb04;color:#111;padding:10px 24px;border-radius:4px;text-decoration:none;font-weight:700;font-size:0.82rem">Open CRM dashboard →</a>
      </div>
    </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "SOM Vastgoed CRM <onboarding@resend.dev>",
      to: [NOTIFICATIE_EMAIL],
      subject: `📊 Wekelijks rapport SOM Vastgoed — ${week}`,
      html: body,
    }),
  });
}
