export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import DashboardShell, { StatusBadge, fmtDate } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const G = "#facb04";
const S2 = "#161616";
const S3 = "#1e1e1e";
const BORDER = "#252525";
const MUTED = "#666";
const TEXT = "#e8e8e8";

const STATUS: Record<string, { label: string; kleur: string }> = {
  open:     { label: "Open",     kleur: "#facb04" },
  bezig:    { label: "Bezig",    kleur: "#60a5fa" },
  afgerond: { label: "Afgerond", kleur: "#34d399" },
};

const PRIORITEIT: Record<string, { label: string; kleur: string }> = {
  hoog:    { label: "Hoog",    kleur: "#e05252" },
  normaal: { label: "Normaal", kleur: "#facb04" },
  laag:    { label: "Laag",    kleur: "#6b7280" },
};

async function updateStatus(taakId: string, status: string) {
  "use server";
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  await payload.update({ collection: "taken", id: taakId, data: { status } as any });
  redirect(`/dashboard/taken/${taakId}`);
}

export default async function TaakDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  let taak: any;
  try {
    taak = await payload.findByID({ collection: "taken", id, depth: 2 });
  } catch {
    notFound();
  }

  const s = STATUS[taak.status] || { label: taak.status, kleur: "#666" };
  const p = PRIORITEIT[taak.prioriteit] || { label: taak.prioriteit, kleur: "#666" };
  const isLate = taak.deadline && new Date(taak.deadline) < new Date() && taak.status !== "afgerond";
  const updateStatusWithId = updateStatus.bind(null, id);

  return (
    <DashboardShell activePath="/dashboard/taken" userName={(user as any).naam || user.email}>
      <div style={{ padding: "2rem 2.5rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.5rem" }}>
            <Link href="/dashboard/taken" style={{ color: MUTED, textDecoration: "none" }}>Taken</Link>
            <span style={{ margin: "0 0.5rem" }}>›</span>
            <span>{taak.titel}</span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem", color: TEXT }}>{taak.titel}</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <StatusBadge label={s.label} kleur={s.kleur} />
            <StatusBadge label={p.label} kleur={p.kleur} />
            {isLate && <StatusBadge label="Vervallen" kleur="#e05252" />}
          </div>
        </div>
        <a href={`/dashboard/taken/${id}/edit`} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: G, color: "#111", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
          ✎ Bewerken
        </a>
      </div>

      <div style={{ padding: "2rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1.25rem" }}>Taakdetails</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <InfoField label="Toegewezen aan" value={taak.toegewezen_aan?.naam} />
              <InfoField label="Deadline" value={taak.deadline ? <span style={{ color: isLate ? "#e05252" : TEXT }}>{fmtDate(taak.deadline)}{isLate ? " ⚠" : ""}</span> : null} />
              <InfoField label="Lead" value={taak.lead?.naam} />
              <InfoField label="Pand" value={taak.pand?.titel} />
            </div>
          </div>

          {taak.beschrijving && (
            <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Beschrijving</h2>
              <p style={{ color: TEXT, fontSize: "0.88rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{taak.beschrijving}</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Status wijzigen</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Object.entries(STATUS).map(([value, { label, kleur }]) => (
                <form key={value} action={updateStatusWithId.bind(null, value)}>
                  <button type="submit" style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.6rem 0.875rem", borderRadius: "0.375rem", background: taak.status === value ? `${kleur}18` : S3, border: `1px solid ${taak.status === value ? kleur + "50" : BORDER}`, color: taak.status === value ? kleur : MUTED, fontSize: "0.8rem", fontWeight: taak.status === value ? 600 : 400, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: kleur, flexShrink: 0 }} />
                    {label}
                    {taak.status === value && <span style={{ marginLeft: "auto" }}>✓</span>}
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
