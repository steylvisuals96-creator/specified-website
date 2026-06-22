export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function GebruikersPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  const docs = await payload.find({ collection: "gebruikers", limit: 100, sort: "-createdAt" });
  return (
    <DashboardShell activePath="/dashboard/gebruikers" userName={(user as any).naam || user.email}>
      <PageHeader title="Gebruikers" subtitle={`${docs.totalDocs} gebruikers`} actions={<GoldBtn href="/dashboard/gebruikers/create">+ Nieuwe gebruiker</GoldBtn>} />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen gebruikers.</Empty> : (
          <Table headers={["Naam", "E-mail", "Rol", "Aangemaakt"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold><Link href={`/dashboard/gebruikers/${doc.id}/edit`} style={{ color: "inherit", textDecoration: "none" }}>{doc.naam || "—"}</Link></TD>
                <TD muted><a href={`mailto:${doc.email}`} style={{ color: "#facb04", textDecoration: "none" }}>{doc.email}</a></TD>
                <TD><StatusBadge label={doc.rol === "beheerder" ? "Beheerder" : "Makelaar"} kleur={doc.rol === "beheerder" ? "#facb04" : "#60a5fa"} /></TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
