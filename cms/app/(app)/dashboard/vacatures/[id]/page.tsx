export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import DashboardShell, { PageHeader, LimeBtn, StatusBadge, fmtDate } from "@/components/DashboardShell";
import VacatureEditDrawer from "@/components/VacatureEditDrawer";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const MUTED = "var(--bone-400)";
const BORDER = "var(--line)";
const TEXT = "var(--bone-100)";

const statusKleur: Record<string, string> = {
  actief: "#9bd17f", on_hold: "#d9a86c", ingevuld: "#dffd7b", geannuleerd: "#6f6d62",
};
const statusLabel: Record<string, string> = {
  actief: "Actief", on_hold: "On hold", ingevuld: "Ingevuld", geannuleerd: "Geannuleerd",
};
const typeLabel: Record<string, string> = {
  vast: "Vast", freelance: "Freelance", interim: "Interim", student: "Studentenjob",
};
const niveauLabel: Record<string, string> = {
  junior: "Junior", medior: "Medior", senior: "Senior", lead: "Lead / Expert",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", width: "8rem", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "0.875rem", color: MUTED }}>{value}</span>
    </div>
  );
}

export default async function VacatureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const vacature = await payload.findByID({ collection: "vacatures" as any, id, depth: 1 }).catch(() => null);
  if (!vacature) notFound();
  const v = vacature as any;

  // Sollicitaties for this vacature
  const sollicitaties = await payload.find({
    collection: "sollicitaties" as any,
    where: { vacature: { equals: id } },
    depth: 1,
    limit: 50,
    sort: "-createdAt",
  });

  return (
    <DashboardShell activePath="/dashboard/vacatures" userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader
        title={v.titel}
        subtitle="Vacature detail"
        actions={<LimeBtn href="/dashboard/vacatures" outline>Terug</LimeBtn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 0, minHeight: "calc(100vh - 90px)" }}>
        {/* Sidebar */}
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: "1.5rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: TEXT, marginBottom: "0.4rem" }}>{v.titel}</div>
            {v.status && <StatusBadge label={statusLabel[v.status] || v.status} kleur={statusKleur[v.status] || "#6f6d62"} />}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <InfoRow label="Sector" value={v.sector} />
            <InfoRow label="Type" value={typeLabel[v.type] || v.type} />
            <InfoRow label="Niveau" value={niveauLabel[v.ervaringsniveau] || v.ervaringsniveau} />
            <InfoRow label="Locatie" value={v.locatie} />
            <InfoRow label="Salaris" value={v.salaris} />
            <InfoRow label="Opdrachtgever" value={v.opdrachtgever?.naam} />
            <InfoRow label="Gepubliceerd" value={v.gepubliceerd_op ? fmtDate(v.gepubliceerd_op) : null} />
          </div>

          <VacatureEditDrawer
            id={id}
            initial={{ titel: v.titel, sector: v.sector, type: v.type, status: v.status, locatie: v.locatie, ervaringsniveau: v.ervaringsniveau, salaris: v.salaris }}
          />
        </div>

        {/* Sollicitaties list */}
        <div style={{ padding: "1.5rem 2rem", overflowY: "auto" }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", marginBottom: "1rem" }}>
            {sollicitaties.totalDocs} sollicitaties
          </div>

          {sollicitaties.docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--bone-400)", fontSize: "0.875rem" }}>Nog geen sollicitaties voor deze vacature.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {sollicitaties.docs.map((s: any) => {
                const solStatusKleur: Record<string, string> = {
                  nieuw: "#8fb3d9", screening: "#dffd7b", tel_gescreend: "#b5a1d8",
                  voorgesteld: "#d9a86c", interview_gepland: "#d9a86c", interview_afgerond: "#b5a1d8",
                  aanbod: "#9bd17f", geplaatst: "#9bd17f", afgewezen: "#6f6d62", teruggetrokken: "#6f6d62",
                };
                const solStatusLabel: Record<string, string> = {
                  nieuw: "Nieuw", screening: "In screening", tel_gescreend: "Tel. gescreend",
                  voorgesteld: "Voorgesteld", interview_gepland: "Interview gepland",
                  interview_afgerond: "Interview afgerond", aanbod: "Aanbod", geplaatst: "Geplaatst",
                  afgewezen: "Niet weerhouden", teruggetrokken: "Teruggetrokken",
                };
                return (
                  <a key={s.id} href={`/dashboard/sollicitaties/${s.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--ink-800)", borderRadius: "2px", border: `1px solid ${BORDER}`, textDecoration: "none", gap: "1rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: TEXT }}>
                      {s.kandidaat?.naam || s.kandidaat?.voornaam + " " + s.kandidaat?.achternaam || "—"}
                    </span>
                    <StatusBadge label={solStatusLabel[s.status] || s.status} kleur={solStatusKleur[s.status] || "#6f6d62"} />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
