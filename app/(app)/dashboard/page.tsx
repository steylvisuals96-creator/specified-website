export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { LimeBtn } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const S2 = "#2d2d30";
const S3 = "#323236";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.45)";
const TEXT = "#ffffff";

function fmt(n: number) {
  return new Intl.NumberFormat("nl-BE").format(n);
}

function fmtDateShort(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    vacaturesActief, vacaturesTotaal, vacaturesIngevuld,
    kandidatenNieuw, kandidatenTotaal, kandidatenGeplaatst,
    sollicitatiesNieuw, sollicitatiesVoorgesteld, sollicitatiesGeplaatst,
    bedrijvenActief, teamleden,
    recenteKandidaten, recenteSollicitaties,
  ] = await Promise.all([
    payload.count({ collection: "vacatures", where: { status: { equals: "actief" } } }),
    payload.count({ collection: "vacatures" }),
    payload.count({ collection: "vacatures", where: { status: { equals: "ingevuld" } } }),
    payload.count({ collection: "kandidaten", where: { status: { equals: "nieuw" } } }),
    payload.count({ collection: "kandidaten" }),
    payload.count({ collection: "kandidaten", where: { status: { equals: "geplaatst" } } }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "nieuw" } } }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "voorgesteld" } } }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "geplaatst" } } }),
    payload.count({ collection: "bedrijven", where: { relatiestatus: { equals: "actief" } } }),
    payload.count({ collection: "team" }),
    payload.find({ collection: "kandidaten", limit: 6, sort: "-createdAt" }),
    payload.find({ collection: "sollicitaties", limit: 5, sort: "-updatedAt" }),
  ]);

  const conversieRate = kandidatenTotaal.totalDocs > 0
    ? Math.round((kandidatenGeplaatst.totalDocs / kandidatenTotaal.totalDocs) * 100)
    : 0;

  const pipelineStappen = [
    { label: "Nieuw", count: kandidatenNieuw.totalDocs, kleur: LIME },
    { label: "Gescreend", count: 0, kleur: "#60a5fa" },
    { label: "Voorgesteld", count: sollicitatiesVoorgesteld.totalDocs, kleur: "#a78bfa" },
    { label: "Interview", count: 0, kleur: "#f472b6" },
    { label: "Geplaatst", count: kandidatenGeplaatst.totalDocs, kleur: "#34d399" },
  ];
  const maxCount = Math.max(...pipelineStappen.map(s => s.count), 1);

  const statusKleuren: Record<string, string> = {
    nieuw: LIME,
    gescreend: "#60a5fa",
    in_gesprek: "#a78bfa",
    voorgesteld: "#f472b6",
    geplaatst: "#34d399",
    afgewezen: "#6b7280",
    on_hold: "#f59e0b",
  };

  const statusLabels: Record<string, string> = {
    nieuw: "Nieuw",
    screening: "Screening",
    voorgesteld: "Voorgesteld",
    interview_gepland: "Interview",
    geplaatst: "Geplaatst",
    afgewezen: "Afgewezen",
  };

  return (
    <DashboardShell activePath="/dashboard" userName={(user as any).naam || user.email}>
      <div style={{ padding: "2rem 2.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.2rem", color: TEXT }}>Dashboard</h1>
            <p style={{ color: MUTED, fontSize: "0.8rem", margin: 0 }}>Welkom terug, {(user as any).naam || user.email}</p>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <LimeBtn href="/admin/collections/vacatures/create">+ Vacature</LimeBtn>
            <LimeBtn href="/admin/collections/kandidaten/create" outline>+ Kandidaat</LimeBtn>
          </div>
        </div>

        {/* Stat cards — Vacatures */}
        <SectionTitle>Vacatures</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "1.5rem" }}>
          <StatCard label="Actieve vacatures" value={vacaturesActief.totalDocs} href="/dashboard/vacatures" accent />
          <StatCard label="Totaal vacatures" value={vacaturesTotaal.totalDocs} href="/dashboard/vacatures" />
          <StatCard label="Ingevuld" value={vacaturesIngevuld.totalDocs} href="/dashboard/vacatures" />
        </div>

        {/* Stat cards — Kandidaten */}
        <SectionTitle>Kandidaten & Pipeline</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.875rem", marginBottom: "1rem" }}>
          <StatCard label="Nieuwe kandidaten" value={kandidatenNieuw.totalDocs} href="/dashboard/kandidaten" accent />
          <StatCard label="Totaal kandidaten" value={kandidatenTotaal.totalDocs} href="/dashboard/kandidaten" />
          <StatCard label="Geplaatst" value={kandidatenGeplaatst.totalDocs} href="/dashboard/kandidaten" />
          <StatCard label="Actieve klanten" value={bedrijvenActief.totalDocs} href="/dashboard/bedrijven" />
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem", marginBottom: "2rem" }}>
          <Link href="/dashboard/sollicitaties" style={{ display: "block", background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", textDecoration: "none", border: `1px solid ${BORDER}`, borderTop: `3px solid ${LIME}` }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>Open sollicitaties</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: LIME, lineHeight: 1 }}>{sollicitatiesNieuw.totalDocs}</div>
            <div style={{ fontSize: "0.7rem", color: MUTED, marginTop: "0.4rem" }}>{sollicitatiesVoorgesteld.totalDocs} voorgesteld aan klant</div>
          </Link>
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>Plaatsingsratio</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, lineHeight: 1 }}>{conversieRate}%</div>
              <div style={{ fontSize: "0.75rem", color: MUTED, paddingBottom: "0.2rem" }}>{kandidatenGeplaatst.totalDocs} geplaatst</div>
            </div>
            <div style={{ marginTop: "0.75rem", height: 6, borderRadius: 3, background: "#1a1a1d", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${conversieRate}%`, background: "#34d399", borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: "0.875rem" }}>Pipeline per fase</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {pipelineStappen.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontSize: "0.65rem", color: MUTED, width: 70, flexShrink: 0 }}>{s.label}</div>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#1a1a1d", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.count / maxCount) * 100}%`, background: s.kleur, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: TEXT, fontWeight: 600, width: 20, textAlign: "right" }}>{s.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.25rem" }}>
          <Panel title="Recente kandidaten" link="/dashboard/kandidaten" linkLabel="Alle kandidaten">
            {recenteKandidaten.docs.length === 0 ? (
              <EmptyPanel>Nog geen kandidaten</EmptyPanel>
            ) : recenteKandidaten.docs.map((k: any) => (
              <Link key={k.id} href={`/admin/collections/kandidaten/${k.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: statusKleuren[k.status] || MUTED, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{k.naam}</span>
                  {k.sector && <span style={{ color: MUTED }}>{k.sector}</span>}
                </div>
                <span style={{ color: MUTED, fontSize: "0.72rem", whiteSpace: "nowrap" }}>{fmtDateShort(k.createdAt)}</span>
              </Link>
            ))}
          </Panel>

          <Panel title="Recente sollicitaties" link="/dashboard/sollicitaties" linkLabel="Alle sollicitaties">
            {recenteSollicitaties.docs.length === 0 ? (
              <EmptyPanel>Nog geen sollicitaties</EmptyPanel>
            ) : recenteSollicitaties.docs.map((s: any) => (
              <Link key={s.id} href={`/admin/collections/sollicitaties/${s.id}`} style={{ display: "block", padding: "0.625rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem", borderLeft: `3px solid ${statusKleuren[s.status] || MUTED}` }}>
                <div style={{ fontWeight: 600, marginBottom: "0.125rem" }}>{statusLabels[s.status] || s.status}</div>
                <div style={{ color: MUTED, fontSize: "0.72rem" }}>{fmtDateShort(s.updatedAt)}</div>
              </Link>
            ))}
          </Panel>
        </div>

      </div>
    </DashboardShell>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: LIME, marginBottom: "0.625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ flex: 1, height: "1px", background: BORDER }} />
      {children}
      <span style={{ flex: 1, height: "1px", background: BORDER }} />
    </div>
  );
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <Link href={href} style={{ display: "block", background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", textDecoration: "none", border: `1px solid ${BORDER}`, borderTop: accent ? `3px solid ${LIME}` : `1px solid ${BORDER}` }}>
      <div style={{ fontSize: "2.25rem", fontWeight: 800, color: accent ? LIME : TEXT, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</div>
      <div style={{ fontSize: "0.75rem", color: MUTED, marginTop: "0.4rem", fontWeight: 500 }}>{label}</div>
    </Link>
  );
}

function Panel({ title, link, linkLabel, children }: { title: string; link: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: TEXT, margin: 0 }}>{title}</h2>
        <Link href={link} style={{ fontSize: "0.72rem", color: LIME, textDecoration: "none" }}>{linkLabel}</Link>
      </div>
      {children}
    </div>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "2rem 1rem", color: MUTED, fontSize: "0.8rem" }}>{children}</div>;
}
