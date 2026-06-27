"use client";

const LIME = "#dffd7b";
const MUTED = "rgba(255,255,255,0.4)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f0f0f0";

const TYPE_ICON: Record<string, string> = {
  email: "📧",
  telefoon: "📞",
  meeting: "📅",
  notitie: "📝",
};

const TYPE_KLEUR: Record<string, string> = {
  email: "#60a5fa",
  telefoon: "#34d399",
  meeting: "#f472b6",
  notitie: "#f59e0b",
};

function fmtDt(d: string) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export type ActiviteitItem = {
  id: string;
  type: string;
  richting?: string;
  datum: string;
  onderwerp: string;
  inhoud?: string;
  van?: string;
  naar?: string;
  kandidaat?: { id: string; naam?: string; voornaam?: string; achternaam?: string } | null;
  bedrijf?: { id: string; naam?: string } | null;
};

function kandidaatNaam(k: ActiviteitItem["kandidaat"]) {
  if (!k) return null;
  return k.naam || [k.voornaam, k.achternaam].filter(Boolean).join(" ") || k.id;
}

export function ActiviteitFeed({ items, showRelaties }: { items: ActiviteitItem[]; showRelaties?: boolean }) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#555", fontSize: "0.85rem" }}>
        Nog geen activiteiten geregistreerd.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {items.map((item, i) => {
        const kleur = TYPE_KLEUR[item.type] ?? LIME;
        const isLast = i === items.length - 1;
        return (
          <div key={item.id} style={{ display: "flex", gap: "1rem", position: "relative" }}>
            {/* Timeline line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "2rem", flexShrink: 0 }}>
              <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: `${kleur}18`, border: `1.5px solid ${kleur}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}>
                {TYPE_ICON[item.type] ?? "•"}
              </div>
              {!isLast && <div style={{ width: "1px", flex: 1, background: BORDER, minHeight: "1.5rem" }} />}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT }}>{item.onderwerp}</span>
                {item.richting && (
                  <span style={{ fontSize: "0.68rem", padding: "0.1rem 0.4rem", borderRadius: "2px", background: item.richting === "inkomend" ? "#60a5fa18" : "#34d39918", color: item.richting === "inkomend" ? "#60a5fa" : "#34d399", border: `1px solid ${item.richting === "inkomend" ? "#60a5fa40" : "#34d39940"}` }}>
                    {item.richting === "inkomend" ? "↓ inkomend" : "↑ uitgaand"}
                  </span>
                )}
                {showRelaties && item.kandidaat && (
                  <span style={{ fontSize: "0.72rem", color: LIME }}>👤 {kandidaatNaam(item.kandidaat)}</span>
                )}
                {showRelaties && item.bedrijf && (
                  <span style={{ fontSize: "0.72rem", color: "#fb923c" }}>🏢 {item.bedrijf.naam}</span>
                )}
              </div>
              <div style={{ fontSize: "0.73rem", color: "#666", marginBottom: "0.35rem" }}>
                {fmtDt(item.datum)}
                {item.van && <span> · Van: {item.van}</span>}
                {item.naar && <span> · Naar: {item.naar}</span>}
              </div>
              {item.inhoud && (
                <div style={{ fontSize: "0.78rem", color: MUTED, background: "rgba(255,255,255,0.03)", borderRadius: "4px", padding: "0.5rem 0.75rem", borderLeft: `2px solid ${kleur}40`, whiteSpace: "pre-wrap", lineHeight: 1.5, maxHeight: "4.5em", overflow: "hidden" }}>
                  {item.inhoud.trim().substring(0, 240)}{item.inhoud.length > 240 ? "…" : ""}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
