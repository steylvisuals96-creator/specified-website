export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";
import SollicitatieEditDrawer from "@/components/SollicitatieEditDrawer";
import SollicitatieCreateDrawer from "@/components/SollicitatieCreateDrawer";
import ZoekFilter from "@/components/ZoekFilter";

const configPromise = import("@payload-config").then((m) => m.default);

const statusKleur: Record<string, string> = {
  nieuw: "#dffd7b", screening: "#60a5fa", tel_gescreend: "#f59e0b",
  voorgesteld: "#a78bfa", interview_gepland: "#f472b6",
  interview_afgerond: "#e879f9", aanbod: "#34d399",
  geplaatst: "#34d399", afgewezen: "#6b7280",
};

const statusLabel: Record<string, string> = {
  nieuw: "Nieuw", screening: "Screening", tel_gescreend: "Tel. gescreend",
  voorgesteld: "Voorgesteld", interview_gepland: "Interview gepland",
  interview_afgerond: "Interview afgerond", aanbod: "Aanbod",
  geplaatst: "Geplaatst", afgewezen: "Afgewezen",
};

export default async function SollicitatiePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const [docs, kandidatenDocs, vacaturesDocs] = await Promise.all([
    payload.find({ collection: "sollicitaties", limit: 100, sort: "-updatedAt", depth: 1 }),
    payload.find({ collection: "kandidaten" as any, limit: 200, sort: "achternaam" }),
    payload.find({ collection: "vacatures" as any, limit: 200, sort: "titel" }),
  ]);

  const kandidaatOpties = kandidatenDocs.docs.map((k: any) => ({
    id: k.id, label: `${k.voornaam || ""} ${k.achternaam || ""}`.trim() || k.naam || k.id,
  }));
  const vacatureOpties = vacaturesDocs.docs.map((v: any) => ({ id: v.id, label: v.titel || v.id }));

  // Client-side filter op naam/titel (depth:1 maakt server-side OR over relations complex)
  const filtered = q
    ? docs.docs.filter((doc: any) => {
        const kNaam = typeof doc.kandidaat === "object"
          ? `${doc.kandidaat?.voornaam || ""} ${doc.kandidaat?.achternaam || ""}`.trim() || doc.kandidaat?.naam || ""
          : "";
        const vTitel = typeof doc.vacature === "object" ? doc.vacature?.titel || "" : "";
        const zoek = q.toLowerCase();
        return kNaam.toLowerCase().includes(zoek) || vTitel.toLowerCase().includes(zoek);
      })
    : docs.docs;

  return (
    <DashboardShell activePath="/dashboard/sollicitaties" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Sollicitaties"
        subtitle={`${docs.totalDocs} sollicitaties`}
        actions={<SollicitatieCreateDrawer kandidaten={kandidaatOpties} vacatures={vacatureOpties} />}
      />
      <div style={{ padding: "0.75rem 2.5rem 0" }}>
        <ZoekFilter placeholder="Zoek op kandidaat of vacature…" defaultValue={q ?? ""} />
      </div>
      <div style={{ padding: "1rem 2.5rem 1.5rem" }}>
        {filtered.length === 0 ? <Empty>{q ? `Geen resultaten voor "${q}"` : "Nog geen sollicitaties aangemaakt."}</Empty> : (
          <Table headers={["Kandidaat", "Vacature", "Status", "Consultant", "Bijgewerkt", ""]}>
            {filtered.map((doc: any) => {
              const kandidaatNaam = typeof doc.kandidaat === "object"
                ? (doc.kandidaat?.naam || `${doc.kandidaat?.voornaam || ""} ${doc.kandidaat?.achternaam || ""}`.trim())
                : "—";
              const vacatureTitel = typeof doc.vacature === "object" ? doc.vacature?.titel : "—";
              return (
                <tr key={doc.id}>
                  <TD bold>
                    <Link href={`/dashboard/sollicitaties/${doc.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {kandidaatNaam}
                    </Link>
                  </TD>
                  <TD muted>{vacatureTitel}</TD>
                  <TD><StatusBadge label={statusLabel[doc.status] || doc.status} kleur={statusKleur[doc.status] || "#6b7280"} /></TD>
                  <TD muted>{typeof doc.consultant === "object" ? doc.consultant?.email : "—"}</TD>
                  <TD muted>{fmtDate(doc.updatedAt)}</TD>
                  <TD>
                    <SollicitatieEditDrawer id={doc.id} titel={`${kandidaatNaam} → ${vacatureTitel}`} initial={{
                      status: doc.status, datum_sollicitatie: doc.datum_sollicitatie,
                      datum_interview: doc.datum_interview, startdatum: doc.startdatum, notities: doc.notities,
                    }} />
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
