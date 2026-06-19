export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function DashboardPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });

  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const [pandenRes, leadsRes, openBezoeken, opvolgingVandaag] = await Promise.all([
    payload.count({ collection: "panden", where: { status: { equals: "beschikbaar" } } }),
    payload.count({ collection: "leads", where: { status: { in: ["nieuw", "gecontacteerd"] } } }),
    payload.count({ collection: "leads", where: { status: { equals: "bezoek_gepland" } } }),
    payload.count({
      collection: "leads",
      where: {
        opvolging: {
          less_than_equal: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
          greater_than_equal: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        },
      },
    }),
  ]);

  const stats = [
    { label: "Actieve panden", value: pandenRes.totalDocs, href: "/admin/collections/panden", color: "#3b82f6" },
    { label: "Open leads", value: leadsRes.totalDocs, href: "/admin/collections/leads", color: "#f59e0b" },
    { label: "Bezoeken gepland", value: openBezoeken.totalDocs, href: "/admin/collections/leads?where[status][equals]=bezoek_gepland", color: "#8b5cf6" },
    { label: "Opvolging vandaag", value: opvolgingVandaag.totalDocs, href: "/admin/collections/leads", color: "#22c55e" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#fff", display: "flex", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ width: "220px", background: "#111", borderRight: "1px solid #222", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem", flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1.5rem", color: "#fff", padding: "0 0.75rem" }}>
          🏠 Vastgoed CMS
        </div>
        <SideLabel>Vastgoed</SideLabel>
        <NavLink href="/admin/collections/panden">Panden</NavLink>
        <SideLabel>CRM</SideLabel>
        <NavLink href="/admin/collections/leads">Leads</NavLink>
        <SideLabel>Instellingen</SideLabel>
        <NavLink href="/admin/collections/media">Media</NavLink>
        <NavLink href="/admin/collections/gebruikers">Gebruikers</NavLink>
        <NavLink href="/admin/globals/instellingen">Kantoor instellingen</NavLink>
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #222" }}>
          <NavLink href="/admin">Admin panel</NavLink>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Dashboard</h1>
        <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: "2rem" }}>
          Welkom terug, {(user as any).naam || user.email}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} style={{ display: "block", background: "#1a1a1a", borderRadius: "0.625rem", padding: "1.25rem 1.5rem", textDecoration: "none", borderLeft: `4px solid ${stat.color}` }}>
              <div style={{ fontSize: "2.25rem", fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.4rem" }}>{stat.label}</div>
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ background: "#1a1a1a", borderRadius: "0.625rem", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem" }}>Snelle acties</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "➕ Nieuw pand toevoegen", href: "/admin/collections/panden/create" },
                { label: "👤 Nieuwe lead toevoegen", href: "/admin/collections/leads/create" },
                { label: "🏠 Alle panden bekijken", href: "/admin/collections/panden" },
                { label: "📋 Alle leads bekijken", href: "/admin/collections/leads" },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ display: "block", padding: "0.6rem 0.875rem", borderRadius: "0.375rem", background: "#252525", color: "#e0e0e0", textDecoration: "none", fontSize: "0.875rem" }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ background: "#1a1a1a", borderRadius: "0.625rem", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem" }}>Lead pipeline</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "🆕 Nieuw", status: "nieuw", color: "#3b82f6" },
                { label: "📞 Gecontacteerd", status: "gecontacteerd", color: "#f59e0b" },
                { label: "📅 Bezoek gepland", status: "bezoek_gepland", color: "#8b5cf6" },
                { label: "💬 Onderhandeling", status: "onderhandeling", color: "#ec4899" },
                { label: "✅ Afgerond", status: "afgerond", color: "#22c55e" },
              ].map((item) => (
                <Link key={item.status} href={`/admin/collections/leads?where[status][equals]=${item.status}`} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.875rem", borderRadius: "0.375rem", background: "#252525", color: "#e0e0e0", textDecoration: "none", fontSize: "0.875rem" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SideLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", margin: "1rem 0 0.25rem", padding: "0 0.75rem" }}>{children}</div>;
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ display: "block", padding: "0.4rem 0.75rem", borderRadius: "0.375rem", color: "#ccc", textDecoration: "none", fontSize: "0.875rem" }}>
      {children}
    </Link>
  );
}
