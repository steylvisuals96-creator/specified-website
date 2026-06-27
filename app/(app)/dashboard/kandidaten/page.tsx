export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  nieuw: "#dffd7b",
  gescreend: "#60a5fa",
  in_gesprek: "#a78bfa",
  voorgesteld: "#f472b6",
  interview_klant: "#fb923c",
  geplaatst: "#34d399",
  afgewezen: "#6b7280",
  on_hold: "#f59e0b",
};

const statusLabel: Record<string, string> = {
  nieuw: "Nieuw",
  gescreend: "Gescreend",
  in_gesprek: "In gesprek",
  voorgesteld: "Voorgesteld",
  interview_klant: "Interview klant",
  geplaatst: "Geplaatst",
  afgewezen: "Afgewezen",
  on_hold: "On hold",
};

export default async function KandidatenPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const docs = await payload.find({ collection: "kandidaten", limit: 100, sort: "-createdAt" });

  return (
    <DashboardShell activePath="/dashboard/kandidaten" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Kandidaten"
        subtitle={`${docs.totalDocs} kandidaten`}
        actions={<LimeBtn href="/admin/collections/kandidaten/create">+ Kandidaat toevoegen</LimeBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        {docs.docs.length === 0 ? <Empty>Nog geen kandidaten in de pipeline.</Empty> : (
          <Table headers={["Naam", "Sector", "Beschikbaarheid", "Pipeline status", "Bron", "Toegevoegd"]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>
                  <Link href={`/dashboard/kandidaten/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {doc.naam || [doc.voornaam, doc.achternaam].filter(Boolean).join(" ") || "—"}
                  </Link>
                </TD>
                <TD muted>{doc.sector || "—"}</TD>
                <TD muted>{doc.beschikbaarheid || "—"}</TD>
                <TD>
                  <StatusBadge
                    label={statusLabel[doc.status] || doc.status}
                    kleur={statusKleur[doc.status] || "#6b7280"}
                  />
                </TD>
                <TD muted>{doc.bron || "—"}</TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
