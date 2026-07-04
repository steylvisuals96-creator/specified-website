export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, Table, TD, StatusBadge, Empty } from "@/components/DashboardShell";
import BedrijfEditDrawer from "@/components/BedrijfEditDrawer";
import BedrijfCreateDrawer from "@/components/BedrijfCreateDrawer";
import ZoekFilter from "@/components/ZoekFilter";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  prospect: "#60a5fa", actief: "#dffd7b", slapend: "#f59e0b", voormalig: "#6b7280",
};

const statusLabel: Record<string, string> = {
  prospect: "Prospect", actief: "Actief", slapend: "Slapend", voormalig: "Voormalig",
};

export default async function BedrijvenPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const where = q ? { or: [
    { naam: { like: q } },
    { sector: { like: q } },
    { contactpersoon: { like: q } },
    { locatie: { like: q } },
  ]} : undefined;

  const docs = await payload.find({ collection: "bedrijven", limit: 100, sort: "naam", where });

  return (
    <DashboardShell activePath="/dashboard/bedrijven" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Bedrijven"
        subtitle={`${docs.totalDocs} klanten`}
        actions={<BedrijfCreateDrawer />}
      />
      <div style={{ padding: "0.75rem 2.5rem 0" }}>
        <ZoekFilter placeholder="Zoek op naam, sector, contactpersoon…" defaultValue={q ?? ""} />
      </div>
      <div style={{ padding: "1rem 2.5rem 1.5rem" }}>
        {docs.docs.length === 0 ? <Empty>{q ? `Geen resultaten voor "${q}"` : "Nog geen bedrijven toegevoegd."}</Empty> : (
          <Table headers={["Naam", "Sector", "Contactpersoon", "E-mail", "Status", ""]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>
                  <Link href={`/dashboard/bedrijven/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {doc.naam}
                  </Link>
                </TD>
                <TD muted>{doc.sector || "—"}</TD>
                <TD muted>{doc.contactpersoon || "—"}</TD>
                <TD muted>
                  {doc.email ? <a href={`mailto:${doc.email}`} style={{ color: "#dffd7b", textDecoration: "none" }}>{doc.email}</a> : "—"}
                </TD>
                <TD><StatusBadge label={statusLabel[doc.relatiestatus] || doc.relatiestatus} kleur={statusKleur[doc.relatiestatus] || "#6b7280"} /></TD>
                <TD>
                  <BedrijfEditDrawer id={doc.id} initial={{
                    naam: doc.naam, sector: doc.sector, grootte: doc.grootte,
                    contactpersoon: doc.contactpersoon, email: doc.email,
                    telefoon: doc.telefoon, website: doc.website,
                    locatie: doc.locatie, relatiestatus: doc.relatiestatus, notities: doc.notities,
                  }} />
                </TD>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
