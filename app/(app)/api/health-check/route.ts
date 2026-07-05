import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WEBSITE_HEALTH_URL = "https://specified-website.vercel.app/api/health";

export async function GET() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(WEBSITE_HEALTH_URL, { cache: "no-store", signal: controller.signal });
    clearTimeout(timer);

    const body = await res.json().catch(() => null);
    return NextResponse.json({
      reachable: true,
      httpStatus: res.status,
      ...body,
    });
  } catch {
    return NextResponse.json({ reachable: false, status: "down" }, { status: 200 });
  }
}
