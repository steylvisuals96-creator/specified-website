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

  const { bewaarId, verwijderId } = await req.json();
  if (!bewaarId || !verwijderId) return NextResponse.json({ error: "Ongeldige data" }, { status: 400 });

  const [bewaar, verwijder] = await Promise.all([
    payload.findByID({ collection: "leads", id: bewaarId, depth: 0 }),
    payload.findByID({ collection: "leads", id: verwijderId, depth: 0 }),
  ]) as [any, any];

  const gemergedeNotities = [
    bewaar.notities,
    verwijder.notities ? "[Samengevoegd van " + verwijder.naam + "]:\n" + verwijder.notities : null,
  ].filter(Boolean).join("\n\n");

  const gemergedeActiviteiten = [
    ...(bewaar.activiteiten ?? []),
    ...(verwijder.activiteiten ?? []),
  ];

  const updateData: Record<string, any> = {};
  if (!bewaar.telefoon && verwijder.telefoon) updateData.telefoon = verwijder.telefoon;
  if (!bewaar.bericht && verwijder.bericht) updateData.bericht = verwijder.bericht;
  if (!bewaar.budget && verwijder.budget) updateData.budget = verwijder.budget;
  if (!bewaar.toegewezen_aan && verwijder.toegewezen_aan) updateData.toegewezen_aan = verwijder.toegewezen_aan;
  if (gemergedeNotities) updateData.notities = gemergedeNotities;
  if (gemergedeActiviteiten.length > 0) updateData.activiteiten = gemergedeActiviteiten;

  await payload.update({ collection: "leads", id: bewaarId, data: updateData });
  await payload.delete({ collection: "leads", id: verwijderId });

  return NextResponse.json({ ok: true, bewaarId });
}
