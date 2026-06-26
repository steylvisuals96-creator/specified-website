"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const G = "#facb04";
const BORDER = "#252525";
const S2 = "#161616";
const S3 = "#1e1e1e";
const MUTED = "#666";
const TEXT = "#e8e8e8";

const STATUS: Record<string, { label: string; kleur: string }> = {
  nieuw:               { label: "Nieuw",          kleur: "#facb04" },
  gecontacteerd:       { label: "Gecontacteerd",  kleur: "#60a5fa" },
  bezoek_gepland:      { label: "Bezoek gepland", kleur: "#a78bfa" },
  onderhandeling:      { label: "Onderhandeling", kleur: "#f472b6" },
  afgerond:            { label: "Afgerond",       kleur: "#34d399" },
  niet_geinteresseerd: { label: "Niet int.",      kleur: "#6b7280" },
};

type Lead = { id: string; naam: string; email: string; telefoon?: string | null; status: string; createdAt: string };
type Groep = { reden: string; leads: Lead[] };

export default function DuplicatenDetector({ onMerge }: { onMerge?: () => void }) {
  const router = useRouter();
  const [groepen, setGroepen] = useState<Groep[]>([]);
  const [laden, setLaden] = useState(true);
  const [ingeklapt, setIngeklapt] = useState(false);
  const [mergeDialoog, setMergeDialoog] = useState<{ groep: Groep; bewaar: Lead | null } | null>(null);
  const [bezig, setBezig] = useState(false);
  const [genegeerd, setGenegeerd] = useState<Set<string>>(new Set());
  const [melding, setMelding] = useState<string | null>(null);

  const laadDuplicaten = useCallback(async () => {
    setLaden(true);
    try {
      const res = await fetch("/api/leads/duplicaten");
      const data = await res.json();
      setGroepen(data.groepen ?? []);
    } catch {}
    setLaden(false);
  }, []);

  useEffect(() => { laadDuplicaten(); }, [laadDuplicaten]);

  function negeerGroep(reden: string) {
    setGenegeerd(prev => new Set(prev).add(reden));
  }

  async function voerMergeUit(bewaarId: string, verwijderId: string, groepReden: string) {
    setBezig(true);
    try {
      const res = await fetch("/api/leads/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bewaarId, verwijderId }),
      });
      if (res.ok) {
        setMelding("Leads samengevoegd ✓");
        setTimeout(() => setMelding(null), 3000);
        setMergeDialoog(null);
        setGenegeerd(prev => new Set(prev).add(groepReden));
        await laadDuplicaten();
        onMerge?.();
        router.refresh();
      }
    } catch {}
    setBezig(false);
  }

  const zichtbareGroepen = groepen.filter(g => !genegeerd.has(g.reden));

  if (laden) return (
    <div style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1rem", fontSize: "0.78rem", color: MUTED }}>
      Duplicaten controleren…
    </div>
  );

  if (zichtbareGroepen.length === 0) return null;

  return (
    <>
      {melding && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "#052e16", border: "1px solid #34d399", color: "#34d399", borderRadius: 8, padding: "0.75rem 1.25rem", fontSize: "0.82rem", fontWeight: 600 }}>
          {melding}
        </div>
      )}

      {/* Merge dialoog */}
      {mergeDialoog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "2rem", maxWidth: 580, width: "90%" }}>
            <h3 style={{ color: TEXT, fontSize: "1rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Leads samenvoegen</h3>
            <p style={{ color: MUTED, fontSize: "0.78rem", margin: "0 0 0.5rem" }}>
              <span style={{ color: "#f472b6", fontWeight: 600 }}>Reden: </span>{mergeDialoog.groep.reden}
            </p>
            <p style={{ color: MUTED, fontSize: "0.75rem", margin: "0 0 1.25rem" }}>
              Kies welke lead je bewaart. Notities en activiteiten van beide worden gecombineerd. Ontbrekende velden worden aangevuld.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${mergeDialoog.groep.leads.length}, 1fr)`, gap: "0.875rem", marginBottom: "1.25rem" }}>
              {mergeDialoog.groep.leads.map((lead, i) => {
                const s = STATUS[lead.status] || { label: lead.status, kleur: "#666" };
                const isBewaar = mergeDialoog.bewaar?.id === lead.id;
                return (
                  <div key={lead.id} style={{ background: isBewaar ? "#0d1117" : S3, border: `1px solid ${isBewaar ? G : BORDER}`, borderRadius: 8, padding: "1rem", cursor: "pointer", transition: "all 0.15s" }}
                    onClick={() => setMergeDialoog(d => d ? { ...d, bewaar: lead } : d)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 700, color: TEXT, fontSize: "0.85rem" }}>{lead.naam}</span>
                      {isBewaar && <span style={{ fontSize: "0.65rem", background: G, color: "#111", borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>BEWAAR</span>}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.2rem" }}>{lead.email}</div>
                    {lead.telefoon && <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.2rem" }}>{lead.telefoon}</div>}
                    <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.kleur, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.68rem", color: s.kleur }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#444", marginTop: "0.375rem" }}>
                      {new Date(lead.createdAt).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <button
                disabled={!mergeDialoog.bewaar || bezig}
                onClick={() => {
                  if (!mergeDialoog.bewaar) return;
                  const anderen = mergeDialoog.groep.leads.filter(l => l.id !== mergeDialoog.bewaar!.id);
                  // Merge sequentieel als er meer dan 2 zijn
                  const merge = async () => {
                    for (const ander of anderen) {
                      await voerMergeUit(mergeDialoog.bewaar!.id, ander.id, mergeDialoog.groep.reden);
                    }
                  };
                  merge();
                }}
                style={{ background: mergeDialoog.bewaar ? G : "#333", border: "none", color: mergeDialoog.bewaar ? "#111" : MUTED, borderRadius: 6, padding: "0.5rem 1.25rem", fontWeight: 700, fontSize: "0.82rem", cursor: mergeDialoog.bewaar ? "pointer" : "not-allowed" }}
              >
                {bezig ? "Bezig…" : mergeDialoog.bewaar ? `Samenvoegen → bewaar ${mergeDialoog.bewaar.naam}` : "Selecteer een lead om te bewaren"}
              </button>
              <button onClick={() => setMergeDialoog(null)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.78rem" }}>Annuleren</button>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      <div style={{ background: "#0d0a00", border: `1px solid ${G}40`, borderRadius: 10, marginBottom: "1.25rem", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.25rem", cursor: "pointer", borderBottom: ingeklapt ? "none" : `1px solid ${G}20` }}
          onClick={() => setIngeklapt(i => !i)}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0, boxShadow: "0 0 6px #f59e0b" }} />
          <span style={{ fontWeight: 700, color: G, fontSize: "0.82rem" }}>
            {zichtbareGroepen.length} mogelijke {zichtbareGroepen.length === 1 ? "duplicaat" : "duplicaten"} gedetecteerd
          </span>
          <span style={{ fontSize: "0.72rem", color: MUTED, marginLeft: "auto" }}>
            {zichtbareGroepen.reduce((s, g) => s + g.leads.length, 0)} leads betrokken
          </span>
          <button
            onClick={e => { e.stopPropagation(); laadDuplicaten(); }}
            style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 4, padding: "0.2rem 0.5rem", fontSize: "0.68rem", cursor: "pointer" }}
          >↻ Herlaad</button>
          <span style={{ color: MUTED, fontSize: "0.8rem" }}>{ingeklapt ? "›" : "‹"}</span>
        </div>

        {/* Groepen */}
        {!ingeklapt && (
          <div style={{ padding: "0.875rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {zichtbareGroepen.map(groep => (
              <div key={groep.reden} style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.875rem 1rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f59e0b" }}>Duplicaat gevonden</span>
                    <div style={{ fontSize: "0.78rem", color: TEXT, marginTop: "0.2rem", fontWeight: 500 }}>{groep.reden}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <button
                      onClick={() => setMergeDialoog({ groep, bewaar: null })}
                      style={{ background: G, border: "none", color: "#111", borderRadius: 6, padding: "0.35rem 0.875rem", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
                    >⇌ Samenvoegen</button>
                    <button
                      onClick={() => negeerGroep(groep.reden)}
                      style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: "0.35rem 0.625rem", fontSize: "0.75rem", cursor: "pointer" }}
                      title="Negeer dit duplicaat"
                    >✕</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                  {groep.leads.map(lead => {
                    const s = STATUS[lead.status] || { label: lead.status, kleur: "#666" };
                    return (
                      <div key={lead.id} style={{ background: S3, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "0.5rem 0.75rem", minWidth: 160 }}>
                        <div style={{ fontWeight: 600, color: TEXT, fontSize: "0.78rem", marginBottom: "0.2rem" }}>{lead.naam}</div>
                        <div style={{ fontSize: "0.68rem", color: MUTED }}>{lead.email}</div>
                        {lead.telefoon && <div style={{ fontSize: "0.68rem", color: MUTED }}>{lead.telefoon}</div>}
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: "0.375rem" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.kleur }} />
                          <span style={{ fontSize: "0.65rem", color: s.kleur }}>{s.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
