export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, StatusBadge, Empty } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function TeamPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const docs = await payload.find({ collection: "team", limit: 100 });

  return (
    <DashboardShell activePath="/dashboard/team" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Team"
        subtitle={`${docs.totalDocs} teamleden`}
        actions={<LimeBtn href="/admin/collections/team/create">+ Nieuw teamlid</LimeBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen teamleden toegevoegd.</Empty> : (
          <Table headers={["Naam", "Rol", "LinkedIn"]}>
            {docs.docs.map((doc: any) => {
              const naam = [doc.voornaam, doc.achternaam].filter(Boolean).join(" ") || doc.naam || "—";
              return (
                <tr key={doc.id}>
                  <TD bold>
                    <Link href={`/admin/collections/team/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {naam}
                    </Link>
                  </TD>
                  <TD muted>{doc.role || doc.functie || "—"}</TD>
                  <TD muted>
                    {doc.linkedin
                      ? <a href={doc.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#dffd7b", textDecoration: "none" }}>LinkedIn</a>
                      : "—"}
                  </TD>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
