export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function GebruikersPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const docs = await payload.find({ collection: "gebruikers", limit: 100, sort: "-createdAt" });

  return (
    <DashboardShell activePath="/dashboard/gebruikers" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Gebruikers"
        subtitle={`${docs.totalDocs} gebruikers`}
        actions={<LimeBtn href="/admin/collections/gebruikers/create">+ Nieuwe gebruiker</LimeBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen gebruikers.</Empty> : (
          <Table headers={["Naam", "E-mail", "Aangemaakt"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>
                  <Link href={`/admin/collections/gebruikers/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {doc.naam || doc.email}
                  </Link>
                </TD>
                <TD muted>
                  <a href={`mailto:${doc.email}`} style={{ color: "#dffd7b", textDecoration: "none" }}>{doc.email}</a>
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
