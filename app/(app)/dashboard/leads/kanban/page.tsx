export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, GoldBtn } from "@/components/DashboardShell";
import LeadsKanban from "@/components/LeadsKanban";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function LeadsKanbanPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const leads = await payload.find({
    collection: "leads",
    limit: 200,
    sort: "-createdAt",
    depth: 1,
    where: {
      status: { not_equals: "niet_geinteresseerd" },
    },
  });

  const serialized = leads.docs.map((l: any) => ({
    id: l.id,
    naam: l.naam,
    email: l.email,
    telefoon: l.telefoon ?? null,
    status: l.status,
    bron: l.bron ?? null,
    createdAt: l.createdAt,
    toegewezen_aan: l.toegewezen_aan
      ? { naam: l.toegewezen_aan.naam ?? null }
      : null,
  }));

  return (
    <DashboardShell activePath="/dashboard/leads" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Leads — Kanban"
        subtitle={`${leads.totalDocs} actieve leads`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <GoldBtn href="/dashboard/leads">Lijstweergave</GoldBtn>
            <GoldBtn href="/dashboard/leads/create">+ Nieuwe lead</GoldBtn>
          </div>
        }
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        <LeadsKanban initialLeads={serialized} />
      </div>
    </DashboardShell>
  );
}
