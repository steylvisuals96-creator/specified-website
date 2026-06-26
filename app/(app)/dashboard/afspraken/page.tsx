export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell, { PageHeader, GoldBtn, Table, TD, StatusBadge, Empty, fmtDateTime } from "@/components/DashboardShell";
import AfsprakenKalender from "@/components/AfsprakenKalender";

const configPromise = import("@payload-config").then((m) => m.default);

const STATUS: Record<string, { label: string; kleur: string }> = {
  gepland:      { label: "Gepland",     kleur: "#facb04" },
  bevestigd:    { label: "Bevestigd",   kleur: "#34d399" },
  geannuleerd:  { label: "Geannuleerd", kleur: "#6b7280" },
  afgerond:     { label: "Afgerond",    kleur: "#60a5fa" },
};

const TYPE: Record<string, string> = {
  bezichtiging: "Bezichtiging",
  schatting: "Schatting",
  kennismaking: "Kennismaking",
  ondertekening: "Ondertekening",
  overig: "Overig",
};

export default async function AfsprakenPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const afspraken = await payload.find({
    collection: "afspraken",
    limit: 500,
    sort: "datum",
    depth: 1,
  });

  const serialized = afspraken.docs.map((a: any) => ({
    id: a.id,
    titel: a.titel,
    datum: a.datum,
    type: a.type ?? "overig",
    status: a.status,
    kleur: STATUS[a.status]?.kleur ?? "#facb04",
  }));

  const isKalender = view === "kalender";

  return (
    <DashboardShell activePath="/dashboard/afspraken" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Afspraken"
        subtitle={`${afspraken.totalDocs} afspraken`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <GoldBtn href={isKalender ? "/dashboard/afspraken" : "/dashboard/afspraken?view=kalender"}>
              {isKalender ? "Lijst" : "Kalender"}
            </GoldBtn>
            <GoldBtn href="/dashboard/afspraken/create">+ Nieuwe afspraak</GoldBtn>
          </div>
        }
      />

      <div style={{ padding: "1.5rem 2.5rem" }}>
        {isKalender ? (
          <AfsprakenKalender afspraken={serialized} />
        ) : afspraken.docs.length === 0 ? (
          <Empty>Geen afspraken gepland.</Empty>
        ) : (
          <Table headers={["Titel", "Type", "Datum", "Locatie", "Lead", "Status"]}>
            {afspraken.docs.map((a: any) => {
              const s = STATUS[a.status] || { label: a.status, kleur: "#666" };
              return (
                <tr key={a.id} style={{ cursor: "pointer" }}>
                  <TD bold>
                    <Link href={`/dashboard/afspraken/${a.id}`} style={{ color: "inherit", textDecoration: "none", display: "block" }}>
                      {a.titel}
                    </Link>
                  </TD>
                  <TD muted>{TYPE[a.type] || a.type || "—"}</TD>
                  <TD>{a.datum ? fmtDateTime(a.datum) : "—"}</TD>
                  <TD muted>{a.locatie || "—"}</TD>
                  <TD muted>{a.lead?.naam || "—"}</TD>
                  <TD><StatusBadge label={s.label} kleur={s.kleur} /></TD>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
