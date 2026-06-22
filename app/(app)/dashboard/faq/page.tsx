export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, Empty } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function FAQPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  const docs = await payload.find({ collection: "faq", limit: 100, sort: "volgorde" });
  return (
    <DashboardShell activePath="/dashboard/faq" userName={(user as any).naam || user.email}>
      <PageHeader title="FAQ" subtitle={`${docs.totalDocs} vragen`} actions={<GoldBtn href="/dashboard/faq/create">+ Nieuwe vraag</GoldBtn>} />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen FAQ vragen.</Empty> : (
          <Table headers={["Vraag", "Categorie", "Volgorde"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold><Link href={`/dashboard/faq/${doc.id}/edit`} style={{ color: "inherit", textDecoration: "none" }}>{doc.vraag}</Link></TD>
                <TD muted>{doc.categorie || "—"}</TD>
                <TD muted>{doc.volgorde ?? "—"}</TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
