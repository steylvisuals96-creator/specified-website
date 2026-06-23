export async function emailBevestigingLead(lead: {
  naam: string;
  email: string;
  bericht?: string;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return;

  const voornaam = lead.naam.split(" ")[0];

  const body = `
    <div style="font-family:system-ui,sans-serif;background:#0d0d0d;color:#fff;padding:32px;border-radius:8px;max-width:560px">
      <div style="border-bottom:2px solid #facb04;padding-bottom:16px;margin-bottom:24px">
        <span style="color:#facb04;font-weight:700;font-size:1.1rem;letter-spacing:0.05em">SOM VASTGOED</span>
      </div>
      <h2 style="color:#fff;font-size:1.25rem;margin:0 0 12px">Bedankt, ${voornaam}!</h2>
      <p style="color:#aaa;font-size:0.9rem;line-height:1.7;margin:0 0 20px">
        We hebben je bericht goed ontvangen. Een van onze makelaars neemt zo snel mogelijk contact met je op.
      </p>
      ${lead.bericht ? `
      <div style="background:#1a1a1a;border-left:3px solid #facb04;padding:14px 16px;border-radius:4px;margin-bottom:24px">
        <p style="color:#666;font-size:0.75rem;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em">Jouw bericht</p>
        <p style="color:#d0d0d0;font-size:0.88rem;line-height:1.6;margin:0">${lead.bericht}</p>
      </div>` : ""}
      <p style="color:#555;font-size:0.8rem;margin:0">
        Heb je dringende vragen? Bel ons op <a href="tel:+3289000000" style="color:#facb04">+32 89 00 00 00</a>
      </p>
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #1e1e1e">
        <p style="color:#444;font-size:0.75rem;margin:0">SOM Vastgoed · Hasselt · <a href="https://som-vastgoed.vercel.app" style="color:#555">som-vastgoed.be</a></p>
      </div>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SOM Vastgoed <onboarding@resend.dev>",
      to: [lead.email],
      subject: `Bedankt voor je bericht, ${voornaam}!`,
      html: body,
    }),
  }).catch((err) => console.error("[emailBevestigingLead]", err));
}
