export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { LimeBtn } from "@/components/DashboardShell";
import { SectorBarChart, PipelinePieChart } from "@/components/DashboardCharts";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const S2 = "#2d2d30";
const S3 = "#323236";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.45)";
const TEXT = "#ffffff";

const SECTOR_LABEL: Record<string, string> = {
  civiel: "Civiel", elektro: "Elektro", werktuig: "Werktuig",
  bouw: "Bouw", industrie: "Industrie", energie: "Energie",
  it: "IT", projectmanagement: "PM",
};

const STATUS_KLEUR: Record<string, string> = {
  nieuw: "#60a5fa", gescreend: LIME, in_gesprek: "#a78bfa",
  voorgesteld: "#fb923c", interview_klant: "#f472b6",
  geplaatst: "#34d399", afgewezen: "#6b7280", on_hold: "#facc15",
};

const STATUS_LABEL: Record<string, string> = {
  nieuw: "Nieuw", gescreend: "Gescreend", in_gesprek: "In gesprek",
  voorgesteld: "Voorgesteld", interview_klant: "Interview",
  geplaatst: "Geplaatst", afgewezen: "Afgewezen", on_hold: "On hold",
};

const PIPELINE_LABEL: Record<string, string> = {
  nieuw: "Nieuw", screening: "Screening", tel_gescreend: "Gescreend",
  voorgesteld: "Voorgesteld", interview_gepland: "Interview",
  interview_afgerond: "Afgerond", aanbod: "Aanbod", geplaatst: "Geplaatst",
};

function fmt(n: number) { return new Intl.NumberFormat("nl-BE").format(n); }
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const [
    vacActief, vacTotaal, vacIngevuld,
    kanTotaal, kanGeplaatst, kanNieuw,
    solTotaal, solGeplaatst,
    bedrijvenActief,
    allKandidaten, allSollicitaties,
    recenteKandidaten, recenteSollicitaties,
  ] = await Promise.all([
    payload.count({ collection: "vacatures", where: { status: { equals: "actief" } } }),
    payload.count({ collection: "vacatures" }),
    payload.count({ collection: "vacatures", where: { status: { equals: "ingevuld" } } }),
    payload.count({ collection: "kandidaten" }),
    payload.count({ collection: "kandidaten", where: { status: { equals: "geplaatst" } } }),
    payload.count({ collection: "kandidaten", where: { status: { equals: "nieuw" } } }),
    payload.count({ collection: "sollicitaties" }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "geplaatst" } } }),
    payload.count({ collection: "bedrijven", where: { relatiestatus: { equals: "actief" } } }),
    payload.find({ collection: "kandidaten", limit: 200 }),
    payload.find({ collection: "sollicitaties", limit: 200 }),
    payload.find({ collection: "kandidaten", limit: 5, sort: "-createdAt" }),
    payload.find({ collection: "sollicitaties", limit: 5, sort: "-updatedAt", depth: 1 }),
  ]);

  // Sector verdeling voor bar chart
  const sectorCount: Record<string, number> = {};
  for (const k of allKandidaten.docs as any[]) {
    const s = k.sector ?? "overig";
    sectorCount[s] = (sectorCount[s] ?? 0) + 1;
  }
  const sectorData = Object.entries(sectorCount)
    .map(([sector, count]) => ({ sector: SECTOR_LABEL[sector] ?? sector, count }))
    .sort((a, b) => b.count - a.count);

  // Pipeline verdeling voor pie chart
  const pipelineCount: Record<string, number> = {};
  for (const s of allSollicitaties.docs as any[]) {
    const st = s.status ?? "nieuw";
    if (st !== "afgewezen" && st !== "teruggetrokken") {
      const label = PIPELINE_LABEL[st] ?? st;
      pipelineCount[label] = (pipelineCount[label] ?? 0) + 1;
    }
  }
  const pipelineData = Object.values(PIPELINE_LABEL).map(label => ({
    label,
    count: pipelineCount[label] ?? 0,
  }));

  const plaatsingsratio = kanTotaal.totalDocs > 0
    ? Math.round((kanGeplaatst.totalDocs / kanTotaal.totalDocs) * 100)
    : 0;

  const openSollicitaties = solTotaal.totalDocs - solGeplaatst.totalDocs;

  return (
    <DashboardShell activePath="/dashboard" userName={(user as any).naam || user.email}>
      <div style={{ padding: "2rem 2.5rem", maxWidth: 1280 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem", color: TEXT }}>Dashboard</h1>
            <p style={{ color: MUTED, fontSize: "0.8rem", margin: 0 }}>
              Welkom terug, {(user as any).naam || user.email}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <LimeBtn href="/admin/collections/vacatures/create">+ Vacature</LimeBtn>
            <LimeBtn href="/admin/collections/kandidaten/create" outline>+ Kandidaat</LimeBtn>
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.875rem", marginBottom: "1.5rem" }}>
          <KpiCard label="Actieve vacatures" value={vacActief.totalDocs} sub={`${vacIngevuld.totalDocs} ingevuld`} accent href="/dashboard/vacatures" />
          <KpiCard label="Kandidaten" value={kanTotaal.totalDocs} sub={`${kanNieuw.totalDocs} nieuw`} href="/dashboard/kandidaten" />
          <KpiCard label="Plaatsingsratio" value={`${plaatsingsratio}%`} sub={`${kanGeplaatst.totalDocs} geplaatst`} href="/dashboard/kandidaten" />
          <KpiCard label="Open pipeline" value={openSollicitaties} sub={`${solGeplaatst.totalDocs} geplaatst`} href="/dashboard/pipeline" />
          <KpiCard label="Actieve klanten" value={bedrijvenActief.totalDocs} sub="bedrijven" href="/dashboard/bedrijven" />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>

          {/* Sector bar chart */}
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <ChartTitle>Kandidaten per sector</ChartTitle>
            <SectorBarChart data={sectorData} />
          </div>

          {/* Pipeline pie chart */}
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <ChartTitle>Pipeline verdeling</ChartTitle>
            <PipelinePieChart data={pipelineData} />
          </div>
        </div>

        {/* Progress bar: plaatsingsratio */}
        <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", border: `1px solid ${BORDER}`, marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <ChartTitle style={{ margin: 0 }}>Plaatsingsratio</ChartTitle>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: LIME }}>{plaatsingsratio}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#1a1a1d", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${plaatsingsratio}%`, background: `linear-gradient(90deg, #34d399, ${LIME})`, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.72rem", color: MUTED }}>
            <span>{kanGeplaatst.totalDocs} geplaatst van {kanTotaal.totalDocs} kandidaten</span>
            <span>{vacIngevuld.totalDocs} van {vacTotaal.totalDocs} vacatures ingevuld</span>
          </div>
        </div>

        {/* Bottom: recente activiteit */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

          <Panel title="Recente kandidaten" link="/dashboard/kandidaten" linkLabel="Alle kandidaten">
            {recenteKandidaten.docs.length === 0
              ? <Empty>Nog geen kandidaten</Empty>
              : (recenteKandidaten.docs as any[]).map(k => (
                <Link key={k.id} href={`/admin/collections/kandidaten/${k.id}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_KLEUR[k.status] ?? MUTED, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{k.naam}</span>
                    {k.sector && <span style={{ color: MUTED, fontSize: "0.72rem" }}>{SECTOR_LABEL[k.sector] ?? k.sector}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.62rem", padding: "0.15rem 0.45rem", borderRadius: 3, background: `${STATUS_KLEUR[k.status] ?? MUTED}20`, color: STATUS_KLEUR[k.status] ?? MUTED, fontWeight: 600 }}>
                      {STATUS_LABEL[k.status] ?? k.status}
                    </span>
                    <span style={{ color: MUTED, fontSize: "0.7rem", whiteSpace: "nowrap" }}>{fmtDate(k.createdAt)}</span>
                  </div>
                </Link>
              ))}
          </Panel>

          <Panel title="Recente sollicitaties" link="/dashboard/sollicitaties" linkLabel="Alle sollicitaties">
            {recenteSollicitaties.docs.length === 0
              ? <Empty>Nog geen sollicitaties</Empty>
              : (recenteSollicitaties.docs as any[]).map(s => {
                const kleur = STATUS_KLEUR[s.status] ?? MUTED;
                return (
                  <Link key={s.id} href={`/admin/collections/sollicitaties/${s.id}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${kleur}`, marginBottom: "0.375rem" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>{s.kandidaat?.naam ?? "—"}</div>
                      <div style={{ color: MUTED, fontSize: "0.7rem" }}>{s.vacature?.titel ?? "—"}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.62rem", padding: "0.15rem 0.45rem", borderRadius: 3, background: `${kleur}20`, color: kleur, fontWeight: 600 }}>
                        {PIPELINE_LABEL[s.status] ?? s.status}
                      </span>
                      <span style={{ color: MUTED, fontSize: "0.7rem", whiteSpace: "nowrap" }}>{fmtDate(s.updatedAt)}</span>
                    </div>
                  </Link>
                );
              })}
          </Panel>
        </div>

      </div>
    </DashboardShell>
  );
}

function KpiCard({ label, value, sub, accent, href }: { label: string; value: string | number; sub: string; accent?: boolean; href: string }) {
  return (
    <Link href={href} style={{ display: "block", background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", textDecoration: "none", border: `1px solid ${BORDER}`, borderTop: accent ? `3px solid ${LIME}` : `1px solid ${BORDER}` }}>
      <div style={{ fontSize: "2rem", fontWeight: 800, color: accent ? LIME : TEXT, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: TEXT, marginTop: "0.3rem", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "0.68rem", color: MUTED, marginTop: "0.15rem" }}>{sub}</div>
    </Link>
  );
}

function ChartTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTED, marginBottom: "1rem", ...style }}>
      {children}
    </div>
  );
}

function Panel({ title, link, linkLabel, children }: { title: string; link: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTED }}>{title}</div>
        <Link href={link} style={{ fontSize: "0.72rem", color: LIME, textDecoration: "none" }}>{linkLabel}</Link>
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "2rem 1rem", color: MUTED, fontSize: "0.8rem" }}>{children}</div>;
}
