export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function PaginasPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  const docs = await payload.find({ collection: "paginas", limit: 100, sort: "-createdAt" });
  return (
    <DashboardShell activePath="/dashboard/paginas" userName={(user as any).naam || user.email}>
      <PageHeader title="Pagina's" subtitle={`${docs.totalDocs} pagina's`} actions={<GoldBtn href="/admin/collections/paginas/create">+ Nieuwe pagina</GoldBtn>} />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen pagina's aangemaakt.</Empty> : (
          <Table headers={["Titel", "Slug", "Status", "Aangemaakt"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold><Link href={`/admin/collections/paginas/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>{doc.titel || "Zonder titel"}</Link></TD>
                <TD muted>{doc.slug || "—"}</TD>
                <TD><StatusBadge label={doc.gepubliceerd ? "Gepubliceerd" : "Concept"} kleur={doc.gepubliceerd ? "#34d399" : "#6b7280"} /></TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
