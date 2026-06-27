export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, StatusBadge, fmtDate } from "@/components/DashboardShell";
import { ActiviteitFeed, type ActiviteitItem } from "@/components/ActiviteitFeed";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const MUTED = "rgba(255,255,255,0.4)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f0f0f0";

const statusKleur: Record<string, string> = {
  prospect: "#60a5fa", actief: "#dffd7b", slapend: "#f59e0b", voormalig: "#6b7280",
};
const statusLabel: Record<string, string> = {
  prospect: "Prospect", actief: "Actief", slapend: "Slapend", voormalig: "Voormalig",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", width: "8rem", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "0.82rem", color: MUTED }}>{value}</span>
    </div>
  );
}

export default async function BedrijfDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const bedrijf = await payload.findByID({ collection: "bedrijven" as any, id }).catch(() => null);
  if (!bedrijf) notFound();
  const b = bedrijf as any;

  const activiteiten = await payload.find({
    collection: "activiteiten" as any,
    where: { bedrijf: { equals: id } },
    sort: "-datum",
    limit: 50,
    depth: 1,
  });

  const items: ActiviteitItem[] = activiteiten.docs.map((d: any) => ({
    id: d.id,
    type: d.type,
    richting: d.richting,
    datum: d.datum,
    onderwerp: d.onderwerp,
    inhoud: d.inhoud,
    van: d.van,
    naar: d.naar,
    kandidaat: d.kandidaat,
    bedrijf: d.bedrijf,
  }));

  return (
    <DashboardShell activePath="/dashboard/bedrijven" userName={(user as any).naam || user.email}>
      <PageHeader
        title={b.naam}
        subtitle="Bedrijf profiel"
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <LimeBtn href="/dashboard/bedrijven" outline>← Terug</LimeBtn>
            <LimeBtn href={`/admin/collections/bedrijven/${id}`}>Bewerken in CMS</LimeBtn>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 0, height: "calc(100vh - 90px)" }}>
        {/* Sidebar */}
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: "1.5rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: "#fb923c18", border: "1.5px solid #fb923c40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "0.75rem" }}>
              🏢
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, marginBottom: "0.25rem" }}>{b.naam}</div>
            {b.relatiestatus && (
              <StatusBadge
                label={statusLabel[b.relatiestatus] || b.relatiestatus}
                kleur={statusKleur[b.relatiestatus] || "#6b7280"}
              />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <InfoRow label="Sector" value={b.sector} />
            <InfoRow label="Contactpersoon" value={b.contactpersoon} />
            <InfoRow label="E-mail" value={b.email} />
            <InfoRow label="Telefoon" value={b.telefoon} />
            <InfoRow label="Website" value={b.website} />
            <InfoRow label="Adres" value={b.adres} />
            <InfoRow label="Toegevoegd" value={fmtDate(b.createdAt)} />
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Link
              href={`/admin/collections/activiteiten/create?bedrijf=${id}`}
              style={{ display: "block", textAlign: "center", padding: "0.5rem", borderRadius: "4px", background: `${LIME}14`, color: LIME, textDecoration: "none", fontSize: "0.78rem", fontWeight: 600, border: `1px solid ${LIME}30` }}
            >
              + Activiteit toevoegen
            </Link>
          </div>
        </div>

        {/* Activity feed */}
        <div style={{ padding: "1.5rem 2rem", overflowY: "auto" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            {activiteiten.totalDocs} activiteiten
          </div>
          <ActiviteitFeed items={items} showRelaties />
        </div>
      </div>
    </DashboardShell>
  );
}
