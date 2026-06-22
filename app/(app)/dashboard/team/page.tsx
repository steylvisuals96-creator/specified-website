export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function TeamPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  const docs = await payload.find({ collection: "team", limit: 100, sort: "volgorde" });
  return (
    <DashboardShell activePath="/dashboard/team" userName={(user as any).naam || user.email}>
      <PageHeader title="Team" subtitle={`${docs.totalDocs} teamleden`} actions={<GoldBtn href="/admin/collections/team/create">+ Nieuw teamlid</GoldBtn>} />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen teamleden toegevoegd.</Empty> : (
          <Table headers={["Naam", "Functie", "E-mail", "Telefoon", "Status"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold><Link href={`/admin/collections/team/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>{doc.naam}</Link></TD>
                <TD muted>{doc.functie || "—"}</TD>
                <TD muted>{doc.email ? <a href={`mailto:${doc.email}`} style={{ color: "#facb04", textDecoration: "none" }}>{doc.email}</a> : "—"}</TD>
                <TD muted>{doc.telefoon || "—"}</TD>
                <TD><StatusBadge label={doc.actief ? "Actief" : "Inactief"} kleur={doc.actief ? "#34d399" : "#6b7280"} /></TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
