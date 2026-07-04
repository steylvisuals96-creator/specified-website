export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";
import VacatureEditDrawer from "@/components/VacatureEditDrawer";
import VacatureCreateDrawer from "@/components/VacatureCreateDrawer";
import ZoekFilter from "@/components/ZoekFilter";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  actief: "#dffd7b", ingevuld: "#34d399", on_hold: "#f59e0b",
  gesloten: "#6b7280", geannuleerd: "#6b7280",
};

const statusLabel: Record<string, string> = {
  actief: "Actief", ingevuld: "Ingevuld", on_hold: "On hold",
  gesloten: "Gesloten", geannuleerd: "Geannuleerd",
};

export default async function VacaturesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const where: any = q ? { or: [
    { titel: { like: q } },
    { sector: { like: q } },
    { locatie: { like: q } },
  ]} : undefined;

  const docs = await payload.find({ collection: "vacatures", limit: 100, sort: "-createdAt", where });

  return (
    <DashboardShell activePath="/dashboard/vacatures" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Vacatures"
        subtitle={`${docs.totalDocs} vacatures`}
        actions={<VacatureCreateDrawer />}
      />
      <div style={{ padding: "0.75rem 2.5rem 0" }}>
        <ZoekFilter placeholder="Zoek op titel, sector of locatie…" defaultValue={q ?? ""} />
      </div>
      <div style={{ padding: "1rem 2.5rem 1.5rem" }}>
        {docs.docs.length === 0 ? <Empty>{q ? `Geen resultaten voor "${q}"` : "Nog geen vacatures aangemaakt."}</Empty> : (
          <Table headers={["Titel", "Sector", "Locatie", "Type", "Status", "Aangemaakt", ""]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>
                  <Link href={`/dashboard/vacatures/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {doc.titel}
                  </Link>
                </TD>
                <TD muted>{doc.sector || "—"}</TD>
                <TD muted>{doc.locatie || "—"}</TD>
                <TD muted>{doc.type || "—"}</TD>
                <TD><StatusBadge label={statusLabel[doc.status] || doc.status} kleur={statusKleur[doc.status] || "#6b7280"} /></TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
                <TD>
                  <VacatureEditDrawer id={doc.id} initial={{ titel: doc.titel, sector: doc.sector, type: doc.type, status: doc.status, locatie: doc.locatie, ervaringsniveau: doc.ervaringsniveau, salaris: doc.salaris }} />
                </TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
