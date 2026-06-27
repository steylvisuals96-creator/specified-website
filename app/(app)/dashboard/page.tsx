export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import DashboardCustomizable, { DashboardData } from "@/components/DashboardCustomizable";

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

function getPeriodRange(period: Period): { from: Date | null; prevFrom: Date | null; prevTo: Date | null } {
  const now = new Date();
  if (period === "all") return { from: null, prevFrom: null, prevTo: null };

  const durations: Record<Exclude<Period, "all">, number> = {
    today: 1,
    week: 7,
    month: 30,
    quarter: 90,
  };
  const days = durations[period as Exclude<Period, "all">];
  const from = new Date(now); from.setDate(from.getDate() - days);
  const prevTo = new Date(from);
  const prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - days);
  return { from, prevFrom, prevTo };
}

function dateFilter(from: Date | null) {
  return from ? { createdAt: { greater_than: from.toISOString() } } : {};
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

  const { period: periodParam } = await searchParams;
  const period: Period = (["today", "week", "month", "quarter", "all"].includes(periodParam ?? "") ? periodParam : "month") as Period;
  const { from, prevFrom, prevTo } = getPeriodRange(period);
  const df = dateFilter(from);
  const prevDf = (prevFrom && prevTo)
    ? { createdAt: { greater_than: prevFrom.toISOString(), less_than: prevTo.toISOString() } }
    : null;

  const [
    vacActief, vacTotaal, vacIngevuld,
    kanTotaal, kanGeplaatst, kanNieuw,
    solTotaal, solGeplaatst,
    bedrijvenActief,
    // Previous period for trend
    kanTotaalPrev, kanGeplaatsPrev, solTotaalPrev,
    allKandidaten, allSollicitaties,
    recenteKandidaten, recenteSollicitaties,
  ] = await Promise.all([
    payload.count({ collection: "vacatures", where: { status: { equals: "actief" }, ...df } }),
    payload.count({ collection: "vacatures", where: { ...df } }),
    payload.count({ collection: "vacatures", where: { status: { equals: "ingevuld" }, ...df } }),
    payload.count({ collection: "kandidaten", where: { ...df } }),
    payload.count({ collection: "kandidaten", where: { status: { equals: "geplaatst" }, ...df } }),
    payload.count({ collection: "kandidaten", where: { status: { equals: "nieuw" }, ...df } }),
    payload.count({ collection: "sollicitaties", where: { ...df } }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "geplaatst" }, ...df } }),
    payload.count({ collection: "bedrijven", where: { relatiestatus: { equals: "actief" } } }),
    // Prev period
    prevDf ? payload.count({ collection: "kandidaten", where: { ...prevDf } }) : Promise.resolve({ totalDocs: 0 }),
    prevDf ? payload.count({ collection: "kandidaten", where: { status: { equals: "geplaatst" }, ...prevDf } }) : Promise.resolve({ totalDocs: 0 }),
    prevDf ? payload.count({ collection: "sollicitaties", where: { ...prevDf } }) : Promise.resolve({ totalDocs: 0 }),
    // Charts — always all-time for context
    payload.find({ collection: "kandidaten", limit: 200 }),
    payload.find({ collection: "sollicitaties", limit: 200 }),
    payload.find({ collection: "kandidaten", limit: 5, sort: "-createdAt", where: { ...df } }),
    payload.find({ collection: "sollicitaties", limit: 5, sort: "-updatedAt", depth: 1, where: { ...df } }),
  ]);

  // Sector verdeling (filtered)
  const sectorCount: Record<string, number> = {};
  for (const k of allKandidaten.docs as any[]) {
    if (from && new Date(k.createdAt) < from) continue;
    const s = k.sector ?? "overig";
    sectorCount[s] = (sectorCount[s] ?? 0) + 1;
  }
  const sectorData = Object.entries(sectorCount)
    .map(([sector, count]) => ({ sector: SECTOR_LABEL[sector] ?? sector, count }))
    .sort((a, b) => b.count - a.count);

  // Pipeline verdeling
  const pipelineCount: Record<string, number> = {};
  for (const s of allSollicitaties.docs as any[]) {
    if (from && new Date(s.createdAt) < from) continue;
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

  // Trends vs previous period
  function trend(current: number, prev: number) {
    if (!prevDf || prev === 0) return null;
    const diff = current - prev;
    return { diff, pct: Math.round((diff / prev) * 100) };
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
      kandidaten: trend(kanTotaal.totalDocs, kanTotaalPrev.totalDocs),
      geplaatst: trend(kanGeplaatst.totalDocs, kanGeplaatsPrev.totalDocs),
      sollicitaties: trend(solTotaal.totalDocs, solTotaalPrev.totalDocs),
    },
  };

  return (
    <DashboardShell activePath="/dashboard" userName={data.userName}>
      <DashboardCustomizable data={data} />
    </DashboardShell>
  );
}
