export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  actief: "#dffd7b",
  ingevuld: "#34d399",
  on_hold: "#f59e0b",
  gesloten: "#6b7280",
};

const statusLabel: Record<string, string> = {
  actief: "Actief",
  ingevuld: "Ingevuld",
  on_hold: "On hold",
  gesloten: "Gesloten",
};

export default async function VacaturesPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const docs = await payload.find({ collection: "vacatures", limit: 100, sort: "-createdAt" });

  return (
    <DashboardShell activePath="/dashboard/vacatures" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Vacatures"
        subtitle={`${docs.totalDocs} vacatures`}
        actions={<LimeBtn href="/admin/collections/vacatures/create">+ Nieuwe vacature</LimeBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen vacatures aangemaakt.</Empty> : (
          <Table headers={["Titel", "Sector", "Locatie", "Type", "Status", "Aangemaakt"]}>
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
                <TD>
                  <StatusBadge
                    label={statusLabel[doc.status] || doc.status}
                    kleur={statusKleur[doc.status] || "#6b7280"}
                  />
                </TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
