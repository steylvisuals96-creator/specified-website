export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const STATUS: Record<string, { label: string; kleur: string }> = {
  nieuw:               { label: "Nieuw",           kleur: "#facb04" },
  gecontacteerd:       { label: "Gecontacteerd",   kleur: "#60a5fa" },
  bezoek_gepland:      { label: "Bezoek gepland",  kleur: "#a78bfa" },
  onderhandeling:      { label: "Onderhandeling",  kleur: "#f472b6" },
  afgerond:            { label: "Afgerond",        kleur: "#34d399" },
  niet_geinteresseerd: { label: "Niet interess.",  kleur: "#6b7280" },
};

const BRON: Record<string, string> = {
  website: "Website", instagram: "Instagram", immoweb: "Immoweb",
  telefoon: "Telefoon", doorverwijzing: "Doorverwijzing",
};

export default async function LeadsPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const leads = await payload.find({
    collection: "leads",
    limit: 100,
    sort: "-createdAt",
    depth: 1,
  });

  return (
    <DashboardShell activePath="/dashboard/leads" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Leads"
        subtitle={`${leads.totalDocs} leads in totaal`}
        actions={<GoldBtn href="/admin/collections/leads/create">+ Nieuwe lead</GoldBtn>}
      />

      <div style={{ padding: "1.5rem 2.5rem" }}>
        {leads.docs.length === 0 ? (
          <Empty>Nog geen leads. Wacht op het eerste contactformulier of voeg er manueel een toe.</Empty>
        ) : (
          <Table headers={["Naam", "E-mail", "Telefoon", "Status", "Bron", "Toegewezen aan", "Datum"]}>
            {leads.docs.map((lead: any) => {
              const s = STATUS[lead.status] || { label: lead.status, kleur: "#666" };
              return (
                <tr key={lead.id} style={{ cursor: "pointer" }}>
                  <TD bold>
                    <Link href={`/dashboard/leads/${lead.id}`} style={{ color: "inherit", textDecoration: "none", display: "block" }}>
                      {lead.naam}
                    </Link>
                  </TD>
                  <TD>
                    <a href={`mailto:${lead.email}`} style={{ color: "#facb04", textDecoration: "none" }}>{lead.email}</a>
                  </TD>
                  <TD muted>
                    {lead.telefoon ? <a href={`tel:${lead.telefoon}`} style={{ color: "inherit", textDecoration: "none" }}>{lead.telefoon}</a> : "—"}
                  </TD>
                  <TD><StatusBadge label={s.label} kleur={s.kleur} /></TD>
                  <TD muted>{BRON[lead.bron] || lead.bron || "—"}</TD>
                  <TD muted>{lead.toegewezen_aan?.naam || "—"}</TD>
                  <TD muted>{fmtDate(lead.createdAt)}</TD>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
