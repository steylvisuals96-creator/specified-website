export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, LimeBtn, Table, TD, Empty } from "@/components/DashboardShell";
import TeamEditDrawer from "@/components/TeamEditDrawer";

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
    <DashboardShell activePath="/dashboard/team" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Team"
        subtitle={`${docs.totalDocs} teamleden`}
        actions={<LimeBtn href="/admin/collections/team/create">+ Nieuw teamlid</LimeBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
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
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: doc.actief ? "#34d399" : "#6b7280" }}>
                      {doc.actief ? "Actief" : "Inactief"}
                    </span>
                  </TD>
                  <TD>
                    <TeamEditDrawer
                      id={doc.id}
                      initial={{
                        voornaam: doc.voornaam, achternaam: doc.achternaam,
                        rol: doc.rol, email: doc.email, linkedin: doc.linkedin,
                        bio: doc.bio, volgorde: doc.volgorde, actief: doc.actief,
                      }}
                    />
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
