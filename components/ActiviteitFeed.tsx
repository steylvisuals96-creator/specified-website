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

function googleCalendarUrl(item: ActiviteitItem) {
  const start = new Date(item.datum);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.onderwerp)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(item.inhoud ?? "")}`;
}

function outlookUrl(item: ActiviteitItem) {
  const start = new Date(item.datum);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(item.onderwerp)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(item.inhoud ?? "")}`;
}

function replyHref(item: ActiviteitItem, bccEmail?: string) {
  const to = item.van ?? "";
  const subject = encodeURIComponent(`Re: ${item.onderwerp}`);
  const body = encodeURIComponent(`\n\n---\nOp ${fmtDt(item.datum)} schreef ${item.van}:\n\n${item.inhoud ?? ""}`);
  const bcc = bccEmail ? `&bcc=${encodeURIComponent(bccEmail)}` : "";
  return `mailto:${to}?subject=${subject}${bcc}&body=${body}`;
}

function ActiviteitCard({ item, showRelaties, bccEmail }: { item: ActiviteitItem; showRelaties?: boolean; bccEmail?: string }) {
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
          {item.type === "meeting" && (
            <div style={{ display: "flex", gap: "0.3rem" }}>
              <a href={googleCalendarUrl(item)} target="_blank" rel="noopener noreferrer" title="Toevoegen aan Google Calendar" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.28rem 0.55rem", borderRadius: "3px", fontSize: "0.7rem", fontWeight: 600, color: "#4285f4", background: "rgba(66,133,244,0.1)", border: "1px solid rgba(66,133,244,0.25)", textDecoration: "none", whiteSpace: "nowrap" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#4285f4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </a>
              <a href={outlookUrl(item)} target="_blank" rel="noopener noreferrer" title="Toevoegen aan Outlook" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.28rem 0.55rem", borderRadius: "3px", fontSize: "0.7rem", fontWeight: 600, color: "#0078d4", background: "rgba(0,120,212,0.1)", border: "1px solid rgba(0,120,212,0.25)", textDecoration: "none", whiteSpace: "nowrap" }}>
                Outlook
              </a>
              <a href={`/api/agenda/ics/${item.id}`} title=".ics downloaden" style={{ display: "inline-flex", alignItems: "center", padding: "0.28rem 0.5rem", borderRadius: "3px", fontSize: "0.7rem", fontWeight: 600, color: "#888", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
                ↓ .ics
              </a>
            </div>
          )}
          {isEmail && item.van && item.richting === "inkomend" && (
            <a
              href={replyHref(item, bccEmail)}
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
            href={replyHref(item, bccEmail)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.9rem", borderRadius: "3px", fontSize: "0.78rem", fontWeight: 600, color: "#1e1e21", background: LIME, textDecoration: "none" }}
          >
            ↩ Beantwoorden in Gmail / Outlook
          </a>
        </div>
      )}
    </div>
  );
}

export function ActiviteitFeed({ items, showRelaties, bccEmail }: { items: ActiviteitItem[]; showRelaties?: boolean; bccEmail?: string }) {
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
              <ActiviteitCard item={item} showRelaties={showRelaties} bccEmail={bccEmail} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
