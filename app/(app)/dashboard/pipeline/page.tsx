export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader } from "@/components/DashboardShell";
import SollicitatieCreateDrawer from "@/components/SollicitatieCreateDrawer";
import { SECTOR_LABEL } from "@/lib/labels";
import KanbanBoard, { KanbanColumn } from "@/components/KanbanBoard";

const configPromise = import("@payload-config").then((m) => m.default);


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

  const [kandidaten, vacatures] = await Promise.all([
    payload.find({ collection: "kandidaten", limit: 500, depth: 0, sort: "achternaam", user, overrideAccess: false }),
    payload.find({ collection: "vacatures", limit: 200, depth: 0, where: { status: { equals: "actief" } }, user, overrideAccess: false }),
  ]);
  const kandidaatOpties = (kandidaten.docs as any[]).map((k) => ({ value: String(k.id), label: k.naam || [k.voornaam, k.achternaam].filter(Boolean).join(" ") }));
  const vacatureOpties = (vacatures.docs as any[]).map((v) => ({ value: String(v.id), label: v.titel }));
  const totaal = result.totalDocs;
  const geplaatst = columns.find(c => c.id === "geplaatst")?.cards.length ?? 0;

  return (
    <DashboardShell userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <div className="px-5 py-8 sm:px-8 lg:px-10">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#fff" }}>Recruitment Pipeline</h1>
            <p style={{ color: "var(--bone-400)", fontSize: "0.875rem", margin: 0 }}>
              {totaal} actieve sollicitaties · {geplaatst} geplaatst · sleep kaarten om te verplaatsen
            </p>
          </div>
          <a href="/admin/collections/sollicitaties/create" style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: 2, background: "#dffd7b", color: "var(--ink-900)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            Sollicitatie
          </a>
        </div>

        <KanbanBoard initialColumns={columns} />
      </div>
    </DashboardShell>
  );
}
