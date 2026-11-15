import { timingSafeEqual } from "node:crypto";
import { voerSeoUit } from "@/lib/seo/uitvoeren";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  const geheim = process.env.CRON_SECRET;
  const ontvangen = Buffer.from(req.headers.get("authorization") ?? "");
  const verwacht = Buffer.from(`Bearer ${geheim ?? ""}`);
  if (!geheim || ontvangen.length !== verwacht.length || !timingSafeEqual(ontvangen, verwacht)) {
    return Response.json({ status: "niet toegestaan" }, { status: 401 });
  }

  const resultaat = await voerSeoUit();
  const status = resultaat.status === "mislukt" ? 500 : resultaat.status === "configuratie ontbreekt" ? 503 : 200;
  return Response.json(resultaat, { status, headers: { "Cache-Control": "no-store" } });
}

// Next handelt HEAD anders via GET af. Alleen de ingeplande GET start de bot.
export function HEAD() {
  return new Response(null, { status: 405, headers: { Allow: "GET" } });
}
