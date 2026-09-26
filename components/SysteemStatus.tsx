"use client";

import { useCallback, useEffect, useState } from "react";

type Health = {
  reachable?: boolean;
  status?: string;
  checks?: Record<string, boolean>;
};

const LABELS: Record<string, string> = {
  website: "website",
  cms_vacatures: "vacatures",
  cms_instellingen: "instellingen",
};

/** Eén rustige regel onderaan het overzicht; alleen opvallend als er iets mis is. */
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
  const kapot = health?.checks ? Object.entries(health.checks).filter(([, ok]) => !ok).map(([k]) => LABELS[k] || k) : [];
  const kleur = loading ? "var(--st-uit)" : healthy ? "var(--st-geplaatst)" : "var(--st-wacht)";
  const tekst = loading
    ? "Website en CMS controleren"
    : healthy
      ? "Website en CMS werken normaal"
      : kapot.length
        ? `Probleem met ${kapot.join(", ")}. Controleer de deploy of verwittig SteylVisuals.`
        : "De website reageert niet. Controleer de deploy of verwittig SteylVisuals.";

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm" role="status" aria-live="polite">
      <span className="status text-bone-400" style={{ "--status-kleur": kleur } as React.CSSProperties}>
        <span className={healthy || loading ? undefined : "text-bone-100"}>{tekst}</span>
      </span>
      <span className="flex items-center gap-4 text-bone-600">
        {checkedAt && (
          <span className="tabular">
            Gecontroleerd om {checkedAt.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="text-bone-400 underline-offset-4 hover:text-lime-300 hover:underline"
        >
          Opnieuw controleren
        </button>
      </span>
    </div>
  );
}
