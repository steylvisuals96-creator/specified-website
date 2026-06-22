import Link from "next/link";
import Image from "next/image";

const G = "#facb04";
const S1 = "#111111";
const BORDER = "#252525";
const MUTED = "#666";
const TEXT = "#e8e8e8";

const NAV = [
  {
    label: "Vastgoed",
    items: [
      { href: "/dashboard", icon: "▦", label: "Dashboard" },
      { href: "/dashboard/panden", icon: "🏠", label: "Panden" },
      { href: "/dashboard/afspraken", icon: "📅", label: "Afspraken" },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/dashboard/leads", icon: "👤", label: "Leads" },
      { href: "/dashboard/taken", icon: "✓", label: "Taken" },
    ],
  },
  {
    label: "Inhoud",
    items: [
      { href: "/dashboard/paginas", icon: "📄", label: "Pagina's" },
      { href: "/dashboard/nieuws", icon: "📰", label: "Nieuws" },
      { href: "/dashboard/team", icon: "👥", label: "Team" },
      { href: "/dashboard/getuigenissen", icon: "⭐", label: "Getuigenissen" },
      { href: "/dashboard/faq", icon: "❓", label: "FAQ" },
    ],
  },
  {
    label: "Instellingen",
    items: [
      { href: "/dashboard/media", icon: "🖼", label: "Media" },
      { href: "/dashboard/gebruikers", icon: "🔑", label: "Gebruikers" },
      { href: "/dashboard/instellingen", icon: "⚙️", label: "Instellingen" },
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
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: TEXT, display: "flex", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "240px", background: S1, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: `1px solid ${BORDER}` }}>
          <Image src="/som-logo.svg" alt="SOM Vastgoed" width={100} height={58} style={{ objectFit: "contain", display: "block" }} />
        </div>

        <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
          {NAV.map((section) => (
            <div key={section.label} style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: "0.375rem", padding: "0 0.5rem" }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const active = activePath === item.href || (item.href !== "/dashboard" && activePath.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", color: active ? G : "#888", textDecoration: "none", fontSize: "0.82rem", fontWeight: active ? 600 : 400, background: active ? "rgba(250,203,4,0.08)" : "transparent", borderLeft: active ? `2px solid ${G}` : "2px solid transparent", marginBottom: "0.1rem", transition: "all 0.15s" }}>
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
      <main style={{ flex: 1, overflowY: "auto", maxWidth: "calc(100vw - 240px)" }}>
        {children}
      </main>
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2rem 2.5rem 1.5rem", borderBottom: `1px solid ${BORDER}` }}>
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.2rem", color: TEXT }}>{title}</h1>
        {subtitle && <p style={{ color: MUTED, fontSize: "0.8rem", margin: 0 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: "0.625rem" }}>{actions}</div>}
    </div>
  );
}

export function GoldBtn({ href, children, outline }: { href: string; children: React.ReactNode; outline?: boolean }) {
  return (
    <Link href={href} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: outline ? "transparent" : G, color: outline ? TEXT : "#111", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, border: `1px solid ${outline ? BORDER : G}`, whiteSpace: "nowrap" }}>
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
              <th key={h} style={{ textAlign: "left", padding: "0.75rem 1.25rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: G, borderBottom: `1px solid ${BORDER}`, background: "#0f0f0f", whiteSpace: "nowrap" }}>
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

export function TR({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <tr style={{ cursor: "pointer" }}>
      {children}
    </tr>
  );
}

export function TD({ children, muted, bold }: { children: React.ReactNode; muted?: boolean; bold?: boolean }) {
  return (
    <td style={{ padding: "0.85rem 1.25rem", fontSize: "0.82rem", color: muted ? MUTED : bold ? TEXT : "#b0a898", borderBottom: `1px solid #141414`, verticalAlign: "middle" }}>
      {children}
    </td>
  );
}

export function StatusBadge({ label, kleur }: { label: string; kleur: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.2rem 0.6rem", borderRadius: "3px", background: `${kleur}18`, color: kleur, border: `1px solid ${kleur}40`, fontSize: "0.72rem", fontWeight: 600 }}>
      {label}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#444", fontSize: "0.85rem" }}>{children}</div>;
}

export function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" });
}
export function fmtDateTime(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
