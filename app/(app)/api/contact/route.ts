import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

const configPromise = import("@payload-config").then((m) => m.default);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naam, email, telefoon, interesse, bericht } = body;

    if (!naam || !email) {
      return NextResponse.json({ error: "Naam en email zijn verplicht" }, { status: 400 });
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
        bron: "Website",
        status: "nieuw",
      } as any,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
