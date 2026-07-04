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
          <Table headers={["Naam", "Sector", "Beschikbaarheid", "Pipeline status", "Bron", "Toegevoegd", ""]}>
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
                <TD>
                  <Link href={`/dashboard/kandidaten/${doc.id}?edit=1`} style={{ color: "var(--muted)", display: "inline-flex", alignItems: "center" }} title="Bewerken">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
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
