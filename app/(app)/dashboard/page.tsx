export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import DashboardCustomizable, { DashboardData } from "@/components/DashboardCustomizable";
import SysteemStatus from "@/components/SysteemStatus";

const configPromise = import("@payload-config").then((m) => m.default);

const SECTOR_LABEL: Record<string, string> = {
  civiel: "Civiel", elektro: "Elektro", werktuig: "Werktuig",
  bouw: "Bouw", industrie: "Industrie", energie: "Energie",
  it: "IT", projectmanagement: "PM",
};

const PIPELINE_LABEL: Record<string, string> = {
  nieuw: "Nieuw", screening: "Screening", tel_gescreend: "Gescreend",
  voorgesteld: "Voorgesteld", interview_gepland: "Interview",
  interview_afgerond: "Afgerond", aanbod: "Aanbod", geplaatst: "Geplaatst",
};

type Period = "today" | "week" | "month" | "quarter" | "all";

function getPeriodDays(period: Period): number | null {
  if (period === "all") return null;
  return { today: 1, week: 7, month: 30, quarter: 90 }[period];
}

function fromDate(days: number | null): string | null {
  if (!days) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function prevFromDate(days: number | null): { from: string; to: string } | null {
  if (!days) return null;
  const to = new Date(); to.setDate(to.getDate() - days);
  const from = new Date(to); from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const period: Period = (["today", "week", "month", "quarter", "all"].includes(params.period ?? "")
    ? params.period
    : "month") as Period;

  const days = getPeriodDays(period);
  const from = fromDate(days);
  const prev = prevFromDate(days);

  // Build where clauses without spreading to avoid TS issues
  function withFrom(extra: Record<string, any> = {}) {
    return from ? { ...extra, createdAt: { greater_than: from } } : Object.keys(extra).length ? extra : undefined;
  }

  const [
    vacActief, vacTotaal, vacIngevuld,
    kanTotaal, kanGeplaatst, kanNieuw,
    solTotaal, solGeplaatst,
    bedrijvenActief,
    allKandidaten, allSollicitaties,
    recenteKandidaten, recenteSollicitaties,
  ] = await Promise.all([
    payload.count({ collection: "vacatures" as any, where: withFrom({ status: { equals: "actief" } }) }),
    payload.count({ collection: "vacatures" as any, where: withFrom() }),
    payload.count({ collection: "vacatures" as any, where: withFrom({ status: { equals: "ingevuld" } }) }),
    payload.count({ collection: "kandidaten" as any, where: withFrom() }),
    payload.count({ collection: "kandidaten" as any, where: withFrom({ status: { equals: "geplaatst" } }) }),
    payload.count({ collection: "kandidaten" as any, where: withFrom({ status: { equals: "nieuw" } }) }),
    payload.count({ collection: "sollicitaties" as any, where: withFrom() }),
    payload.count({ collection: "sollicitaties" as any, where: withFrom({ status: { equals: "geplaatst" } }) }),
    payload.count({ collection: "bedrijven" as any, where: { relatiestatus: { equals: "actief" } } }),
    payload.find({ collection: "kandidaten" as any, limit: 200 }),
    payload.find({ collection: "sollicitaties" as any, limit: 200 }),
    payload.find({ collection: "kandidaten" as any, limit: 5, sort: "-createdAt", where: withFrom() }),
    payload.find({ collection: "sollicitaties" as any, limit: 5, sort: "-updatedAt", depth: 1, where: withFrom() }),
  ]);

  // Previous period counts for trends
  let kanTotaalPrev = 0, kanGeplaatsPrev = 0, solTotaalPrev = 0;
  if (prev) {
    const prevWhere = { createdAt: { greater_than: prev.from, less_than: prev.to } };
    const [p1, p2, p3] = await Promise.all([
      payload.count({ collection: "kandidaten" as any, where: prevWhere }),
      payload.count({ collection: "kandidaten" as any, where: { ...prevWhere, status: { equals: "geplaatst" } } }),
      payload.count({ collection: "sollicitaties" as any, where: prevWhere }),
    ]);
    kanTotaalPrev = p1.totalDocs;
    kanGeplaatsPrev = p2.totalDocs;
    solTotaalPrev = p3.totalDocs;
  }

  // Sector verdeling
  const sectorCount: Record<string, number> = {};
  for (const k of allKandidaten.docs as any[]) {
    if (from && new Date(k.createdAt) < new Date(from)) continue;
    const s = k.sector ?? "overig";
    sectorCount[s] = (sectorCount[s] ?? 0) + 1;
  }
  const sectorData = Object.entries(sectorCount)
    .map(([sector, count]) => ({ sector: SECTOR_LABEL[sector] ?? sector, count }))
    .sort((a, b) => b.count - a.count);

  // Pipeline verdeling
  const pipelineCount: Record<string, number> = {};
  for (const s of allSollicitaties.docs as any[]) {
    if (from && new Date(s.createdAt) < new Date(from)) continue;
    const st = s.status ?? "nieuw";
    if (st !== "afgewezen" && st !== "teruggetrokken") {
      const label = PIPELINE_LABEL[st] ?? st;
      pipelineCount[label] = (pipelineCount[label] ?? 0) + 1;
    }
  }
  const pipelineData = Object.values(PIPELINE_LABEL).map(label => ({
    label, count: pipelineCount[label] ?? 0,
  }));

  const plaatsingsratio = kanTotaal.totalDocs > 0
    ? Math.round((kanGeplaatst.totalDocs / kanTotaal.totalDocs) * 100)
    : 0;

  function trend(current: number, prevVal: number) {
    if (!prev || prevVal === 0) return null;
    const diff = current - prevVal;
    return { diff, pct: Math.round((diff / prevVal) * 100) };
  }

  const data: DashboardData = {
    vacActief: vacActief.totalDocs,
    vacTotaal: vacTotaal.totalDocs,
    vacIngevuld: vacIngevuld.totalDocs,
    kanTotaal: kanTotaal.totalDocs,
    kanGeplaatst: kanGeplaatst.totalDocs,
    kanNieuw: kanNieuw.totalDocs,
    solTotaal: solTotaal.totalDocs,
    solGeplaatst: solGeplaatst.totalDocs,
    bedrijvenActief: bedrijvenActief.totalDocs,
    sectorData,
    pipelineData,
    plaatsingsratio,
    recenteKandidaten: recenteKandidaten.docs,
    recenteSollicitaties: recenteSollicitaties.docs,
    userName: (user as any).naam || user.email,
    period,
    trends: {
      kandidaten: trend(kanTotaal.totalDocs, kanTotaalPrev),
      geplaatst: trend(kanGeplaatst.totalDocs, kanGeplaatsPrev),
      sollicitaties: trend(solTotaal.totalDocs, solTotaalPrev),
    },
  };

  return (
    <DashboardShell activePath="/dashboard" userName={data.userName}>
      <DashboardCustomizable data={data} />
      <div style={{ padding: "0 2.5rem 2.5rem" }}>
        <SysteemStatus />
      </div>
    </DashboardShell>
  );
}
