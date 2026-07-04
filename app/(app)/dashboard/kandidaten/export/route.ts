import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const configPromise = import("@payload-config").then((m) => m.default);

export async function GET() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await payload.find({ collection: "kandidaten" as any, limit: 1000, sort: "-createdAt" });

  const rows = [
    ["Naam", "Voornaam", "Achternaam", "E-mail", "Telefoon", "Functietitel", "Sector", "Niveau", "Beschikbaarheid", "Status", "Bron", "LinkedIn", "Toegevoegd"],
    ...docs.docs.map((k: any) => [
      k.naam || [k.voornaam, k.achternaam].filter(Boolean).join(" "),
      k.voornaam || "",
      k.achternaam || "",
      k.email || "",
      k.telefoon || "",
      k.functietitel || "",
      k.sector || "",
      k.ervaringsniveau || "",
      k.beschikbaarheid || "",
      k.status || "",
      k.bron || "",
      k.linkedin || "",
      k.createdAt ? new Date(k.createdAt).toLocaleDateString("nl-BE") : "",
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kandidaten-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
