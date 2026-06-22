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
  beschikbaar: { label: "Beschikbaar", kleur: "#34d399" },
  onder_bod:   { label: "Onder bod",   kleur: "#facb04" },
  verkocht:    { label: "Verkocht",    kleur: "#60a5fa" },
  verhuurd:    { label: "Verhuurd",    kleur: "#a78bfa" },
  niet_actief: { label: "Niet actief", kleur: "#6b7280" },
};

async function updateStatus(pandId: string, status: string) {
  "use server";
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  await payload.update({ collection: "panden", id: pandId, data: { status } as any });
  redirect(`/dashboard/panden/${pandId}`);
}

export default async function PandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  let pand: any;
  try {
    pand = await payload.findByID({ collection: "panden", id, depth: 1 });
  } catch {
    notFound();
  }

  const s = STATUS[pand.status] || { label: pand.status, kleur: "#666" };
  const prijs = pand.prijs
    ? new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(pand.prijs)
    : null;
  const updateStatusWithId = updateStatus.bind(null, id);

  return (
    <DashboardShell activePath="/dashboard/panden" userName={(user as any).naam || user.email}>
      <div style={{ padding: "2rem 2.5rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.5rem" }}>
            <Link href="/dashboard/panden" style={{ color: MUTED, textDecoration: "none" }}>Panden</Link>
            <span style={{ margin: "0 0.5rem" }}>›</span>
            <span>{pand.titel || "Pand"}</span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem", color: TEXT }}>{pand.titel || "Zonder titel"}</h1>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <StatusBadge label={s.label} kleur={s.kleur} />
            {prijs && <span style={{ fontSize: "1.1rem", fontWeight: 700, color: G }}>{prijs}</span>}
          </div>
        </div>
        <a href={`/admin/collections/panden/${id}`} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: G, color: "#111", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
          ✎ Bewerken
        </a>
      </div>

      <div style={{ padding: "2rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1.25rem" }}>Pand details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <InfoField label="Type" value={pand.type} />
              <InfoField label="Gemeente" value={pand.gemeente} />
              <InfoField label="Postcode" value={pand.postcode} />
              <InfoField label="Adres" value={pand.adres} />
              <InfoField label="Bewoonbare opp." value={pand.bewoonbaarOpp ? `${pand.bewoonbaarOpp} m²` : null} />
              <InfoField label="Perceeloppervlakte" value={pand.perceelOpp ? `${pand.perceelOpp} m²` : null} />
              <InfoField label="Bouwjaar" value={pand.bouwjaar} />
              <InfoField label="EPC-score" value={pand.epc} />
              <InfoField label="Slaapkamers" value={pand.slaapkamers} />
              <InfoField label="Badkamers" value={pand.badkamers} />
            </div>
          </div>

          {pand.beschrijving && (
            <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Beschrijving</h2>
              <p style={{ color: TEXT, fontSize: "0.88rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{pand.beschrijving}</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Status wijzigen</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Object.entries(STATUS).map(([value, { label, kleur }]) => (
                <form key={value} action={updateStatusWithId.bind(null, value)}>
                  <button type="submit" style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.6rem 0.875rem", borderRadius: "0.375rem", background: pand.status === value ? `${kleur}18` : S3, border: `1px solid ${pand.status === value ? kleur + "50" : BORDER}`, color: pand.status === value ? kleur : MUTED, fontSize: "0.8rem", fontWeight: pand.status === value ? 600 : 400, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: kleur, flexShrink: 0 }} />
                    {label}
                    {pand.status === value && <span style={{ marginLeft: "auto" }}>✓</span>}
                  </button>
                </form>
              ))}
            </div>
          </div>

          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, margin: "0 0 1rem" }}>Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <InfoField label="Prijs" value={prijs} />
              <InfoField label="Ref." value={pand.referentie} />
              <InfoField label="Toegevoegd" value={fmtDate(pand.createdAt)} />
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
