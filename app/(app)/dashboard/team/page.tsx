export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, Empty } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const rolLabel: Record<string, string> = {
  managing_partner: "Managing Partner",
  senior_consultant: "Senior Recruitment Consultant",
  consultant: "Recruitment Consultant",
  talent: "Talent Acquisition Specialist",
  office: "Office Manager",
};

export default async function TeamPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const docs = await payload.find({ collection: "team", limit: 100, sort: "volgorde" });

  return (
    <DashboardShell activePath="/dashboard/team" userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader
        title="Team"
        subtitle={`${docs.totalDocs} teamleden`}
        actions={<LimeBtn href="/admin/collections/team/create">Nieuw teamlid</LimeBtn>}
      />
      <div className="px-5 py-6 sm:px-8 lg:px-10">
        {docs.docs.length === 0 ? <Empty>Nog geen teamleden toegevoegd.</Empty> : (
          <Table headers={["Naam", "Rol", "E-mail", "LinkedIn", "Actief", ""]}>
            {docs.docs.map((doc: any) => {
              const naam = [doc.voornaam, doc.achternaam].filter(Boolean).join(" ") || doc.naam || "—";
              return (
                <tr key={doc.id}>
                  <TD bold>{naam}</TD>
                  <TD muted>{rolLabel[doc.rol] || doc.rol || "—"}</TD>
                  <TD muted>
                    {doc.email
                      ? <a href={`mailto:${doc.email}`} style={{ color: "#dffd7b", textDecoration: "none" }}>{doc.email}</a>
                      : "—"}
                  </TD>
                  <TD muted>
                    {doc.linkedin
                      ? <a href={doc.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#dffd7b", textDecoration: "none" }}>LinkedIn</a>
                      : "—"}
                  </TD>
                  <TD>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: doc.actief ? "#9bd17f" : "#6f6d62" }}>
                      {doc.actief ? "Actief" : "Inactief"}
                    </span>
                  </TD>
                  <TD>
                    <Link
                      href={`/admin/collections/team/${doc.id}`}
                      style={{ display: "block", textAlign: "center", padding: "0.5rem", borderRadius: "2px", background: "rgba(223,253,123,0.08)", color: "#dffd7b", fontSize: "0.8125rem", fontWeight: 600, border: "1px solid rgba(223,253,123,0.19)", textDecoration: "none" }}
                    >
                      Bewerken
                    </Link>
                  </TD>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
