export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const STATUS: Record<string, { label: string; kleur: string }> = {
  open:     { label: "Open",     kleur: "#facb04" },
  bezig:    { label: "Bezig",    kleur: "#60a5fa" },
  afgerond: { label: "Afgerond", kleur: "#34d399" },
};

const PRIORITEIT: Record<string, { label: string; kleur: string }> = {
  hoog:   { label: "Hoog",   kleur: "#e05252" },
  normaal: { label: "Normaal", kleur: "#facb04" },
  laag:   { label: "Laag",   kleur: "#6b7280" },
};

export default async function TakenPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const taken = await payload.find({
    collection: "taken",
    limit: 100,
    sort: "deadline",
    depth: 1,
  });

  return (
    <DashboardShell activePath="/dashboard/taken" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Taken"
        subtitle={`${taken.totalDocs} taken`}
        actions={<GoldBtn href="/admin/collections/taken/create">+ Nieuwe taak</GoldBtn>}
      />

      <div style={{ padding: "1.5rem 2.5rem" }}>
        {taken.docs.length === 0 ? (
          <Empty>Geen taken. Voeg de eerste taak toe.</Empty>
        ) : (
          <Table headers={["Taak", "Prioriteit", "Status", "Deadline", "Toegewezen aan", "Lead"]}>
            {taken.docs.map((taak: any) => {
              const s = STATUS[taak.status] || { label: taak.status, kleur: "#666" };
              const p = PRIORITEIT[taak.prioriteit] || { label: taak.prioriteit, kleur: "#666" };
              const isLate = taak.deadline && new Date(taak.deadline) < new Date() && taak.status !== "afgerond";
              return (
                <tr key={taak.id} style={{ cursor: "pointer" }}>
                  <TD bold>
                    <Link href={`/admin/collections/taken/${taak.id}`} style={{ color: "inherit", textDecoration: "none", display: "block" }}>
                      {taak.titel}
                    </Link>
                  </TD>
                  <TD><StatusBadge label={p.label} kleur={p.kleur} /></TD>
                  <TD><StatusBadge label={s.label} kleur={s.kleur} /></TD>
                  <TD muted={!isLate}>
                    <span style={{ color: isLate ? "#e05252" : "inherit" }}>
                      {taak.deadline ? fmtDate(taak.deadline) : "—"}
                      {isLate && " ⚠"}
                    </span>
                  </TD>
                  <TD muted>{taak.toegewezen_aan?.naam || "—"}</TD>
                  <TD muted>{taak.lead?.naam || "—"}</TD>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
