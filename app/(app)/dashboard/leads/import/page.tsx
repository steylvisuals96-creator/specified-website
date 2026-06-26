export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, GoldBtn } from "@/components/DashboardShell";
import LeadsImport from "@/components/LeadsImport";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function LeadsImportPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  return (
    <DashboardShell activePath="/dashboard/leads" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Leads importeren"
        subtitle="CSV-import van Immoweb, Excel of ander CRM"
        actions={<GoldBtn href="/dashboard/leads">← Terug naar leads</GoldBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        <LeadsImport />
      </div>
    </DashboardShell>
  );
}
