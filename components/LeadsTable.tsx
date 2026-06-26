"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

const G = "#facb04";
const BORDER = "#252525";
const S2 = "#161616";
const S3 = "#1e1e1e";
const MUTED = "#666";
const TEXT = "#e8e8e8";

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
  contactformulier: "Contactformulier",
};

type Lead = {
  id: string;
  naam: string;
  email: string;
  telefoon?: string;
  status: string;
  bron?: string;
  toegewezen_aan?: { naam?: string } | null;
  createdAt: string;
};

type Makelaar = { id: string; naam: string };

export default function LeadsTable({ initialLeads, makelaars }: { initialLeads: Lead[]; makelaars: Makelaar[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeKandidaten, setMergeKandidaten] = useState<[Lead, Lead] | null>(null);
  const [bezig, startTransition] = useTransition();
  const [melding, setMelding] = useState<{ type: "ok" | "fout"; tekst: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState("alle");
  const [zoek, setZoek] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);

  function toonMelding(type: "ok" | "fout", tekst: string) {
    setMelding({ type, tekst });
    setTimeout(() => setMelding(null), 3500);
  }

  function toggleSelectAll() {
    if (selected.size === zichtbaar.length) setSelected(new Set());
    else setSelected(new Set(zichtbaar.map(l => l.id)));
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
    if (mergeMode) {
      const arr = [...next];
      if (arr.length === 2) {
        const a = leads.find(l => l.id === arr[0])!;
        const b = leads.find(l => l.id === arr[1])!;
        setMergeKandidaten([a, b]);
      } else setMergeKandidaten(null);
    }
  }

  const zichtbaar = leads.filter(l => {
    if (filterStatus !== "alle" && l.status !== filterStatus) return false;
    if (zoek && !l.naam.toLowerCase().includes(zoek.toLowerCase()) && !l.email.toLowerCase().includes(zoek.toLowerCase())) return false;
    return true;
  });

  async function bulkVerwijder(ids: string[]) {
    startTransition(async () => {
      const res = await fetch("/api/leads/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => !ids.includes(l.id)));
        setSelected(new Set());
        toonMelding("ok", `${ids.length} lead(s) verwijderd`);
      } else toonMelding("fout", "Verwijderen mislukt");
      setConfirmDelete(null);
    });
  }

  async function bulkStatus(status: string) {
    const ids = [...selected];
    startTransition(async () => {
      const res = await fetch("/api/leads/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, veld: "status", waarde: status }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => ids.includes(l.id) ? { ...l, status } : l));
        setSelected(new Set());
        toonMelding("ok", `Status bijgewerkt naar "${STATUS[status]?.label}"`);
      } else toonMelding("fout", "Status wijzigen mislukt");
    });
  }

  async function bulkToewijzen(makelaarId: string) {
    const ids = [...selected];
    const makelaar = makelaars.find(m => m.id === makelaarId);
    startTransition(async () => {
      const res = await fetch("/api/leads/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, veld: "toegewezen_aan", waarde: makelaarId }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => ids.includes(l.id) ? { ...l, toegewezen_aan: { naam: makelaar?.naam } } : l));
        setSelected(new Set());
        toonMelding("ok", `${ids.length} lead(s) toegewezen aan ${makelaar?.naam}`);
      } else toonMelding("fout", "Toewijzen mislukt");
    });
  }

  async function voerMergeUit(bewaarId: string, verwijderId: string) {
    startTransition(async () => {
      const res = await fetch("/api/leads/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bewaarId, verwijderId }),
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== verwijderId));
        setSelected(new Set());
        setMergeMode(false);
        setMergeKandidaten(null);
        toonMelding("ok", "Leads samengevoegd");
      } else toonMelding("fout", "Samenvoegen mislukt");
    });
  }

  const aantalGeselecteerd = selected.size;

  return (
    <div>
      {/* Melding */}
      {melding && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: melding.type === "ok" ? "#052e16" : "#2d1010",
          border: `1px solid ${melding.type === "ok" ? "#34d399" : "#ef4444"}`,
          color: melding.type === "ok" ? "#34d399" : "#fca5a5",
          borderRadius: 8, padding: "0.75rem 1.25rem", fontSize: "0.82rem", fontWeight: 600,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}>
          {melding.type === "ok" ? "✓ " : "✗ "}{melding.tekst}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "2rem", maxWidth: 400, width: "90%" }}>
            <h3 style={{ color: TEXT, fontSize: "1rem", fontWeight: 700, margin: "0 0 0.75rem" }}>Lead(s) verwijderen?</h3>
            <p style={{ color: MUTED, fontSize: "0.82rem", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
              Je staat op het punt {confirmDelete.length} lead(s) definitief te verwijderen. Dit kan niet ongedaan worden gemaakt.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: S3, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.82rem" }}>Annuleren</button>
              <button onClick={() => bulkVerwijder(confirmDelete)} disabled={bezig} style={{ background: "#ef4444", border: "none", color: "#fff", borderRadius: 6, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700 }}>
                {bezig ? "Bezig…" : "Verwijder definitief"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge dialog */}
      {mergeKandidaten && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "2rem", maxWidth: 560, width: "90%" }}>
            <h3 style={{ color: TEXT, fontSize: "1rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Leads samenvoegen</h3>
            <p style={{ color: MUTED, fontSize: "0.78rem", margin: "0 0 1.5rem" }}>Kies welke lead je wilt bewaren. De andere wordt verwijderd, maar zijn notities worden overgenomen.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              {mergeKandidaten.map((lead, i) => (
                <div key={lead.id} style={{ background: S3, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "1rem" }}>
                  <div style={{ fontWeight: 700, color: TEXT, marginBottom: "0.5rem", fontSize: "0.88rem" }}>{lead.naam}</div>
                  <div style={{ fontSize: "0.75rem", color: MUTED, marginBottom: "0.25rem" }}>{lead.email}</div>
                  {lead.telefoon && <div style={{ fontSize: "0.75rem", color: MUTED, marginBottom: "0.25rem" }}>{lead.telefoon}</div>}
                  <div style={{ marginTop: "0.75rem" }}>
                    <button
                      onClick={() => voerMergeUit(lead.id, mergeKandidaten[i === 0 ? 1 : 0].id)}
                      disabled={bezig}
                      style={{ width: "100%", background: G, border: "none", color: "#111", borderRadius: 6, padding: "0.5rem", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}
                    >
                      {bezig ? "Bezig…" : "Bewaar deze lead"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setMergeKandidaten(null); setMergeMode(false); setSelected(new Set()); }} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.78rem" }}>Annuleren</button>
          </div>
        </div>
      )}

      {/* Filters & zoekbalk */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Zoek op naam of e-mail…"
          value={zoek}
          onChange={e => setZoek(e.target.value)}
          style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, padding: "0.45rem 0.875rem", fontSize: "0.8rem", flex: "1 1 200px", outline: "none" }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, padding: "0.45rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}
        >
          <option value="alle">Alle statussen</option>
          {Object.entries(STATUS).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>

        {/* Merge mode toggle */}
        <button
          onClick={() => { setMergeMode(m => !m); setSelected(new Set()); setMergeKandidaten(null); }}
          style={{ background: mergeMode ? "#7c3aed" : S2, border: `1px solid ${mergeMode ? "#7c3aed" : BORDER}`, color: TEXT, borderRadius: 6, padding: "0.45rem 0.875rem", fontSize: "0.8rem", cursor: "pointer", fontWeight: mergeMode ? 700 : 400 }}
        >
          {mergeMode ? "✕ Samenvoegen annuleren" : "⇌ Samenvoegen"}
        </button>
        {mergeMode && (
          <span style={{ fontSize: "0.75rem", color: "#a78bfa" }}>
            Selecteer exact 2 leads om samen te voegen {selected.size === 2 ? "✓" : `(${selected.size}/2)`}
          </span>
        )}
      </div>

      {/* Bulk actie balk */}
      {aantalGeselecteerd > 0 && !mergeMode && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#0d1117", border: `1px solid ${G}`, borderRadius: 8, padding: "0.625rem 1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: G, fontWeight: 700 }}>{aantalGeselecteerd} geselecteerd</span>
          <div style={{ width: 1, height: 16, background: BORDER }} />
          <span style={{ fontSize: "0.75rem", color: MUTED }}>Status:</span>
          {Object.entries(STATUS).map(([v, { label, kleur }]) => (
            <button key={v} onClick={() => bulkStatus(v)} disabled={bezig} style={{ background: kleur + "18", border: `1px solid ${kleur}40`, color: kleur, borderRadius: 20, padding: "0.25rem 0.75rem", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>{label}</button>
          ))}
          {makelaars.length > 0 && (
            <>
              <div style={{ width: 1, height: 16, background: BORDER }} />
              <span style={{ fontSize: "0.75rem", color: MUTED }}>Toewijzen:</span>
              <select
                onChange={e => e.target.value && bulkToewijzen(e.target.value)}
                defaultValue=""
                disabled={bezig}
                style={{ background: S3, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}
              >
                <option value="">Kies makelaar…</option>
                {makelaars.map(m => <option key={m.id} value={m.id}>{m.naam}</option>)}
              </select>
            </>
          )}
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setConfirmDelete([...selected])} disabled={bezig} style={{ background: "#7f1d1d", border: "1px solid #ef4444", color: "#fca5a5", borderRadius: 6, padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
              🗑 Verwijder ({aantalGeselecteerd})
            </button>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${BORDER}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              <th style={{ width: 40, padding: "0.75rem 0.875rem", background: S2 }}>
                <input
                  type="checkbox"
                  checked={selected.size === zichtbaar.length && zichtbaar.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer", accentColor: G, width: 14, height: 14 }}
                />
              </th>
              {["Naam", "E-mail", "Telefoon", "Status", "Bron", "Toegewezen aan", "Datum", ""].map(h => (
                <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: MUTED, background: S2, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zichtbaar.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: MUTED, fontSize: "0.82rem" }}>Geen leads gevonden</td></tr>
            )}
            {zichtbaar.map((lead, i) => {
              const s = STATUS[lead.status] || { label: lead.status, kleur: "#666" };
              const isSelected = selected.has(lead.id);
              return (
                <tr key={lead.id} style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? "#0d1117" : i % 2 === 0 ? "#0f0f0f" : S2, transition: "background 0.1s" }}>
                  <td style={{ padding: "0.5rem 0.875rem" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(lead.id)}
                      style={{ cursor: "pointer", accentColor: G, width: 14, height: 14 }}
                    />
                  </td>
                  <td style={{ padding: "0.5rem 0.875rem", fontWeight: 600, color: TEXT, whiteSpace: "nowrap" }}>
                    <Link href={`/dashboard/leads/${lead.id}`} style={{ color: "inherit", textDecoration: "none" }}>{lead.naam}</Link>
                  </td>
                  <td style={{ padding: "0.5rem 0.875rem" }}>
                    <a href={`mailto:${lead.email}`} style={{ color: G, textDecoration: "none" }}>{lead.email}</a>
                  </td>
                  <td style={{ padding: "0.5rem 0.875rem", color: MUTED }}>
                    {lead.telefoon ? <a href={`tel:${lead.telefoon}`} style={{ color: "inherit", textDecoration: "none" }}>{lead.telefoon}</a> : "—"}
                  </td>
                  <td style={{ padding: "0.5rem 0.875rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.kleur + "18", border: `1px solid ${s.kleur}40`, borderRadius: 20, padding: "0.2rem 0.625rem", fontSize: "0.7rem", fontWeight: 600, color: s.kleur, whiteSpace: "nowrap" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.kleur }} />
                      {s.label}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem 0.875rem", color: MUTED }}>{BRON[lead.bron ?? ""] || lead.bron || "—"}</td>
                  <td style={{ padding: "0.5rem 0.875rem", color: MUTED }}>{lead.toegewezen_aan?.naam || "—"}</td>
                  <td style={{ padding: "0.5rem 0.875rem", color: MUTED, whiteSpace: "nowrap" }}>
                    {new Date(lead.createdAt).toLocaleDateString("nl-BE", { day: "numeric", month: "short" })}
                  </td>
                  <td style={{ padding: "0.5rem 0.625rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <Link href={`/dashboard/leads/${lead.id}`} style={{ display: "inline-flex", padding: "0.25rem 0.5rem", borderRadius: 4, background: S3, border: `1px solid ${BORDER}`, color: MUTED, textDecoration: "none", fontSize: "0.7rem" }}>✎</Link>
                      <button onClick={() => setConfirmDelete([lead.id])} style={{ display: "inline-flex", padding: "0.25rem 0.5rem", borderRadius: 4, background: "#2d1010", border: "1px solid #7f1d1d", color: "#fca5a5", cursor: "pointer", fontSize: "0.7rem" }}>✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: MUTED }}>
        {zichtbaar.length} van {leads.length} leads zichtbaar
      </div>
    </div>
  );
}
