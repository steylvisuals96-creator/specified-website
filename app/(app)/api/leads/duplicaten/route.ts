import { getPayload } from "payload";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const configPromise = import("@payload-config").then((m) => m.default);

function normaliseer(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function normaliseerTel(t: string) {
  return t.replace(/[\s\-\(\)\.]/g, "").replace(/^\+32/, "0").replace(/^0032/, "0");
}

export async function GET() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const res = await payload.find({ collection: "leads", limit: 1000, depth: 0 });
  const leads = res.docs as any[];

  const groepen: { reden: string; leads: any[] }[] = [];
  const verwerkt = new Set<string>();

  // Groepeer op e-mail
  const byEmail: Record<string, any[]> = {};
  for (const l of leads) {
    if (!l.email) continue;
    const key = normaliseer(l.email);
    if (!byEmail[key]) byEmail[key] = [];
    byEmail[key].push(l);
  }
  for (const [email, groep] of Object.entries(byEmail)) {
    if (groep.length < 2) continue;
    const ids = groep.map((l: any) => l.id);
    if (ids.some((id: string) => verwerkt.has(id))) continue;
    ids.forEach((id: string) => verwerkt.add(id));
    groepen.push({ reden: `Zelfde e-mail: ${email}`, leads: groep });
  }

  // Groepeer op telefoonnummer
  const byTel: Record<string, any[]> = {};
  for (const l of leads) {
    if (!l.telefoon) continue;
    const key = normaliseerTel(l.telefoon);
    if (key.length < 7) continue;
    if (!byTel[key]) byTel[key] = [];
    byTel[key].push(l);
  }
  for (const [tel, groep] of Object.entries(byTel)) {
    if (groep.length < 2) continue;
    const ids = groep.map((l: any) => l.id);
    if (ids.some((id: string) => verwerkt.has(id))) continue;
    ids.forEach((id: string) => verwerkt.add(id));
    groepen.push({ reden: `Zelfde telefoonnummer: ${tel}`, leads: groep });
  }

  // Groepeer op naam (exact na normalisatie)
  const byNaam: Record<string, any[]> = {};
  for (const l of leads) {
    if (!l.naam) continue;
    const key = normaliseer(l.naam);
    if (!byNaam[key]) byNaam[key] = [];
    byNaam[key].push(l);
  }
  for (const [naam, groep] of Object.entries(byNaam)) {
    if (groep.length < 2) continue;
    const ids = groep.map((l: any) => l.id);
    if (ids.some((id: string) => verwerkt.has(id))) continue;
    ids.forEach((id: string) => verwerkt.add(id));
    groepen.push({ reden: `Zelfde naam: ${naam}`, leads: groep });
  }

  // Serialize — enkel de velden die de UI nodig heeft
  const result = groepen.map(g => ({
    reden: g.reden,
    leads: g.leads.map(l => ({
      id: l.id,
      naam: l.naam,
      email: l.email,
      telefoon: l.telefoon ?? null,
      status: l.status,
      createdAt: l.createdAt,
    })),
  }));

  return NextResponse.json({ groepen: result, totaal: result.length });
}
