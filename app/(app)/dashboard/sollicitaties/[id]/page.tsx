export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import DashboardShell, { PageHeader, LimeBtn, StatusBadge, fmtDate } from "@/components/DashboardShell";
import SollicitatieEditDrawer from "@/components/SollicitatieEditDrawer";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const MUTED = "var(--bone-400)";
const BORDER = "var(--line)";
const TEXT = "var(--bone-100)";

const statusKleur: Record<string, string> = {
  nieuw: "#8fb3d9", screening: "#dffd7b", tel_gescreend: "#b5a1d8",
  voorgesteld: "#d9a86c", interview_gepland: "#d9a86c", interview_afgerond: "#b5a1d8",
  aanbod: "#9bd17f", geplaatst: "#9bd17f", afgewezen: "#6f6d62", teruggetrokken: "#6f6d62",
};
const statusLabel: Record<string, string> = {
  nieuw: "Nieuw", screening: "In screening", tel_gescreend: "Telefonisch gescreend",
  voorgesteld: "Voorgesteld aan klant", interview_gepland: "Interview gepland",
  interview_afgerond: "Interview afgerond", aanbod: "Aanbod uitgebracht",
  geplaatst: "Geplaatst", afgewezen: "Niet weerhouden", teruggetrokken: "Teruggetrokken",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", width: "8rem", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "0.875rem", color: MUTED }}>{value}</span>
    </div>
  );
}

function TimelineStep({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  const kleur = done ? "#9bd17f" : active ? LIME : "var(--olive-600)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <div style={{ width: "0.65rem", height: "0.65rem", borderRadius: "2px", background: done ? "#9bd17f" : active ? LIME : "var(--olive-600)", border: `1.5px solid ${kleur}`, flexShrink: 0 }} />
      <span style={{ fontSize: "0.8125rem", color: done ? "#9bd17f" : active ? LIME : "var(--olive-600)", fontWeight: active || done ? 600 : 400 }}>{label}</span>
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
  { value: "geplaatst", label: "Geplaatst" },
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
    <DashboardShell activePath="/dashboard/sollicitaties" userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader
        title={`${kandidaatNaam} voor ${vacatureTitel}`}
        subtitle="Sollicitatie detail"
        actions={<LimeBtn href="/dashboard/sollicitaties" outline>Terug</LimeBtn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 0, minHeight: "calc(100vh - 90px)" }}>
        {/* Sidebar */}
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: "1.5rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            {s.status && <StatusBadge label={statusLabel[s.status] || s.status} kleur={statusKleur[s.status] || "#6f6d62"} />}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <a href={`/dashboard/kandidaten/${s.kandidaat?.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.75rem", background: "var(--ink-800)", borderRadius: "2px", textDecoration: "none", marginBottom: "0.5rem" }}>
              
              <span style={{ fontSize: "0.875rem", color: LIME, fontWeight: 600 }}>{kandidaatNaam}</span>
            </a>
            <a href={`/dashboard/vacatures/${s.vacature?.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.75rem", background: "var(--ink-800)", borderRadius: "2px", textDecoration: "none" }}>
              
              <span style={{ fontSize: "0.875rem", color: "#d9a86c", fontWeight: 600 }}>{vacatureTitel}</span>
            </a>
          </div>

          <InfoRow label="Gesolliciteerd" value={s.datum_sollicitatie ? fmtDate(s.datum_sollicitatie) : null} />
          <InfoRow label="Interview" value={s.datum_interview ? fmtDate(s.datum_interview) : null} />
          <InfoRow label="Startdatum" value={s.startdatum ? fmtDate(s.startdatum) : null} />
          <InfoRow label="Consultant" value={s.consultant?.naam || s.consultant?.email} />

          {s.notities && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--ink-800)", borderRadius: "2px", fontSize: "0.875rem", color: MUTED, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {s.notities}
            </div>
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <SollicitatieEditDrawer
              id={id}
              titel={`${kandidaatNaam} voor ${vacatureTitel}`}
              initial={{ status: s.status, datum_sollicitatie: s.datum_sollicitatie, datum_interview: s.datum_interview, startdatum: s.startdatum, notities: s.notities }}
            />
          </div>
        </div>

        {/* Pipeline progress */}
        <div style={{ padding: "1.5rem 2rem" }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", marginBottom: "1.25rem" }}>Pipeline voortgang</div>

          {["afgewezen", "teruggetrokken"].includes(s.status) ? (
            <div style={{ padding: "1rem", background: "#6f6d6218", border: "1px solid #6f6d6240", borderRadius: "2px", fontSize: "0.875rem", color: "#6f6d62" }}>
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
