export async function emailNieuweLead(lead: {
  naam: string;
  email: string;
  telefoon?: string;
  bericht?: string;
  bron?: string;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFICATIE_EMAIL = process.env.NOTIFICATIE_EMAIL || "steylvisuals96@gmail.com";

  if (!RESEND_API_KEY) return;

  const body = `
    <div style="font-family:system-ui,sans-serif;background:#0d0d0d;color:#fff;padding:32px;border-radius:8px;max-width:560px">
      <div style="border-bottom:2px solid #facb04;padding-bottom:16px;margin-bottom:24px">
        <span style="color:#facb04;font-weight:700;font-size:1.1rem;letter-spacing:0.05em">SOM VASTGOED</span>
        <span style="color:#666;font-size:0.85rem;margin-left:8px">CRM Notificatie</span>
      </div>
      <h2 style="color:#fff;font-size:1.25rem;margin:0 0 20px">🆕 Nieuwe lead binnengekomens</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="color:#888;font-size:0.8rem;padding:8px 0;border-bottom:1px solid #1e1e1e;width:120px">Naam</td>
          <td style="color:#fff;font-size:0.9rem;padding:8px 0;border-bottom:1px solid #1e1e1e"><strong>${lead.naam}</strong></td>
        </tr>
        <tr>
          <td style="color:#888;font-size:0.8rem;padding:8px 0;border-bottom:1px solid #1e1e1e">E-mail</td>
          <td style="color:#facb04;font-size:0.9rem;padding:8px 0;border-bottom:1px solid #1e1e1e"><a href="mailto:${lead.email}" style="color:#facb04">${lead.email}</a></td>
        </tr>
        ${lead.telefoon ? `<tr>
          <td style="color:#888;font-size:0.8rem;padding:8px 0;border-bottom:1px solid #1e1e1e">Telefoon</td>
          <td style="color:#fff;font-size:0.9rem;padding:8px 0;border-bottom:1px solid #1e1e1e"><a href="tel:${lead.telefoon}" style="color:#fff">${lead.telefoon}</a></td>
        </tr>` : ""}
        ${lead.bron ? `<tr>
          <td style="color:#888;font-size:0.8rem;padding:8px 0;border-bottom:1px solid #1e1e1e">Bron</td>
          <td style="color:#fff;font-size:0.9rem;padding:8px 0;border-bottom:1px solid #1e1e1e">${lead.bron}</td>
        </tr>` : ""}
        ${lead.bericht ? `<tr>
          <td style="color:#888;font-size:0.8rem;padding:8px 16px 8px 0;vertical-align:top">Bericht</td>
          <td style="color:#d0d0d0;font-size:0.88rem;padding:8px 0;line-height:1.6">${lead.bericht}</td>
        </tr>` : ""}
      </table>
      <a href="https://som-vastgoed-cms.vercel.app/admin/collections/leads" style="display:inline-block;margin-top:24px;background:#facb04;color:#111;font-weight:700;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:0.85rem">Bekijk in CRM →</a>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SOM Vastgoed CRM <noreply@somvastgoed.be>",
      to: [NOTIFICATIE_EMAIL],
      subject: `🆕 Nieuwe lead: ${lead.naam}`,
      html: body,
    }),
  }).catch((err) => console.error("[emailNieuweLead]", err));
}
