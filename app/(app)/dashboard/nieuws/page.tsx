export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function NieuwsPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  const docs = await payload.find({ collection: "nieuws", limit: 100, sort: "-publicatiedatum" });
  return (
    <DashboardShell activePath="/dashboard/nieuws" userName={(user as any).naam || user.email}>
      <PageHeader title="Nieuws" subtitle={`${docs.totalDocs} berichten`} actions={<GoldBtn href="/dashboard/nieuws/create">+ Nieuw bericht</GoldBtn>} />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen nieuwsberichten.</Empty> : (
          <Table headers={["Titel", "Categorie", "Status", "Publicatiedatum"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold><Link href={`/dashboard/nieuws/${doc.id}/edit`} style={{ color: "inherit", textDecoration: "none" }}>{doc.titel || "Zonder titel"}</Link></TD>
                <TD muted>{doc.categorie || "—"}</TD>
                <TD><StatusBadge label={doc.gepubliceerd ? "Gepubliceerd" : "Concept"} kleur={doc.gepubliceerd ? "#34d399" : "#6b7280"} /></TD>
                <TD muted>{doc.publicatiedatum ? fmtDate(doc.publicatiedatum) : "—"}</TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
