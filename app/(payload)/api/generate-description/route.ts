import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { genereerPandBeschrijving } from "@/lib/claude";

const configPromise = import("@payload-config").then((m) => m.default);

export async function POST(req: NextRequest) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const tekst = await genereerPandBeschrijving(body);
  return NextResponse.json({ tekst });
}
