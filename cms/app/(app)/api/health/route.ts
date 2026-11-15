import { NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

// Voor de uptime-monitor: draait de CMS en antwoordt de database?
// Geeft geen inhoud terug, alleen ok/fout en de reactietijd.
// Elke check raakt de database, wat het gratis Supabase-project ook wakker houdt.
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 5000;

export async function GET() {
  const start = Date.now();
  try {
    const config = await configPromise;
    const payload = await getPayload({ config });
    await Promise.race([
      payload.count({ collection: "vacatures", overrideAccess: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)),
    ]);
    return NextResponse.json(
      { status: "ok", database: "ok", ms: Date.now() - start, timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    // Details alleen in de serverlogs, niet naar buiten.
    console.error("Health-check database faalt:", err);
    return NextResponse.json(
      { status: "down", database: "fout", ms: Date.now() - start, timestamp: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
