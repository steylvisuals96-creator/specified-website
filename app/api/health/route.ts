import { NextResponse } from "next/server";
import { CMS_URL } from "@/lib/settings";

// Altijd live checken, nooit cachen
export const dynamic = "force-dynamic";

async function check(url: string, timeoutMs = 8000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const [vacatures, instellingen] = await Promise.all([
    check(`${CMS_URL}/api/vacatures?limit=1`),
    check(`${CMS_URL}/api/globals/instellingen`),
  ]);

  const checks = {
    website: true, // als dit antwoordt, staat de site
    cms_vacatures: vacatures,
    cms_instellingen: instellingen,
  };

  const healthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
