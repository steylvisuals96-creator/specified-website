export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";
import ZoekFilter from "@/components/ZoekFilter";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  gepubliceerd: "#9bd17f",
  concept: "#6f6d62",
};
const statusLabel: Record<string, string> = {
  gepubliceerd: "Gepubliceerd",
  concept: "Concept",
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const where: any = q
    ? { or: [{ titel: { like: q } }, { samenvatting: { like: q } }] }
    : undefined;

  const docs = await payload.find({
    collection: "blog" as any,
    limit: 100,
    sort: "-publicatiedatum",
    where,
  });

  return (
    <DashboardShell activePath="/dashboard/blog" userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader
        title="Blog"
        subtitle={`${docs.totalDocs} artikels`}
        actions={<LimeBtn href="/dashboard/blog/create">Nieuw artikel</LimeBtn>}
      />
      <div className="px-5 sm:px-8 lg:px-10">
        <ZoekFilter placeholder="Zoek op titel of samenvatting…" defaultValue={q ?? ""} />
      </div>
      <div className="px-5 pt-6 pb-12 sm:px-8 lg:px-10">
        {docs.docs.length === 0 ? (
          <Empty>{q ? `Geen resultaten voor "${q}"` : "Nog geen artikels geschreven."}</Empty>
        ) : (
          <Table headers={["Titel", "Status", "Publicatiedatum", "URL", ""]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>
                  <Link href={`/dashboard/blog/${doc.id}/edit`} style={{ color: "inherit", textDecoration: "none" }}>
                    {doc.titel}
                  </Link>
                </TD>
                <TD>
                  <StatusBadge
                    label={statusLabel[doc.status] || doc.status}
                    kleur={statusKleur[doc.status] || "#6f6d62"}
                  />
                </TD>
                <TD muted>{doc.publicatiedatum ? fmtDate(doc.publicatiedatum) : "—"}</TD>
                <TD muted>/blog/{doc.slug || "—"}</TD>
                <TD>
                  <Link
                    href={`/dashboard/blog/${doc.id}/edit`}
                    style={{ display: "block", textAlign: "center", padding: "0.5rem", borderRadius: "2px", background: "rgba(223,253,123,0.08)", color: "#dffd7b", fontSize: "0.8125rem", fontWeight: 600, border: "1px solid rgba(223,253,123,0.19)", textDecoration: "none" }}
                  >
                    Bewerken
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
