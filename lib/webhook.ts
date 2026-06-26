export async function triggerWebhook(event: string, data: Record<string, any>) {
  const url = process.env.AUTOMATION_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, timestamp: new Date().toISOString(), data }),
    });
  } catch {
    // Non-blocking — webhook failures should never break the main flow
  }
}

export async function triggerWhatsAppNotificatie(lead: {
  naam: string;
  email: string;
  telefoon?: string;
  bron?: string;
  bericht?: string;
}) {
  const url = process.env.WHATSAPP_WEBHOOK_URL;
  if (!url) return;
  const tekst = [
    `🏠 *Nieuwe lead — SOM Vastgoed*`,
    ``,
    `👤 *Naam:* ${lead.naam}`,
    `📧 *E-mail:* ${lead.email}`,
    lead.telefoon ? `📞 *Telefoon:* ${lead.telefoon}` : null,
    lead.bron ? `📌 *Bron:* ${lead.bron}` : null,
    lead.bericht ? `\n💬 _${lead.bericht.slice(0, 200)}${lead.bericht.length > 200 ? "…" : ""}_` : null,
  ].filter(Boolean).join("\n");

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tekst, lead }),
    });
  } catch {}
}
