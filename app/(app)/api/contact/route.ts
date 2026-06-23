import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naam, email, telefoon, interesse, bericht } = body;

    if (!naam || !email) {
      return NextResponse.json({ error: "Naam en email zijn verplicht" }, { status: 400, headers: corsHeaders });
    }

    const config = await configPromise;
    const payload = await getPayload({ config: config as any });

    await payload.create({
      collection: "leads",
      data: {
        naam,
        email,
        telefoon: telefoon || "",
        interesse: interesse || "",
        bericht: bericht || "",
        bron: "contactformulier",
        status: "nieuw",
      } as any,
    });

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500, headers: corsHeaders });
  }
}
