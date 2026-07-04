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
                <TD>
                  <StatusBadge
                    label={statusLabel[doc.status] || doc.status}
                    kleur={statusKleur[doc.status] || "#6b7280"}
                  />
                </TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
                <TD>
                  <Link href={`/admin/collections/vacatures/${doc.id}`} style={{ color: "var(--muted)", display: "inline-flex", alignItems: "center" }} title="Bewerken">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
                  </Link>
                </TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
