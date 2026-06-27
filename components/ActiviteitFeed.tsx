"use client";

import { useState } from "react";

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
  return new Date(d).toLocaleDateString("nl-BE", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
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

function replyHref(item: ActiviteitItem) {
  // Reply goes to whoever sent it (the "van" address)
  const to = item.van ?? "";
  const subject = encodeURIComponent(`Re: ${item.onderwerp}`);
  const body = encodeURIComponent(`\n\n---\nOp ${fmtDt(item.datum)} schreef ${item.van}:\n\n${item.inhoud ?? ""}`);
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

function ActiviteitCard({ item, showRelaties }: { item: ActiviteitItem; showRelaties?: boolean }) {
  const [open, setOpen] = useState(false);
  const kleur = TYPE_KLEUR[item.type] ?? LIME;
  const isEmail = item.type === "email";
  const hasBody = !!item.inhoud;
  const isLong = (item.inhoud?.length ?? 0) > 200;

  return (
    <div
      style={{
        background: open ? "rgba(255,255,255,0.03)" : "transparent",
        borderRadius: "6px",
        border: `1px solid ${open ? BORDER : "transparent"}`,
        padding: open ? "0.75rem" : "0",
        cursor: hasBody ? "pointer" : "default",
        transition: "all 0.15s",
      }}
      onClick={() => hasBody && setOpen((v) => !v)}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 600, color: TEXT }}>{item.onderwerp}</span>
            {item.richting && (
              <span style={{ fontSize: "0.68rem", padding: "0.1rem 0.4rem", borderRadius: "2px", background: item.richting === "inkomend" ? "#60a5fa18" : "#34d39918", color: item.richting === "inkomend" ? "#60a5fa" : "#34d399", border: `1px solid ${item.richting === "inkomend" ? "#60a5fa40" : "#34d39940"}`, whiteSpace: "nowrap" }}>
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
          <div style={{ fontSize: "0.73rem", color: "#666" }}>
            {fmtDt(item.datum)}
            {item.van && <span> · Van: {item.van}</span>}
            {item.naar && <span> · Naar: {item.naar}</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {isEmail && item.van && item.richting === "inkomend" && (
            <a
              href={replyHref(item)}
              title="Beantwoorden in mailclient"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.28rem 0.6rem", borderRadius: "3px", fontSize: "0.72rem", fontWeight: 600, color: LIME, background: `${LIME}12`, border: `1px solid ${LIME}30`, textDecoration: "none", whiteSpace: "nowrap" }}
            >
              ↩ Beantwoorden
            </a>
          )}
          {hasBody && (
            <button
              onClick={() => setOpen((v) => !v)}
              style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "0.75rem", padding: "0.2rem 0.4rem", borderRadius: "3px" }}
              title={open ? "Inklappen" : "Uitklappen"}
            >
              {open ? "▲" : "▼"}
            </button>
          )}
        </div>
      </div>

      {/* Body preview when closed */}
      {!open && hasBody && (
        <div style={{ fontSize: "0.78rem", color: "#555", marginTop: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60ch" }}>
          {item.inhoud?.trim().replace(/\n/g, " ").substring(0, 120)}{(item.inhoud?.length ?? 0) > 120 ? "…" : ""}
        </div>
      )}

      {/* Full body when open */}
      {open && hasBody && (
        <div
          style={{ fontSize: "0.8rem", color: MUTED, background: "rgba(255,255,255,0.03)", borderRadius: "4px", padding: "0.75rem", borderLeft: `2px solid ${kleur}50`, whiteSpace: "pre-wrap", lineHeight: 1.65, marginTop: "0.75rem" }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.inhoud}
        </div>
      )}

      {/* Reply button at bottom when open */}
      {open && isEmail && item.van && item.richting === "inkomend" && (
        <div style={{ marginTop: "0.75rem" }} onClick={(e) => e.stopPropagation()}>
          <a
            href={replyHref(item)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.9rem", borderRadius: "3px", fontSize: "0.78rem", fontWeight: 600, color: "#1e1e21", background: LIME, textDecoration: "none" }}
          >
            ↩ Beantwoorden in Gmail / Outlook
          </a>
        </div>
      )}
    </div>
  );
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
            {/* Timeline spine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "2rem", flexShrink: 0 }}>
              <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: `${kleur}18`, border: `1.5px solid ${kleur}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0, marginTop: "0.1rem" }}>
                {TYPE_ICON[item.type] ?? "•"}
              </div>
              {!isLast && <div style={{ width: "1px", flex: 1, background: BORDER, minHeight: "1.5rem" }} />}
            </div>

            {/* Card */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : "1.25rem" }}>
              <ActiviteitCard item={item} showRelaties={showRelaties} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
