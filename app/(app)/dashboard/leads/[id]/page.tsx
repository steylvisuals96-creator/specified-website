export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import DashboardShell, { StatusBadge, fmtDate, fmtDateTime } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const G = "#facb04";
const S2 = "#161616";
const S3 = "#1e1e1e";
const BORDER = "#252525";
const MUTED = "#666";
const TEXT = "#e8e8e8";

const STATUS: Record<string, { label: string; kleur: string }> = {
  nieuw:               { label: "Nieuw",           kleur: "#facb04" },
  gecontacteerd:       { label: "Gecontacteerd",   kleur: "#60a5fa" },
  bezoek_gepland:      { label: "Bezoek gepland",  kleur: "#a78bfa" },
  onderhandeling:      { label: "Onderhandeling",  kleur: "#f472b6" },
  afgerond:            { label: "Afgerond",        kleur: "#34d399" },
  niet_geinteresseerd: { label: "Niet geïnteresseerd", kleur: "#6b7280" },
};

async function updateStatus(leadId: string, status: string) {
  "use server";
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  await payload.update({ collection: "leads", id: leadId, data: { status } as any });
  redirect(`/dashboard/leads/${leadId}`);
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  let lead: any;
  try {
    lead = await payload.findByID({ collection: "leads", id, depth: 2 });
  } catch {
    notFound();
  }

  const s = STATUS[lead.status] || { label: lead.status, kleur: "#666" };
  const updateStatusWithId = updateStatus.bind(null, id);

  return (
    <DashboardShell activePath="/dashboard/leads" userName={(user as any).naam || user.email}>
      {/* Header */}
      <div style={{ padding: "2rem 2.5rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.5rem" }}>
            <Link href="/dashboard/leads" style={{ color: MUTED, textDecoration: "none" }}>Leads</Link>
            <span style={{ margin: "0 0.5rem" }}>›</span>
            <span>{lead.naam}</span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem", color: TEXT }}>{lead.naam}</h1>
          <StatusBadge label={s.label} kleur={s.kleur} />
        </div>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <a href={`mailto:${lead.email}`} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: "transparent", color: TEXT, textDecoration: "none", fontSize: "0.8rem", fontWeight: 500, border: `1px solid ${BORDER}` }}>
            ✉ E-mail
          </a>
          {lead.telefoon && (
            <a href={`tel:${lead.telefoon}`} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: "transparent", color: TEXT, textDecoration: "none", fontSize: "0.8rem", fontWeight: 500, border: `1px solid ${BORDER}` }}>
              ☎ Bellen
            </a>
          )}
          <a href={`/dashboard/leads/${id}/edit`} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: G, color: "#111", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, border: `1px solid ${G}` }}>
            ✎ Bewerken
          </a>
        </div>
      </div>

      <div style={{ padding: "2rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem" }}>

        {/* Left — Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Contactgegevens */}
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1.25rem" }}>Contactgegevens</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <InfoField label="Naam" value={lead.naam} />
              <InfoField label="E-mail" value={<a href={`mailto:${lead.email}`} style={{ color: G, textDecoration: "none" }}>{lead.email}</a>} />
              <InfoField label="Telefoon" value={lead.telefoon ? <a href={`tel:${lead.telefoon}`} style={{ color: TEXT, textDecoration: "none" }}>{lead.telefoon}</a> : "—"} />
              <InfoField label="Bron" value={lead.bron || "—"} />
            </div>
          </div>

          {/* Bericht */}
          {lead.bericht && (
            <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Bericht</h2>
              <p style={{ color: TEXT, fontSize: "0.88rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{lead.bericht}</p>
            </div>
          )}

          {/* Notities */}
          {lead.notities && (
            <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Interne notities</h2>
              <p style={{ color: "#b0a898", fontSize: "0.85rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{lead.notities}</p>
            </div>
          )}

          {/* Pand */}
          {lead.pand && (
            <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Geïnteresseerd in pand</h2>
              <Link href={`/dashboard/panden/${lead.pand.id || lead.pand}`} style={{ color: TEXT, textDecoration: "none", fontWeight: 600 }}>
                {lead.pand.titel || "Pand bekijken →"}
              </Link>
            </div>
          )}
        </div>

        {/* Right — Status + Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Status wijzigen */}
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Status wijzigen</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Object.entries(STATUS).map(([value, { label, kleur }]) => (
                <form key={value} action={updateStatusWithId.bind(null, value)}>
                  <button type="submit" style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.6rem 0.875rem", borderRadius: "0.375rem", background: lead.status === value ? `${kleur}18` : S3, border: `1px solid ${lead.status === value ? kleur + "50" : BORDER}`, color: lead.status === value ? kleur : MUTED, fontSize: "0.8rem", fontWeight: lead.status === value ? 600 : 400, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: kleur, flexShrink: 0 }} />
                    {label}
                    {lead.status === value && <span style={{ marginLeft: "auto", fontSize: "0.7rem" }}>✓</span>}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <InfoField label="Toegewezen aan" value={lead.toegewezen_aan?.naam || "—"} />
              <InfoField label="Opvolging" value={lead.opvolging ? fmtDate(lead.opvolging) : "—"} />
              <InfoField label="Aangemaakt" value={fmtDateTime(lead.createdAt)} />
              <InfoField label="Bijgewerkt" value={fmtDateTime(lead.updatedAt)} />
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
