export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function GetuigenissenPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  const docs = await payload.find({ collection: "testimonials", limit: 100, sort: "-createdAt" });
  return (
    <DashboardShell activePath="/dashboard/getuigenissen" userName={(user as any).naam || user.email}>
      <PageHeader title="Getuigenissen" subtitle={`${docs.totalDocs} reviews`} actions={<GoldBtn href="/admin/collections/testimonials/create">+ Nieuwe getuigenis</GoldBtn>} />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen getuigenissen.</Empty> : (
          <Table headers={["Naam", "Type", "Beoordeling", "Status", "Datum"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold><Link href={`/admin/collections/testimonials/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>{doc.naam}</Link></TD>
                <TD muted>{doc.type || "—"}</TD>
                <TD muted>{doc.beoordeling ? `${doc.beoordeling}/5 ★` : "—"}</TD>
                <TD><StatusBadge label={doc.goedgekeurd ? "Goedgekeurd" : "In review"} kleur={doc.goedgekeurd ? "#34d399" : "#facb04"} /></TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
