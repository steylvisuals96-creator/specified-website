export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const STATUS: Record<string, { label: string; kleur: string }> = {
  beschikbaar: { label: "Beschikbaar", kleur: "#34d399" },
  onder_bod:   { label: "Onder bod",   kleur: "#facb04" },
  verkocht:    { label: "Verkocht",    kleur: "#60a5fa" },
  verhuurd:    { label: "Verhuurd",    kleur: "#a78bfa" },
  niet_actief: { label: "Niet actief", kleur: "#6b7280" },
};

export default async function PandenPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const panden = await payload.find({
    collection: "panden",
    limit: 100,
    sort: "-createdAt",
  });

  return (
    <DashboardShell activePath="/dashboard/panden" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Panden"
        subtitle={`${panden.totalDocs} panden in totaal`}
        actions={<GoldBtn href="/admin/collections/panden/create">+ Nieuw pand</GoldBtn>}
      />

      <div style={{ padding: "1.5rem 2.5rem" }}>
        {panden.docs.length === 0 ? (
          <Empty>Nog geen panden. Voeg het eerste pand toe.</Empty>
        ) : (
          <Table headers={["Titel", "Type", "Gemeente", "Prijs", "Status", "Toegevoegd"]}>
            {panden.docs.map((pand: any) => {
              const s = STATUS[pand.status] || { label: pand.status, kleur: "#666" };
              const prijs = pand.prijs
                ? new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(pand.prijs)
                : "—";
              return (
                <tr key={pand.id} style={{ cursor: "pointer" }}>
                  <TD bold>
                    <Link href={`/dashboard/panden/${pand.id}`} style={{ color: "inherit", textDecoration: "none", display: "block" }}>
                      {pand.titel || "Zonder titel"}
                    </Link>
                  </TD>
                  <TD muted>{pand.type || "—"}</TD>
                  <TD muted>{pand.gemeente || "—"}</TD>
                  <TD bold>{prijs}</TD>
                  <TD><StatusBadge label={s.label} kleur={s.kleur} /></TD>
                  <TD muted>{fmtDate(pand.createdAt)}</TD>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
