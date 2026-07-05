"use client";

import { useState, useEffect, useCallback } from "react";

const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f0f0f0";
const MUTED = "rgba(255,255,255,0.4)";

type Health = {
  reachable?: boolean;
  status?: string;
  checks?: Record<string, boolean>;
};

const LABELS: Record<string, string> = {
  website: "Website",
  cms_vacatures: "CRM — vacatures",
  cms_instellingen: "CRM — instellingen",
};

export default function SysteemStatus() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/health-check", { cache: "no-store" });
      setHealth(await res.json());
    } catch {
      setHealth({ reachable: false, status: "down" });
    } finally {
      setLoading(false);
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const healthy = health?.status === "ok";
  const kleur = loading ? "#6b7280" : healthy ? "#34d399" : "#f87171";
  const label = loading ? "Controleren…" : healthy ? "Alles operationeel" : "Probleem gedetecteerd";

  return (
    <div style={{ padding: "1.25rem 1.5rem", border: `1px solid ${BORDER}`, borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: health?.checks ? "1rem" : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: kleur, boxShadow: `0 0 8px ${kleur}`, flexShrink: 0 }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: TEXT }}>Systeemstatus</span>
          <span style={{ fontSize: "0.82rem", color: kleur, fontWeight: 500 }}>· {label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {checkedAt && (
            <span style={{ fontSize: "0.7rem", color: MUTED }}>
              {checkedAt.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={() => { setLoading(true); load(); }} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: "4px", color: MUTED, fontSize: "0.72rem", padding: "0.3rem 0.6rem", cursor: "pointer", fontFamily: "inherit" }}>
            ↻ Ververs
          </button>
        </div>
      </div>

      {health?.checks && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.5rem" }}>
          {Object.entries(health.checks).map(([key, ok]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", color: MUTED }}>
              <span style={{ color: ok ? "#34d399" : "#f87171", fontSize: "0.7rem" }}>{ok ? "●" : "●"}</span>
              {LABELS[key] || key}
              <span style={{ marginLeft: "auto", color: ok ? "#34d399" : "#f87171", fontWeight: 600, fontSize: "0.72rem" }}>
                {ok ? "OK" : "DOWN"}
              </span>
            </div>
          ))}
        </div>
      )}

      {health && !health.reachable && !loading && (
        <div style={{ fontSize: "0.78rem", color: "#f87171", marginTop: "0.5rem" }}>
          De website reageert niet. Controleer de deploy of neem contact op met de beheerder.
        </div>
      )}
    </div>
  );
}
