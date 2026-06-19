import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

export async function POST(req: NextRequest) {
  try {
    // Verify shared secret
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { naam, email, telefoon, bericht, bron, pand_ref } = body;

    if (!naam || !email) {
      return NextResponse.json({ error: "naam en email zijn verplicht" }, { status: 400 });
    }

    const config = await configPromise;
    const payload = await getPayload({ config: config as any });

    const lead = await payload.create({
      collection: "leads",
      data: {
        naam,
        email,
        telefoon: telefoon || undefined,
        bericht: bericht || undefined,
        bron: bron || "website",
        status: "nieuw",
        notities: pand_ref ? `Referentie pand: ${pand_ref}` : undefined,
      } as any,
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("[webhook/lead] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
