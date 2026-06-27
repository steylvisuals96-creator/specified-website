"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SectorBarChart, PipelinePieChart } from "./DashboardCharts";

const LIME = "#dffd7b";
const S2 = "#2d2d30";
const S3 = "#323236";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.45)";
const TEXT = "#ffffff";

const SECTOR_LABEL: Record<string, string> = {
  civiel: "Civiel", elektro: "Elektro", werktuig: "Werktuig",
  bouw: "Bouw", industrie: "Industrie", energie: "Energie",
  it: "IT", projectmanagement: "PM",
};

const STATUS_KLEUR: Record<string, string> = {
  nieuw: "#60a5fa", gescreend: LIME, in_gesprek: "#a78bfa",
  voorgesteld: "#fb923c", interview_klant: "#f472b6",
  geplaatst: "#34d399", afgewezen: "#6b7280", on_hold: "#facc15",
};

const STATUS_LABEL: Record<string, string> = {
  nieuw: "Nieuw", gescreend: "Gescreend", in_gesprek: "In gesprek",
  voorgesteld: "Voorgesteld", interview_klant: "Interview",
  geplaatst: "Geplaatst", afgewezen: "Afgewezen", on_hold: "On hold",
};

const PIPELINE_LABEL: Record<string, string> = {
  nieuw: "Nieuw", screening: "Screening", tel_gescreend: "Gescreend",
  voorgesteld: "Voorgesteld", interview_gepland: "Interview",
  interview_afgerond: "Afgerond", aanbod: "Aanbod", geplaatst: "Geplaatst",
};

type Widget = {
  id: string;
  label: string;
  description: string;
};

const ALLE_WIDGETS: Widget[] = [
  { id: "kpi_vacatures",     label: "KPI: Vacatures",        description: "Actieve, ingevulde en totale vacatures" },
  { id: "kpi_kandidaten",    label: "KPI: Kandidaten",       description: "Totaal, nieuw en geplaatste kandidaten" },
  { id: "kpi_plaatsing",     label: "KPI: Plaatsingsratio",  description: "% kandidaten succesvol geplaatst" },
  { id: "kpi_pipeline",      label: "KPI: Open pipeline",    description: "Aantal lopende sollicitaties" },
  { id: "kpi_klanten",       label: "KPI: Actieve klanten",  description: "Aantal actieve bedrijven" },
  { id: "chart_sector",      label: "Chart: Sectoren",       description: "Bar chart kandidaten per sector" },
  { id: "chart_pipeline",    label: "Chart: Pipeline",       description: "Pie chart verdeling per fase" },
  { id: "progress_ratio",    label: "Plaatsingsratio balk",  description: "Visuele voortgangsbalk" },
  { id: "feed_kandidaten",   label: "Feed: Kandidaten",      description: "Recentste kandidaten" },
  { id: "feed_sollicitaties",label: "Feed: Sollicitaties",   description: "Recentste sollicitaties" },
];

const DEFAULT_ENABLED = ALLE_WIDGETS.map(w => w.id);

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short" });
}

export type DashboardData = {
  vacActief: number; vacTotaal: number; vacIngevuld: number;
  kanTotaal: number; kanGeplaatst: number; kanNieuw: number;
  solTotaal: number; solGeplaatst: number;
  bedrijvenActief: number;
  sectorData: { sector: string; count: number }[];
  pipelineData: { label: string; count: number }[];
  plaatsingsratio: number;
  recenteKandidaten: any[];
  recenteSollicitaties: any[];
  userName: string;
};

export default function DashboardCustomizable({ data }: { data: DashboardData }) {
  const [enabled, setEnabled] = useState<string[]>(DEFAULT_ENABLED);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard_widgets");
    if (saved) setEnabled(JSON.parse(saved));
    setMounted(true);
  }, []);

  function toggle(id: string) {
    setEnabled(prev => {
      const next = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      localStorage.setItem("dashboard_widgets", JSON.stringify(next));
      return next;
    });
  }

  const show = (id: string) => !mounted || enabled.includes(id);

  const openSoll = data.solTotaal - data.solGeplaatst;

  const kpiWidgets = [
    { id: "kpi_vacatures", label: "Actieve vacatures", value: data.vacActief, sub: `${data.vacIngevuld} ingevuld`, accent: true, href: "/dashboard/vacatures" },
    { id: "kpi_kandidaten", label: "Kandidaten", value: data.kanTotaal, sub: `${data.kanNieuw} nieuw`, href: "/dashboard/kandidaten" },
    { id: "kpi_plaatsing", label: "Plaatsingsratio", value: `${data.plaatsingsratio}%`, sub: `${data.kanGeplaatst} geplaatst`, href: "/dashboard/kandidaten" },
    { id: "kpi_pipeline", label: "Open pipeline", value: openSoll, sub: `${data.solGeplaatst} geplaatst`, href: "/dashboard/pipeline" },
    { id: "kpi_klanten", label: "Actieve klanten", value: data.bedrijvenActief, sub: "bedrijven", href: "/dashboard/bedrijven" },
  ].filter(w => show(w.id));

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1280 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem", color: TEXT }}>Dashboard</h1>
          <p style={{ color: MUTED, fontSize: "0.8rem", margin: 0 }}>Welkom terug, {data.userName}</p>
        </div>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <button
            onClick={() => setPanelOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: 4, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = LIME; (e.currentTarget as HTMLElement).style.color = LIME; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = MUTED; }}
          >
            ⚙ Aanpassen
          </button>
          <Link href="/admin/collections/vacatures/create" style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: 4, background: LIME, color: "#1e1e21", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
            + Vacature
          </Link>
          <Link href="/admin/collections/kandidaten/create" style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: 4, background: "transparent", color: TEXT, border: `1px solid ${BORDER}`, textDecoration: "none", fontSize: "0.8rem", fontWeight: 400 }}>
            + Kandidaat
          </Link>
        </div>
      </div>

      {/* KPI row */}
      {kpiWidgets.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${kpiWidgets.length}, 1fr)`, gap: "0.875rem", marginBottom: "1.5rem" }}>
          {kpiWidgets.map(w => (
            <Link key={w.id} href={w.href} style={{ display: "block", background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", textDecoration: "none", border: `1px solid ${BORDER}`, borderTop: w.accent ? `3px solid ${LIME}` : `1px solid ${BORDER}` }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: w.accent ? LIME : TEXT, lineHeight: 1 }}>{w.value}</div>
              <div style={{ fontSize: "0.72rem", color: TEXT, marginTop: "0.3rem", fontWeight: 600 }}>{w.label}</div>
              <div style={{ fontSize: "0.68rem", color: MUTED, marginTop: "0.15rem" }}>{w.sub}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Charts row */}
      {(show("chart_sector") || show("chart_pipeline")) && (
        <div style={{ display: "grid", gridTemplateColumns: show("chart_sector") && show("chart_pipeline") ? "1.4fr 1fr" : "1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          {show("chart_sector") && (
            <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
              <SectionLabel>Kandidaten per sector</SectionLabel>
              <SectorBarChart data={data.sectorData} />
            </div>
          )}
          {show("chart_pipeline") && (
            <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
              <SectionLabel>Pipeline verdeling</SectionLabel>
              <PipelinePieChart data={data.pipelineData} />
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {show("progress_ratio") && (
        <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", border: `1px solid ${BORDER}`, marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <SectionLabel style={{ margin: 0 }}>Plaatsingsratio</SectionLabel>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: LIME }}>{data.plaatsingsratio}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#1a1a1d", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${data.plaatsingsratio}%`, background: `linear-gradient(90deg, #34d399, ${LIME})`, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.72rem", color: MUTED }}>
            <span>{data.kanGeplaatst} geplaatst van {data.kanTotaal} kandidaten</span>
            <span>{data.vacIngevuld} van {data.vacTotaal} vacatures ingevuld</span>
          </div>
        </div>
      )}

      {/* Feeds */}
      {(show("feed_kandidaten") || show("feed_sollicitaties")) && (
        <div style={{ display: "grid", gridTemplateColumns: show("feed_kandidaten") && show("feed_sollicitaties") ? "1fr 1fr" : "1fr", gap: "1rem" }}>
          {show("feed_kandidaten") && (
            <FeedPanel title="Recente kandidaten" link="/dashboard/kandidaten" linkLabel="Alle kandidaten">
              {data.recenteKandidaten.length === 0
                ? <Empty>Nog geen kandidaten</Empty>
                : data.recenteKandidaten.map((k: any) => (
                  <Link key={k.id} href={`/admin/collections/kandidaten/${k.id}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_KLEUR[k.status] ?? MUTED, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>{k.naam}</span>
                      {k.sector && <span style={{ color: MUTED, fontSize: "0.72rem" }}>{SECTOR_LABEL[k.sector] ?? k.sector}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.62rem", padding: "0.15rem 0.45rem", borderRadius: 3, background: `${STATUS_KLEUR[k.status] ?? MUTED}20`, color: STATUS_KLEUR[k.status] ?? MUTED, fontWeight: 600 }}>
                        {STATUS_LABEL[k.status] ?? k.status}
                      </span>
                      <span style={{ color: MUTED, fontSize: "0.7rem", whiteSpace: "nowrap" }}>{fmtDate(k.createdAt)}</span>
                    </div>
                  </Link>
                ))}
            </FeedPanel>
          )}
          {show("feed_sollicitaties") && (
            <FeedPanel title="Recente sollicitaties" link="/dashboard/sollicitaties" linkLabel="Alle sollicitaties">
              {data.recenteSollicitaties.length === 0
                ? <Empty>Nog geen sollicitaties</Empty>
                : data.recenteSollicitaties.map((s: any) => {
                  const kleur = STATUS_KLEUR[s.status] ?? MUTED;
                  return (
                    <Link key={s.id} href={`/admin/collections/sollicitaties/${s.id}`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${kleur}`, marginBottom: "0.375rem" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>{s.kandidaat?.naam ?? "—"}</div>
                        <div style={{ color: MUTED, fontSize: "0.7rem" }}>{s.vacature?.titel ?? "—"}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.62rem", padding: "0.15rem 0.45rem", borderRadius: 3, background: `${kleur}20`, color: kleur, fontWeight: 600 }}>
                          {PIPELINE_LABEL[s.status] ?? s.status}
                        </span>
                        <span style={{ color: MUTED, fontSize: "0.7rem", whiteSpace: "nowrap" }}>{fmtDate(s.updatedAt)}</span>
                      </div>
                    </Link>
                  );
                })}
            </FeedPanel>
          )}
        </div>
      )}

      {/* Customizer panel */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setPanelOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />

          {/* Slide-in panel */}
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 340, background: "#222225", borderLeft: `1px solid ${BORDER}`, zIndex: 50, display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ padding: "1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Dashboard aanpassen</div>
                <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: "0.2rem" }}>Kies welke widgets zichtbaar zijn</div>
              </div>
              <button onClick={() => setPanelOpen(false)} style={{ background: "none", border: "none", color: MUTED, fontSize: "1.25rem", cursor: "pointer", padding: "0.25rem 0.5rem" }}>×</button>
            </div>

            <div style={{ padding: "1rem 1.5rem", flex: 1 }}>
              {/* Group: KPIs */}
              <GroupLabel>KPI Kaarten</GroupLabel>
              {ALLE_WIDGETS.filter(w => w.id.startsWith("kpi")).map(w => (
                <ToggleRow key={w.id} widget={w} enabled={enabled.includes(w.id)} onToggle={() => toggle(w.id)} />
              ))}

              <GroupLabel style={{ marginTop: "1.5rem" }}>Grafieken</GroupLabel>
              {ALLE_WIDGETS.filter(w => w.id.startsWith("chart") || w.id === "progress_ratio").map(w => (
                <ToggleRow key={w.id} widget={w} enabled={enabled.includes(w.id)} onToggle={() => toggle(w.id)} />
              ))}

              <GroupLabel style={{ marginTop: "1.5rem" }}>Activiteiten feeds</GroupLabel>
              {ALLE_WIDGETS.filter(w => w.id.startsWith("feed")).map(w => (
                <ToggleRow key={w.id} widget={w} enabled={enabled.includes(w.id)} onToggle={() => toggle(w.id)} />
              ))}
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => { setEnabled(DEFAULT_ENABLED); localStorage.setItem("dashboard_widgets", JSON.stringify(DEFAULT_ENABLED)); }}
                style={{ flex: 1, padding: "0.6rem", borderRadius: 4, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Alles tonen
              </button>
              <button
                onClick={() => setPanelOpen(false)}
                style={{ flex: 1, padding: "0.6rem", borderRadius: 4, background: LIME, color: "#1e1e21", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
              >
                Opslaan
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ToggleRow({ widget, enabled, onToggle }: { widget: Widget; enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}
    >
      <div>
        <div style={{ fontSize: "0.82rem", fontWeight: 500, color: enabled ? TEXT : MUTED }}>{widget.label}</div>
        <div style={{ fontSize: "0.7rem", color: MUTED, marginTop: "0.1rem" }}>{widget.description}</div>
      </div>
      {/* Toggle switch */}
      <div style={{ width: 36, height: 20, borderRadius: 10, background: enabled ? LIME : "#3a3a3e", position: "relative", flexShrink: 0, transition: "background 0.2s", marginLeft: "1rem" }}>
        <div style={{ position: "absolute", top: 2, left: enabled ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: enabled ? "#1e1e21" : "#666", transition: "left 0.2s" }} />
      </div>
    </div>
  );
}

function GroupLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: LIME, marginBottom: "0.25rem", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTED, marginBottom: "1rem", ...style }}>
      {children}
    </div>
  );
}

function FeedPanel({ title, link, linkLabel, children }: { title: string; link: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTED }}>{title}</div>
        <Link href={link} style={{ fontSize: "0.72rem", color: LIME, textDecoration: "none" }}>{linkLabel}</Link>
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "2rem 1rem", color: MUTED, fontSize: "0.8rem" }}>{children}</div>;
}
