export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";
import KandidaatEditDrawer from "@/components/KandidaatEditDrawer";
import KandidaatCreateDrawer from "@/components/KandidaatCreateDrawer";
import ZoekFilter from "@/components/ZoekFilter";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  nieuw: "#dffd7b", gescreend: "#60a5fa", in_gesprek: "#a78bfa",
  voorgesteld: "#f472b6", interview_klant: "#fb923c",
  geplaatst: "#34d399", afgewezen: "#6b7280", on_hold: "#f59e0b",
};

const statusLabel: Record<string, string> = {
  nieuw: "Nieuw", gescreend: "Gescreend", in_gesprek: "In gesprek",
  voorgesteld: "Voorgesteld", interview_klant: "Interview klant",
  geplaatst: "Geplaatst", afgewezen: "Afgewezen", on_hold: "On hold",
};

export default async function KandidatenPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const where = q ? { or: [
    { voornaam: { like: q } },
    { achternaam: { like: q } },
    { naam: { like: q } },
    { email: { like: q } },
    { sector: { like: q } },
    { functietitel: { like: q } },
  ]} : undefined;

  const docs = await payload.find({ collection: "kandidaten", limit: 100, sort: "-createdAt", where });

  return (
    <DashboardShell activePath="/dashboard/kandidaten" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Kandidaten"
        subtitle={`${docs.totalDocs} kandidaten`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <a
              href="/dashboard/kandidaten/export"
              style={{ padding: "0.5rem 0.9rem", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}
            >
              ↓ CSV
            </a>
            <KandidaatCreateDrawer />
          </div>
        }
      />
      <div style={{ padding: "0.75rem 2.5rem 0" }}>
        <ZoekFilter placeholder="Zoek op naam, email, sector…" defaultValue={q ?? ""} />
      </div>
      <div style={{ padding: "1rem 2.5rem 1.5rem" }}>
        {docs.docs.length === 0 ? <Empty>{q ? `Geen resultaten voor "${q}"` : "Nog geen kandidaten in de pipeline."}</Empty> : (
          <Table headers={["Naam", "Sector", "Beschikbaarheid", "Status", "Bron", "Toegevoegd", ""]}>
            {docs.docs.map((doc: any) => (
              <tr key={doc.id}>
                <TD bold>
                  <Link href={`/dashboard/kandidaten/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {doc.naam || [doc.voornaam, doc.achternaam].filter(Boolean).join(" ") || "—"}
                  </Link>
                </TD>
                <TD muted>{doc.sector || "—"}</TD>
                <TD muted>{doc.beschikbaarheid || "—"}</TD>
                <TD><StatusBadge label={statusLabel[doc.status] || doc.status} kleur={statusKleur[doc.status] || "#6b7280"} /></TD>
                <TD muted>{doc.bron || "—"}</TD>
                <TD muted>{fmtDate(doc.createdAt)}</TD>
                <TD>
                  <KandidaatEditDrawer id={doc.id} initial={{
                    voornaam: doc.voornaam, achternaam: doc.achternaam,
                    email: doc.email, telefoon: doc.telefoon,
                    sector: doc.sector, ervaringsniveau: doc.ervaringsniveau,
                    beschikbaarheid: doc.beschikbaarheid, functietitel: doc.functietitel,
                    huidige_werkgever: doc.huidige_werkgever, jaren_ervaring: doc.jaren_ervaring,
                    linkedin: doc.linkedin, status: doc.status,
                    gewenst_salaris: doc.gewenst_salaris, notities: doc.notities, bron: doc.bron,
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
