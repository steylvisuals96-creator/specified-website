export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import KanbanBoard, { KanbanColumn } from "@/components/KanbanBoard";

const configPromise = import("@payload-config").then((m) => m.default);

const SECTOR_LABEL: Record<string, string> = {
  civiel: "Civiel",
  elektro: "Elektro",
  werktuig: "Werktuig",
  bouw: "Bouw",
  industrie: "Industrie",
  energie: "Energie",
  it: "IT",
  projectmanagement: "PM",
};

const KOLOM_IDS = ["nieuw", "screening", "tel_gescreend", "voorgesteld", "interview_gepland", "interview_afgerond", "aanbod", "geplaatst"];

export default async function PipelinePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const result = await payload.find({
    collection: "sollicitaties",
    limit: 200,
    depth: 1,
    where: { status: { not_in: ["afgewezen", "teruggetrokken"] } },
    sort: "-updatedAt",
  });

  const columns: KanbanColumn[] = KOLOM_IDS.map(id => ({
    id,
    label: id,
    kleur: "",
    cards: result.docs
      .filter((s: any) => s.status === id)
      .map((s: any) => {
        const daysSince = Math.floor((Date.now() - new Date(s.updatedAt).getTime()) / 86400000);
        return {
          id: String(s.id),
          kandidaat: s.kandidaat?.naam ?? s.kandidaat?.voornaam ?? "—",
          vacature: s.vacature?.titel ?? "—",
          sector: SECTOR_LABEL[s.kandidaat?.sector ?? ""] ?? "",
          dagen: daysSince,
          status: s.status,
        };
      }),
  }));

  const totaal = result.totalDocs;
  const geplaatst = columns.find(c => c.id === "geplaatst")?.cards.length ?? 0;

  return (
    <DashboardShell activePath="/dashboard/pipeline" userName={(user as any).naam || user.email}>
      <div style={{ padding: "2rem 2.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#fff" }}>Recruitment Pipeline</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", margin: 0 }}>
              {totaal} actieve sollicitaties · {geplaatst} geplaatst · sleep kaarten om te verplaatsen
            </p>
          </div>
          <a href="/admin/collections/sollicitaties/create" style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: 4, background: "#dffd7b", color: "#1e1e21", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
            + Sollicitatie
          </a>
        </div>

        <KanbanBoard initialColumns={columns} />
      </div>
    </DashboardShell>
  );
}
