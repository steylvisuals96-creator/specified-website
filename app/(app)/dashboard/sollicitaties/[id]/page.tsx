export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import DashboardShell, { PageHeader, LimeBtn, StatusBadge, fmtDate } from "@/components/DashboardShell";
import SollicitatieEditDrawer from "@/components/SollicitatieEditDrawer";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const MUTED = "rgba(255,255,255,0.4)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f0f0f0";

const statusKleur: Record<string, string> = {
  nieuw: "#60a5fa", screening: "#dffd7b", tel_gescreend: "#a78bfa",
  voorgesteld: "#fb923c", interview_gepland: "#f472b6", interview_afgerond: "#e879f9",
  aanbod: "#34d399", geplaatst: "#34d399", afgewezen: "#6b7280", teruggetrokken: "#6b7280",
};
const statusLabel: Record<string, string> = {
  nieuw: "Nieuw", screening: "In screening", tel_gescreend: "Telefonisch gescreend",
  voorgesteld: "Voorgesteld aan klant", interview_gepland: "Interview gepland",
  interview_afgerond: "Interview afgerond", aanbod: "Aanbod uitgebracht",
  geplaatst: "Geplaatst ✓", afgewezen: "Niet weerhouden", teruggetrokken: "Teruggetrokken",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", width: "8rem", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "0.82rem", color: MUTED }}>{value}</span>
    </div>
  );
}

function TimelineStep({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  const kleur = done ? "#34d399" : active ? LIME : "#333";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <div style={{ width: "0.65rem", height: "0.65rem", borderRadius: "50%", background: done ? "#34d399" : active ? LIME : "#333", border: `1.5px solid ${kleur}`, flexShrink: 0 }} />
      <span style={{ fontSize: "0.78rem", color: done ? "#34d399" : active ? LIME : "#444", fontWeight: active || done ? 600 : 400 }}>{label}</span>
    </div>
  );
}

const PIPELINE_STEPS = [
  { value: "nieuw", label: "Nieuw" },
  { value: "screening", label: "In screening" },
  { value: "tel_gescreend", label: "Telefonisch gescreend" },
  { value: "voorgesteld", label: "Voorgesteld aan klant" },
  { value: "interview_gepland", label: "Interview gepland" },
  { value: "interview_afgerond", label: "Interview afgerond" },
  { value: "aanbod", label: "Aanbod uitgebracht" },
  { value: "geplaatst", label: "Geplaatst ✓" },
];

export default async function SollicitatieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const sol = await payload.findByID({ collection: "sollicitaties" as any, id, depth: 2 }).catch(() => null);
  if (!sol) notFound();
  const s = sol as any;

  const kandidaatNaam = s.kandidaat?.naam || [s.kandidaat?.voornaam, s.kandidaat?.achternaam].filter(Boolean).join(" ") || "—";
  const vacatureTitel = s.vacature?.titel || "—";
  const activeIdx = PIPELINE_STEPS.findIndex((p) => p.value === s.status);

  return (
    <DashboardShell activePath="/dashboard/sollicitaties" userName={(user as any).naam || user.email}>
      <PageHeader
        title={`${kandidaatNaam} → ${vacatureTitel}`}
        subtitle="Sollicitatie detail"
        actions={<LimeBtn href="/dashboard/sollicitaties" outline>← Terug</LimeBtn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 0, minHeight: "calc(100vh - 90px)" }}>
        {/* Sidebar */}
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: "1.5rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            {s.status && <StatusBadge label={statusLabel[s.status] || s.status} kleur={statusKleur[s.status] || "#6b7280"} />}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <a href={`/dashboard/kandidaten/${s.kandidaat?.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.75rem", background: "#27272a", borderRadius: "5px", textDecoration: "none", marginBottom: "0.5rem" }}>
              <span>👤</span>
              <span style={{ fontSize: "0.82rem", color: LIME, fontWeight: 600 }}>{kandidaatNaam}</span>
            </a>
            <a href={`/dashboard/vacatures/${s.vacature?.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.75rem", background: "#27272a", borderRadius: "5px", textDecoration: "none" }}>
              <span>📋</span>
              <span style={{ fontSize: "0.82rem", color: "#fb923c", fontWeight: 600 }}>{vacatureTitel}</span>
            </a>
          </div>

          <InfoRow label="Gesolliciteerd" value={s.datum_sollicitatie ? fmtDate(s.datum_sollicitatie) : null} />
          <InfoRow label="Interview" value={s.datum_interview ? fmtDate(s.datum_interview) : null} />
          <InfoRow label="Startdatum" value={s.startdatum ? fmtDate(s.startdatum) : null} />
          <InfoRow label="Consultant" value={s.consultant?.naam || s.consultant?.email} />

          {s.notities && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#27272a", borderRadius: "5px", fontSize: "0.8rem", color: MUTED, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {s.notities}
            </div>
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <SollicitatieEditDrawer
              id={id}
              titel={`${kandidaatNaam} → ${vacatureTitel}`}
              initial={{ status: s.status, datum_sollicitatie: s.datum_sollicitatie, datum_interview: s.datum_interview, startdatum: s.startdatum, notities: s.notities }}
            />
          </div>
        </div>

        {/* Pipeline progress */}
        <div style={{ padding: "1.5rem 2rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>Pipeline voortgang</div>

          {["afgewezen", "teruggetrokken"].includes(s.status) ? (
            <div style={{ padding: "1rem", background: "#6b728018", border: "1px solid #6b728040", borderRadius: "6px", fontSize: "0.85rem", color: "#6b7280" }}>
              {statusLabel[s.status]} — niet verder in de pipeline.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative" }}>
              <div style={{ position: "absolute", left: "0.3rem", top: "0.6rem", bottom: "0.6rem", width: "1px", background: BORDER }} />
              {PIPELINE_STEPS.map((step, i) => (
                <TimelineStep
                  key={step.value}
                  label={step.label}
                  active={i === activeIdx}
                  done={i < activeIdx}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
