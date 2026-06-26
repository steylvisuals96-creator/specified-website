import { getPayload } from "payload";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const configPromise = import("@payload-config").then((m) => m.default);

export async function POST(req: Request) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await req.json();
  const { naam, email, telefoon, bron, bericht } = body;

  if (!naam || !email) {
    return NextResponse.json({ error: "Naam en e-mail zijn verplicht" }, { status: 400 });
  }

  // Check op duplicaat
  const bestaand = await payload.find({
    collection: "leads",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (bestaand.totalDocs > 0) {
    return NextResponse.json({ error: "Duplicaat", id: (bestaand.docs[0] as any).id }, { status: 409 });
  }

  const lead = await payload.create({
    collection: "leads",
    data: {
      naam,
      email,
      telefoon: telefoon || undefined,
      bron: bron || "immoweb",
      bericht: bericht || undefined,
      status: "nieuw",
    } as any,
  });

  return NextResponse.json({ ok: true, id: lead.id });
}
