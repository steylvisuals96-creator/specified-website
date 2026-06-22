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
