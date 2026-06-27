export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, LimeBtn, StatusBadge, fmtDate } from "@/components/DashboardShell";
import { ActiviteitFeed, type ActiviteitItem } from "@/components/ActiviteitFeed";
import KandidaatEditDrawer from "@/components/KandidaatEditDrawer";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const MUTED = "rgba(255,255,255,0.4)";
const BORDER = "rgba(255,255,255,0.08)";
const S1 = "#27272a";
const TEXT = "#f0f0f0";

const statusKleur: Record<string, string> = {
  nieuw: "#dffd7b", gescreend: "#60a5fa", in_gesprek: "#a78bfa",
  voorgesteld: "#f472b6", interview_klant: "#fb923c", geplaatst: "#34d399",
  afgewezen: "#6b7280", on_hold: "#f59e0b",
};
const statusLabel: Record<string, string> = {
  nieuw: "Nieuw", gescreend: "Gescreend", in_gesprek: "In gesprek",
  voorgesteld: "Voorgesteld", interview_klant: "Interview klant",
  geplaatst: "Geplaatst", afgewezen: "Afgewezen", on_hold: "On hold",
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

export default async function KandidaatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const kandidaat = await payload.findByID({ collection: "kandidaten" as any, id }).catch(() => null);
  if (!kandidaat) notFound();
  const k = kandidaat as any;

  const [activiteiten, instellingen] = await Promise.all([
    payload.find({
      collection: "activiteiten" as any,
      where: { kandidaat: { equals: id } },
      sort: "-datum",
      limit: 50,
      depth: 1,
    }),
    payload.findGlobal({ slug: "instellingen" as any }),
  ]);
  const bccEmail = (instellingen as any)?.bcc_logging_email ?? undefined;

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

  const naam = k.naam || [k.voornaam, k.achternaam].filter(Boolean).join(" ") || "Onbekend";

  return (
    <DashboardShell activePath="/dashboard/kandidaten" userName={(user as any).naam || user.email}>
      <PageHeader
        title={naam}
        subtitle="Kandidaat profiel"
        actions={<LimeBtn href="/dashboard/kandidaten" outline>← Terug</LimeBtn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 0, height: "calc(100vh - 90px)" }}>
        {/* Sidebar: info */}
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: "1.5rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: `${LIME}18`, border: `1.5px solid ${LIME}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "0.75rem" }}>
              👤
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, marginBottom: "0.25rem" }}>{naam}</div>
            {k.status && (
              <StatusBadge
                label={statusLabel[k.status] || k.status}
                kleur={statusKleur[k.status] || "#6b7280"}
              />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <InfoRow label="E-mail" value={k.email} />
            <InfoRow label="Telefoon" value={k.telefoon} />
            <InfoRow label="Sector" value={k.sector} />
            <InfoRow label="Functie" value={k.huidigeFunctie || k.functie} />
            <InfoRow label="Beschikbaarheid" value={k.beschikbaarheid} />
            <InfoRow label="Bron" value={k.bron} />
            <InfoRow label="Toegevoegd" value={fmtDate(k.createdAt)} />
          </div>

          {k.notities && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Notities</div>
              <div style={{ fontSize: "0.8rem", color: MUTED, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{k.notities}</div>
            </div>
          )}

          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <KandidaatEditDrawer
              id={id}
              initial={{
                voornaam: k.voornaam, achternaam: k.achternaam,
                email: k.email, telefoon: k.telefoon,
                sector: k.sector, ervaringsniveau: k.ervaringsniveau,
                beschikbaarheid: k.beschikbaarheid, functietitel: k.functietitel,
                huidige_werkgever: k.huidige_werkgever, jaren_ervaring: k.jaren_ervaring,
                linkedin: k.linkedin, status: k.status,
                gewenst_salaris: k.gewenst_salaris, notities: k.notities, bron: k.bron,
              }}
            />
            <Link
              href={`/admin/collections/activiteiten/create?kandidaat=${id}`}
              style={{ display: "block", textAlign: "center", padding: "0.5rem", borderRadius: "4px", background: "transparent", color: "#666", textDecoration: "none", fontSize: "0.78rem", fontWeight: 600, border: `1px solid rgba(255,255,255,0.06)` }}
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
          <ActiviteitFeed items={items} bccEmail={bccEmail} />
        </div>
      </div>
    </DashboardShell>
  );
}
