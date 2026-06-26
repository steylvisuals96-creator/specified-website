import { getPayload } from "payload";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const configPromise = import("@payload-config").then((m) => m.default);

const STATUS_LABELS: Record<string, string> = {
  nieuw: "Nieuw", gecontacteerd: "Gecontacteerd", bezoek_gepland: "Bezoek gepland",
  onderhandeling: "Onderhandeling", afgerond: "Afgerond", niet_geinteresseerd: "Niet geïnteresseerd",
};

const BRON_LABELS: Record<string, string> = {
  contactformulier: "Contactformulier website", website: "Website", instagram: "Instagram",
  immoweb: "Immoweb", telefoon: "Telefoon", doorverwijzing: "Doorverwijzing",
};

function escapeCsv(val: unknown): string {
  const s = val == null ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const leads = await payload.find({ collection: "leads", limit: 1000, depth: 1, sort: "-createdAt" });

  const cols = ["Naam", "E-mail", "Telefoon", "Status", "Bron", "Pand", "Budget (€)", "Toegewezen aan", "Opvolging", "Datum aangemeld", "Notities"];
  const rows = leads.docs.map((l: any) => [
    l.naam,
    l.email,
    l.telefoon ?? "",
    STATUS_LABELS[l.status] ?? l.status,
    BRON_LABELS[l.bron] ?? l.bron ?? "",
    l.pand?.titel ?? "",
    l.budget ?? "",
    l.toegewezen_aan?.naam ?? "",
    l.opvolging ? new Date(l.opvolging).toLocaleDateString("nl-BE") : "",
    new Date(l.createdAt).toLocaleDateString("nl-BE"),
    (l.notities ?? "").replace(/\n/g, " "),
  ]);

  const csv = [cols, ...rows].map(r => r.map(escapeCsv).join(",")).join("\n");
  const bom = "﻿"; // UTF-8 BOM zodat Excel correct opent

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
