import Link from "next/link";

const LIME = "#dffd7b";
const DARK = "#1e1e21";
const S1 = "#27272a";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.4)";
const TEXT = "#f0f0f0";

const NAV = [
  {
    label: "Recruitment",
    items: [
      { href: "/dashboard", icon: "▦", label: "Dashboard" },
      { href: "/dashboard/vacatures", icon: "📋", label: "Vacatures" },
      { href: "/dashboard/kandidaten", icon: "👤", label: "Kandidaten" },
      { href: "/dashboard/pipeline", icon: "▣", label: "Pipeline" },
      { href: "/dashboard/sollicitaties", icon: "🔗", label: "Sollicitaties" },
      { href: "/dashboard/bedrijven", icon: "🏢", label: "Bedrijven" },
      { href: "/dashboard/activiteiten", icon: "📬", label: "Activiteiten" },
      { href: "/dashboard/agenda", icon: "📅", label: "Agenda" },
    ],
  },
  {
    label: "Inhoud",
    items: [
      { href: "/dashboard/team", icon: "👥", label: "Team" },
      { href: "/admin/collections/media", icon: "🖼", label: "Media" },
    ],
  },
  {
    label: "Instellingen",
    items: [
      { href: "/dashboard/gebruikers", icon: "🔑", label: "Gebruikers" },
      { href: "/admin/globals/instellingen", icon: "⚙️", label: "Instellingen" },
    ],
  },
];

export default function DashboardShell({
  children,
  activePath,
  userName,
}: {
  children: React.ReactNode;
  activePath: string;
  userName?: string;
}) {
  return (
    <div className="dashboard-shell" style={{ minHeight: "100vh", background: DARK, color: TEXT, display: "flex", fontFamily: "'Avenir LT Std', 'Avenir', 'Century Gothic', 'Trebuchet MS', sans-serif" }}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ width: "240px", background: S1, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        {/* Logo */}
        <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <svg width="22" height="22" viewBox="0 0 26.3 24.4" xmlns="http://www.w3.org/2000/svg">
            <path fill="none" stroke={LIME} strokeWidth="1.5" d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
            <path fill="none" stroke={LIME} strokeWidth="1.5" d="M1.2,16.4c1,2.4,2.6,4.4,4.8,5.8,2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4c-1.4-.9-2.5-2.3-3.2-3.9l-4,1.7Z"/>
          </svg>
          <span style={{ color: TEXT, fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Specified</span>
        </div>

        <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
          {NAV.map((section) => (
            <div key={section.label} style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: "0.375rem", padding: "0 0.5rem" }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const active = activePath === item.href || (item.href !== "/dashboard" && activePath.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", color: active ? LIME : "#888", textDecoration: "none", fontSize: "0.82rem", fontWeight: active ? 600 : 400, background: active ? "rgba(223,253,123,0.08)" : "transparent", borderLeft: active ? `2px solid ${LIME}` : "2px solid transparent", marginBottom: "0.1rem", transition: "all 0.15s" }}>
                    <span style={{ width: "1rem", textAlign: "center", fontSize: "0.8rem" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: "1rem 0.75rem", borderTop: `1px solid ${BORDER}` }}>
          {userName && (
            <div style={{ fontSize: "0.72rem", color: "#555", padding: "0 0.5rem", marginBottom: "0.5rem" }}>
              Ingelogd als <span style={{ color: "#888" }}>{userName}</span>
            </div>
          )}
          <a href="/admin" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.625rem", borderRadius: "0.375rem", color: MUTED, textDecoration: "none", fontSize: "0.8rem" }}>
            <span>⚡</span> Admin panel
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main" style={{ flex: 1, overflowY: "auto", maxWidth: "calc(100vw - 240px)" }}>
        {children}
      </main>
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2rem 2.5rem 1.5rem", borderBottom: `1px solid ${BORDER}` }}>
      <div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 400, margin: "0 0 0.2rem", color: TEXT, fontFamily: "'Bebas Neue', 'Avenir LT Std', sans-serif", letterSpacing: "0.04em", lineHeight: 1 }}>{title}</h1>
        {subtitle && <p style={{ color: MUTED, fontSize: "0.8rem", margin: 0 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: "0.625rem" }}>{actions}</div>}
    </div>
  );
}

export function LimeBtn({ href, children, outline }: { href: string; children: React.ReactNode; outline?: boolean }) {
  return (
    <Link href={href} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "4px", background: outline ? "transparent" : LIME, color: outline ? TEXT : "#1e1e21", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, border: `1px solid ${outline ? BORDER : LIME}`, whiteSpace: "nowrap" }}>
      {children}
    </Link>
  );
}

export function Table({ headers: ths, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {ths.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "0.75rem 1.25rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: LIME, borderBottom: `1px solid ${BORDER}`, background: "#222225", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TD({ children, muted, bold }: { children: React.ReactNode; muted?: boolean; bold?: boolean }) {
  return (
    <td style={{ padding: "0.85rem 1.25rem", fontSize: "0.82rem", color: muted ? MUTED : bold ? TEXT : "#94949a", borderBottom: `1px solid rgba(255,255,255,0.05)`, verticalAlign: "middle" }}>
      {children}
    </td>
  );
}

export function StatusBadge({ label, kleur }: { label: string; kleur: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.6rem", borderRadius: "3px", background: `${kleur}18`, color: kleur, border: `1px solid ${kleur}40`, fontSize: "0.72rem", fontWeight: 600 }}>
      {label}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#555", fontSize: "0.85rem" }}>{children}</div>;
}

export const GoldBtn = LimeBtn;

export function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" });
}
export function fmtDateTime(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
