export async function emailAfspraakBevestiging(afspraak: {
  titel: string;
  datum: string;
  locatie?: string;
  duur?: string;
  klantNaam?: string;
  klantEmail?: string;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY || !afspraak.klantEmail) return;

  const datum = new Date(afspraak.datum);
  const datumStr = datum.toLocaleDateString("nl-BE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const tijdStr = datum.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });

  const body = `
    <div style="font-family:system-ui,sans-serif;background:#0d0d0d;color:#fff;padding:32px;border-radius:8px;max-width:560px">
      <div style="border-bottom:2px solid #facb04;padding-bottom:16px;margin-bottom:24px">
        <span style="color:#facb04;font-weight:700;font-size:1.1rem;letter-spacing:0.05em">SOM VASTGOED</span>
      </div>
      <h2 style="color:#fff;font-size:1.2rem;margin:0 0 20px">Bevestiging afspraak</h2>
      <p style="color:#aaa;margin:0 0 24px">Beste ${afspraak.klantNaam || ""},</p>
      <p style="color:#aaa;margin:0 0 24px">Uw afspraak is bevestigd. Hieronder vindt u de details:</p>
      <div style="background:#111;border-radius:6px;padding:20px;margin-bottom:24px;border-left:3px solid #facb04">
        <div style="margin-bottom:12px"><span style="color:#666;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em">Afspraak</span><br><span style="color:#fff;font-size:1rem;font-weight:600">${afspraak.titel}</span></div>
        <div style="margin-bottom:12px"><span style="color:#666;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em">Datum</span><br><span style="color:#fff">${datumStr}</span></div>
        <div style="margin-bottom:12px"><span style="color:#666;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em">Tijdstip</span><br><span style="color:#fff">${tijdStr}</span></div>
        ${afspraak.duur ? `<div style="margin-bottom:12px"><span style="color:#666;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em">Duur</span><br><span style="color:#fff">${afspraak.duur} minuten</span></div>` : ""}
        ${afspraak.locatie ? `<div><span style="color:#666;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em">Locatie</span><br><span style="color:#fff">${afspraak.locatie}</span></div>` : ""}
      </div>
      <p style="color:#666;font-size:0.82rem">Heeft u vragen? Neem gerust contact op.<br>Met vriendelijke groeten,<br><strong style="color:#facb04">SOM Vastgoed</strong></p>
    </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "SOM Vastgoed <onboarding@resend.dev>",
      to: [afspraak.klantEmail],
      reply_to: process.env.NOTIFICATIE_EMAIL,
      subject: `✅ Afspraak bevestigd: ${afspraak.titel}`,
      html: body,
    }),
  });
}
