export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, GoldBtn } from "@/components/DashboardShell";
import LeadsTable from "@/components/LeadsTable";
import DuplicatenDetector from "@/components/DuplicatenDetector";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function LeadsPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const [leadsRes, gebruikersRes] = await Promise.all([
    payload.find({ collection: "leads", limit: 500, sort: "-createdAt", depth: 1 }),
    payload.find({ collection: "gebruikers", limit: 50, depth: 0 }),
  ]);

  const leads = leadsRes.docs.map((l: any) => ({
    id: l.id,
    naam: l.naam,
    email: l.email,
    telefoon: l.telefoon ?? null,
    status: l.status,
    bron: l.bron ?? null,
    toegewezen_aan: l.toegewezen_aan ? { naam: l.toegewezen_aan.naam ?? null } : null,
    createdAt: l.createdAt,
  }));

  const makelaars = gebruikersRes.docs.map((g: any) => ({ id: g.id, naam: g.naam || g.email }));

  return (
    <DashboardShell activePath="/dashboard/leads" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Leads"
        subtitle={`${leadsRes.totalDocs} leads in totaal`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <GoldBtn href="/dashboard/leads/kanban">Kanban</GoldBtn>
            <GoldBtn href="/api/leads/export">↓ CSV</GoldBtn>
            <GoldBtn href="/dashboard/leads/import">↑ Import</GoldBtn>
            <GoldBtn href="/dashboard/leads/create">+ Nieuwe lead</GoldBtn>
          </div>
        }
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        <DuplicatenDetector />
        <LeadsTable initialLeads={leads} makelaars={makelaars} />
      </div>
    </DashboardShell>
  );
}
