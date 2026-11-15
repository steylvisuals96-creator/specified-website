import { NextResponse } from "next/server";
import { CMS_URL } from "@/lib/settings";
import { LEEST_UIT_SUPABASE } from "@/lib/beheer";

// Altijd live checken, nooit cachen
export const dynamic = "force-dynamic";

async function check(url: string, headers: Record<string, string> = {}, timeoutMs = 8000): Promise<boolean> {
  try {
    const res = await fetch(url, { cache: "no-store", headers, signal: AbortSignal.timeout(timeoutMs) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Gezondheidscheck voor de uptime-monitor: staat de site en bereikt ze de bron
 * van haar inhoud? Sinds de overstap (2026-11-15) is dat Supabase; zonder
 * NEXT_PUBLIC_DATABRON=supabase nog de oude CMS. Raakt de database, zodat het
 * gratis Supabase-project niet na 7 dagen pauzeert.
 */
export async function GET() {
  let checks: Record<string, boolean>;
  if (LEEST_UIT_SUPABASE) {
    const basis = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sleutel = { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "" };
    const [vacatures, homepage] = await Promise.all([
      check(`${basis}/rest/v1/vacatures?select=id&limit=1`, sleutel),
      check(`${basis}/rest/v1/pagina_inhoud?select=sleutel&limit=1`, sleutel),
    ]);
    checks = { website: true, supabase_vacatures: vacatures, supabase_homepage: homepage };
  } else {
    const [vacatures, instellingen] = await Promise.all([
      check(`${CMS_URL}/api/vacatures?limit=1`),
      check(`${CMS_URL}/api/globals/instellingen`),
    ]);
    checks = { website: true, cms_vacatures: vacatures, cms_instellingen: instellingen };
  }

  const healthy = Object.values(checks).every(Boolean);
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", timestamp: new Date().toISOString(), checks },
    { status: healthy ? 200 : 503 },
  );
}
