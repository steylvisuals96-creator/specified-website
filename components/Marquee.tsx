"use client";

const FALLBACK_ITEMS = [
  "Civiele techniek",
  "Elektrotechniek",
  "Werktuigbouwkunde",
  "Bouw & Infrastructuur",
  "Energie & Utilities",
  "IT & Software",
  "Industrie & Productie",
  "Projectmanagement",
];

export default function Marquee({ items }: { items?: string[] }) {
  const list = items && items.length > 0 ? items : FALLBACK_ITEMS;
  const track = [...list, ...list];

  return (
    <div
      aria-hidden="true"
      style={{
        overflow: "hidden",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "0.9rem 0",
        background: "rgba(223,253,123,0.02)",
      }}
    >
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-track">
        {track.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "1.5rem",
              padding: "0 2rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: i % 2 === 0 ? "rgba(255,255,255,0.35)" : "var(--lime)",
              whiteSpace: "nowrap",
            }}
          >
            {item}
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(223,253,123,0.3)", display: "inline-block" }} />
          </span>
        ))}
      </div>
    </div>
  );
}
