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

  // Sector verdeling
  const sectorCount: Record<string, number> = {};
  for (const k of allKandidaten.docs as any[]) {
    const s = k.sector ?? "overig";
    sectorCount[s] = (sectorCount[s] ?? 0) + 1;
  }
  const sectorData = Object.entries(sectorCount)
    .map(([sector, count]) => ({ sector: SECTOR_LABEL[sector] ?? sector, count }))
    .sort((a, b) => b.count - a.count);

  // Pipeline verdeling
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
  };

  return (
    <DashboardShell activePath="/dashboard" userName={data.userName}>
      <DashboardCustomizable data={data} />
    </DashboardShell>
  );
}
