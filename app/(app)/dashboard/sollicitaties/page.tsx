export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  nieuw: "#dffd7b",
  screening: "#60a5fa",
  voorgesteld: "#a78bfa",
  interview_gepland: "#f472b6",
  geplaatst: "#34d399",
  afgewezen: "#6b7280",
};

const statusLabel: Record<string, string> = {
  nieuw: "Nieuw",
  screening: "Screening",
  voorgesteld: "Voorgesteld",
  interview_gepland: "Interview gepland",
  geplaatst: "Geplaatst",
  afgewezen: "Afgewezen",
};

export default async function SollicitatiePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const docs = await payload.find({ collection: "sollicitaties", limit: 100, sort: "-updatedAt", depth: 1 });

  return (
    <DashboardShell activePath="/dashboard/sollicitaties" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Sollicitaties"
        subtitle={`${docs.totalDocs} sollicitaties`}
        actions={<LimeBtn href="/admin/collections/sollicitaties/create">+ Sollicitatie toevoegen</LimeBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen sollicitaties aangemaakt.</Empty> : (
          <Table headers={["Kandidaat", "Vacature", "Status", "Consultant", "Bijgewerkt"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>
                  <Link href={`/admin/collections/sollicitaties/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {typeof doc.kandidaat === "object" ? doc.kandidaat?.naam : "—"}
                  </Link>
                </TD>
                <TD muted>{typeof doc.vacature === "object" ? doc.vacature?.titel : "—"}</TD>
                <TD>
                  <StatusBadge
                    label={statusLabel[doc.status] || doc.status}
                    kleur={statusKleur[doc.status] || "#6b7280"}
                  />
                </TD>
                <TD muted>{typeof doc.consultant === "object" ? doc.consultant?.email : "—"}</TD>
                <TD muted>{fmtDate(doc.updatedAt)}</TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
