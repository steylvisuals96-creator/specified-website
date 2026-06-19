export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const configPromise = import("@payload-config").then((m) => m.default);

const GOLD = "#facb04";
const DARK = "#0d0d0d";
const SURFACE = "#161616";
const SURFACE2 = "#1e1e1e";
const BORDER = "#2a2a2a";
const MUTED = "#888";

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
    { label: "Actieve panden", value: pandenRes.totalDocs, href: "/admin/collections/panden" },
    { label: "Open leads", value: leadsRes.totalDocs, href: "/admin/collections/leads" },
    { label: "Bezoeken gepland", value: openBezoeken.totalDocs, href: "/admin/collections/leads?where[status][equals]=bezoek_gepland" },
    { label: "Opvolging vandaag", value: opvolgingVandaag.totalDocs, href: "/admin/collections/leads" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: "#fff", display: "flex", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "230px", background: "#0a0a0a", borderRight: `1px solid ${BORDER}`, padding: "0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "1.5rem 1.25rem 1.25rem", borderBottom: `1px solid ${BORDER}` }}>
          <Image src="/som-logo.svg" alt="SOM Vastgoed" width={110} height={64} style={{ objectFit: "contain", display: "block" }} />
        </div>

        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          <SideLabel>Vastgoed</SideLabel>
          <NavLink href="/admin/collections/panden">Panden</NavLink>
          <SideLabel>CRM</SideLabel>
          <NavLink href="/admin/collections/leads">Leads</NavLink>
          <SideLabel>Instellingen</SideLabel>
          <NavLink href="/admin/collections/media">Media</NavLink>
          <NavLink href="/admin/collections/gebruikers">Gebruikers</NavLink>
          <NavLink href="/admin/globals/instellingen">Kantoor instellingen</NavLink>
        </nav>

        <div style={{ padding: "1rem 0.75rem", borderTop: `1px solid ${BORDER}` }}>
          <NavLink href="/admin">Admin panel →</NavLink>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "2.5rem 3rem", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <div style={{ width: "3px", height: "1.5rem", background: GOLD, borderRadius: "2px" }} />
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Dashboard</h1>
          </div>
          <p style={{ color: MUTED, fontSize: "0.875rem", marginLeft: "calc(3px + 0.75rem)" }}>
            Welkom terug, {(user as any).naam || user.email}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} style={{ display: "block", background: SURFACE, borderRadius: "0.5rem", padding: "1.5rem", textDecoration: "none", border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, transition: "border-color 0.15s" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 700, color: GOLD, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{stat.value}</div>
              <div style={{ fontSize: "0.8rem", color: MUTED, marginTop: "0.5rem", fontWeight: 500 }}>{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* Snelle acties */}
          <div style={{ background: SURFACE, borderRadius: "0.5rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: GOLD, marginBottom: "1rem", marginTop: 0 }}>Snelle acties</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "Nieuw pand toevoegen", href: "/admin/collections/panden/create" },
                { label: "Nieuwe lead toevoegen", href: "/admin/collections/leads/create" },
                { label: "Alle panden bekijken", href: "/admin/collections/panden" },
                { label: "Alle leads bekijken", href: "/admin/collections/leads" },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.875rem", borderRadius: "0.375rem", background: SURFACE2, color: "#e0e0e0", textDecoration: "none", fontSize: "0.875rem", border: `1px solid ${BORDER}` }}>
                  {link.label}
                  <span style={{ color: GOLD, fontSize: "0.75rem" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Lead pipeline */}
          <div style={{ background: SURFACE, borderRadius: "0.5rem", padding: "1.5rem", border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: GOLD, marginBottom: "1rem", marginTop: 0 }}>Lead pipeline</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "Nieuw", status: "nieuw" },
                { label: "Gecontacteerd", status: "gecontacteerd" },
                { label: "Bezoek gepland", status: "bezoek_gepland" },
                { label: "Onderhandeling", status: "onderhandeling" },
                { label: "Afgerond", status: "afgerond" },
              ].map((item) => (
                <Link key={item.status} href={`/admin/collections/leads?where[status][equals]=${item.status}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.375rem", background: SURFACE2, color: "#e0e0e0", textDecoration: "none", fontSize: "0.875rem", border: `1px solid ${BORDER}` }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
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
  return (
    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", margin: "1rem 0 0.25rem", padding: "0 0.5rem" }}>
      {children}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ display: "block", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", color: "#aaa", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s" }}>
      {children}
    </Link>
  );
}
