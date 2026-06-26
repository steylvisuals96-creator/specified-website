export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import DashboardShell, { StatusBadge, fmtDateTime } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const G = "#facb04";
const S2 = "#161616";
const S3 = "#1e1e1e";
const BORDER = "#252525";
const MUTED = "#666";
const TEXT = "#e8e8e8";

const STATUS: Record<string, { label: string; kleur: string }> = {
  gepland:     { label: "Gepland",     kleur: "#facb04" },
  bevestigd:   { label: "Bevestigd",   kleur: "#34d399" },
  geannuleerd: { label: "Geannuleerd", kleur: "#6b7280" },
  afgerond:    { label: "Afgerond",    kleur: "#60a5fa" },
};

async function updateStatus(afspraakId: string, status: string) {
  "use server";
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  await payload.update({ collection: "afspraken", id: afspraakId, data: { status } as any });
  redirect(`/dashboard/afspraken/${afspraakId}`);
}

export default async function AfspraakDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  let afspraak: any;
  try {
    afspraak = await payload.findByID({ collection: "afspraken", id, depth: 2 });
  } catch {
    notFound();
  }

  const s = STATUS[afspraak.status] || { label: afspraak.status, kleur: "#666" };
  const updateStatusWithId = updateStatus.bind(null, id);

  // Google Calendar URL
  function toGcalDate(iso: string, duurMin = 60) {
    const start = new Date(iso);
    const end = new Date(start.getTime() + duurMin * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return { start: fmt(start), end: fmt(end) };
  }
  const gcalDates = afspraak.datum ? toGcalDate(afspraak.datum, afspraak.duur ?? 60) : null;
  const gcalUrl = gcalDates ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(afspraak.titel)}&dates=${gcalDates.start}/${gcalDates.end}${afspraak.locatie ? `&location=${encodeURIComponent(afspraak.locatie)}` : ""}${afspraak.notities ? `&details=${encodeURIComponent(afspraak.notities)}` : ""}` : null;

  return (
    <DashboardShell activePath="/dashboard/afspraken" userName={(user as any).naam || user.email}>
      <div style={{ padding: "2rem 2.5rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.5rem" }}>
            <Link href="/dashboard/afspraken" style={{ color: MUTED, textDecoration: "none" }}>Afspraken</Link>
            <span style={{ margin: "0 0.5rem" }}>›</span>
            <span>{afspraak.titel}</span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem", color: TEXT }}>{afspraak.titel}</h1>
          <StatusBadge label={s.label} kleur={s.kleur} />
        </div>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          {gcalUrl && (
            <a href={gcalUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: "transparent", color: TEXT, textDecoration: "none", fontSize: "0.8rem", fontWeight: 500, border: `1px solid ${BORDER}` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Google Calendar
            </a>
          )}
          <a href={`/dashboard/afspraken/${id}/edit`} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: G, color: "#111", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
            ✎ Bewerken
          </a>
        </div>
      </div>

      <div style={{ padding: "2rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1.25rem" }}>Afspraakdetails</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <InfoField label="Type" value={afspraak.type} />
              <InfoField label="Datum" value={afspraak.datum ? fmtDateTime(afspraak.datum) : null} />
              <InfoField label="Duur" value={afspraak.duur ? `${afspraak.duur} min` : null} />
              <InfoField label="Locatie" value={afspraak.locatie} />
              <InfoField label="Lead" value={afspraak.lead?.naam} />
              <InfoField label="Pand" value={afspraak.pand?.titel} />
            </div>
          </div>

          {afspraak.notities && (
            <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Notities</h2>
              <p style={{ color: TEXT, fontSize: "0.88rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{afspraak.notities}</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Status wijzigen</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Object.entries(STATUS).map(([value, { label, kleur }]) => (
                <form key={value} action={updateStatusWithId.bind(null, value)}>
                  <button type="submit" style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.6rem 0.875rem", borderRadius: "0.375rem", background: afspraak.status === value ? `${kleur}18` : S3, border: `1px solid ${afspraak.status === value ? kleur + "50" : BORDER}`, color: afspraak.status === value ? kleur : MUTED, fontSize: "0.8rem", fontWeight: afspraak.status === value ? 600 : 400, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: kleur, flexShrink: 0 }} />
                    {label}
                    {afspraak.status === value && <span style={{ marginLeft: "auto" }}>✓</span>}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ fontSize: "0.85rem", color: TEXT }}>{value || "—"}</div>
    </div>
  );
}
