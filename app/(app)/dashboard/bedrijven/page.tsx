export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  prospect: "#60a5fa",
  actief: "#dffd7b",
  slapend: "#f59e0b",
  voormalig: "#6b7280",
};

const statusLabel: Record<string, string> = {
  prospect: "Prospect",
  actief: "Actief",
  slapend: "Slapend",
  voormalig: "Voormalig",
};

export default async function BedrijvenPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const docs = await payload.find({ collection: "bedrijven", limit: 100, sort: "naam" });

  return (
    <DashboardShell activePath="/dashboard/bedrijven" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Bedrijven"
        subtitle={`${docs.totalDocs} klanten`}
        actions={<LimeBtn href="/admin/collections/bedrijven/create">+ Bedrijf toevoegen</LimeBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen bedrijven toegevoegd.</Empty> : (
          <Table headers={["Naam", "Sector", "Contactpersoon", "E-mail", "Status"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>
                  <Link href={`/admin/collections/bedrijven/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {doc.naam}
                  </Link>
                </TD>
                <TD muted>{doc.sector || "—"}</TD>
                <TD muted>{doc.contactpersoon || "—"}</TD>
                <TD muted>
                  {doc.email
                    ? <a href={`mailto:${doc.email}`} style={{ color: "#dffd7b", textDecoration: "none" }}>{doc.email}</a>
                    : "—"}
                </TD>
                <TD>
                  <StatusBadge
                    label={statusLabel[doc.relatiestatus] || doc.relatiestatus}
                    kleur={statusKleur[doc.relatiestatus] || "#6b7280"}
                  />
                </TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
