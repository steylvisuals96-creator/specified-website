export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, Table, TD, Empty, fmtDate } from "@/components/DashboardShell";
import GebruikerCreateDrawer from "@/components/GebruikerCreateDrawer";
import GebruikerEditDrawer from "@/components/GebruikerEditDrawer";
import { isBeheerder, isCreator } from "@/lib/access";

const configPromise = import("@payload-config").then((m) => m.default);

const rolLabel: Record<string, string> = {
  creator: "Creator (SteylVisuals)",
  beheerder: "Beheerder",
  consultant: "Recruitment Consultant",
};

export default async function GebruikersPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  if (!isBeheerder(user)) redirect("/dashboard");

  const docs = await payload.find({ collection: "gebruikers", limit: 100, sort: "-createdAt", user, overrideAccess: false });

  return (
    <DashboardShell activePath="/dashboard/gebruikers" userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader
        title="Gebruikers"
        subtitle={`${docs.totalDocs} gebruikers`}
        actions={<GebruikerCreateDrawer />}
      />
      <div className="px-5 py-6 sm:px-8 lg:px-10">
        {docs.docs.length === 0 ? <Empty>Nog geen gebruikers.</Empty> : (
          <Table headers={["Naam", "E-mail", "Rol", "Aangemaakt", ""]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>{doc.naam || doc.email}</TD>
                <TD muted>
                  <a href={`mailto:${doc.email}`} style={{ color: "#dffd7b", textDecoration: "none" }}>{doc.email}</a>
                </TD>
                <TD muted>{rolLabel[doc.rol] || doc.rol || "—"}</TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
                <TD>
                  <GebruikerEditDrawer
                    id={doc.id}
                    initial={{ naam: doc.naam, email: doc.email, rol: doc.rol }}
                    magCreator={isCreator(user)}
                  />
                </TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
