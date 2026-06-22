export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const configPromise = import("@payload-config").then((m) => m.default);

const G = "#facb04";
const DARK = "#0d0d0d";
const S1 = "#111111";
const S2 = "#161616";
const S3 = "#1e1e1e";
const BORDER = "#252525";
const MUTED = "#666";
const TEXT = "#e8e8e8";

function fmt(n: number) {
  return new Intl.NumberFormat("nl-BE").format(n);
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function fmtDateShort(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });
  if (!user) redirect("/admin/login");

  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay() + 1); startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999);
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);

  const [
    pandenBeschikbaar, pandenTotaal, pandenVerkocht,
    leadsNieuw, leadsTotaal, leadsNieuw30d,
    afsprakenVandaag, afsprakenWeek,
    recenteLeads, komendeAfspraken,
    nieuwsPosts, teamleden,
  ] = await Promise.all([
    payload.count({ collection: "panden", where: { status: { equals: "beschikbaar" } } }),
    payload.count({ collection: "panden" }),
    payload.count({ collection: "panden", where: { status: { in: ["verkocht", "verhuurd"] } } }),
    payload.count({ collection: "leads", where: { status: { equals: "nieuw" } } }),
    payload.count({ collection: "leads" }),
    payload.count({ collection: "leads", where: { createdAt: { greater_than: thirtyDaysAgo.toISOString() } } }),
    payload.count({ collection: "afspraken", where: { datum: { greater_than_equal: startOfDay.toISOString(), less_than_equal: endOfDay.toISOString() } } }),
    payload.count({ collection: "afspraken", where: { datum: { greater_than_equal: startOfWeek.toISOString(), less_than_equal: endOfWeek.toISOString() } } }),
    payload.find({ collection: "leads", limit: 6, sort: "-createdAt" }),
    payload.find({ collection: "afspraken", limit: 5, sort: "datum", where: { datum: { greater_than_equal: now.toISOString() }, status: { not_equals: "geannuleerd" } } }),
    payload.count({ collection: "nieuws" }),
    payload.count({ collection: "team" }),
  ]);

  const bronKleuren: Record<string, string> = {
    nieuw: G,
    gecontacteerd: "#60a5fa",
    bezoek_gepland: "#a78bfa",
    onderhandeling: "#f472b6",
    afgerond: "#34d399",
    niet_geinteresseerd: "#6b7280",
  };

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── Sidebar ─── */}
      <aside style={{ width: "240px", background: S1, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: `1px solid ${BORDER}` }}>
          <Image src="/som-logo.svg" alt="SOM Vastgoed" width={100} height={58} style={{ objectFit: "contain", display: "block" }} />
        </div>

        <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
          <NavSection label="Vastgoed">
            <NavItem href="/dashboard" icon="▦" active>Dashboard</NavItem>
            <NavItem href="/dashboard/panden" icon="🏠">Panden</NavItem>
            <NavItem href="/dashboard/afspraken" icon="📅">Afspraken</NavItem>
          </NavSection>
          <NavSection label="CRM">
            <NavItem href="/dashboard/leads" icon="👤">Leads</NavItem>
          </NavSection>
          <NavSection label="Inhoud">
            <NavItem href="/admin/collections/paginas" icon="📄">Pagina's</NavItem>
            <NavItem href="/admin/collections/nieuws" icon="📰">Nieuws</NavItem>
            <NavItem href="/admin/collections/team" icon="👥">Team</NavItem>
            <NavItem href="/admin/collections/testimonials" icon="⭐">Getuigenissen</NavItem>
            <NavItem href="/admin/collections/faq" icon="❓">FAQ</NavItem>
          </NavSection>
          <NavSection label="Instellingen">
            <NavItem href="/admin/collections/media" icon="🖼">Media</NavItem>
            <NavItem href="/admin/collections/gebruikers" icon="🔑">Gebruikers</NavItem>
            <NavItem href="/admin/globals/instellingen" icon="⚙️">Instellingen</NavItem>
          </NavSection>
        </nav>

        <div style={{ padding: "1rem 0.75rem", borderTop: `1px solid ${BORDER}` }}>
          <a href="/admin" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.625rem", borderRadius: "0.375rem", color: MUTED, textDecoration: "none", fontSize: "0.8rem" }}>
            <span>⚡</span> Admin panel
          </a>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto", maxWidth: "calc(100vw - 240px)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.2rem" }}>Dashboard</h1>
            <p style={{ color: MUTED, fontSize: "0.8rem", margin: 0 }}>Welkom terug, {(user as any).naam || user.email}</p>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <QuickBtn href="/admin/collections/panden/create" gold>+ Pand</QuickBtn>
            <QuickBtn href="/admin/collections/leads/create">+ Lead</QuickBtn>
            <QuickBtn href="/admin/collections/afspraken/create">+ Afspraak</QuickBtn>
          </div>
        </div>

        {/* Stat cards rij 1 — Panden */}
        <SectionTitle>Panden</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "1.5rem" }}>
          <StatCard label="Beschikbaar" value={pandenBeschikbaar.totalDocs} href="/dashboard/panden?where[status][equals]=beschikbaar" accent />
          <StatCard label="Totaal panden" value={pandenTotaal.totalDocs} href="/dashboard/panden" />
          <StatCard label="Verkocht / Verhuurd" value={pandenVerkocht.totalDocs} href="/dashboard/panden" />
        </div>

        {/* Stat cards rij 2 — Leads & Afspraken */}
        <SectionTitle>CRM</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.875rem", marginBottom: "2rem" }}>
          <StatCard label="Nieuwe leads" value={leadsNieuw.totalDocs} href="/dashboard/leads?where[status][equals]=nieuw" accent />
          <StatCard label="Leads (30 dagen)" value={leadsNieuw30d.totalDocs} href="/dashboard/leads" />
          <StatCard label="Totaal leads" value={leadsTotaal.totalDocs} href="/dashboard/leads" />
          <StatCard label="Afspraken vandaag" value={afsprakenVandaag.totalDocs} href="/dashboard/afspraken" accent={afsprakenVandaag.totalDocs > 0} />
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>

          {/* Recente leads */}
          <Panel title="Recente leads" link="/dashboard/leads" linkLabel="Alle leads →">
            {recenteLeads.docs.length === 0 ? (
              <Empty>Nog geen leads</Empty>
            ) : recenteLeads.docs.map((lead: any) => (
              <Link key={lead.id} href={`/dashboard/leads/${lead.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: bronKleuren[lead.status] || MUTED, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{lead.naam}</span>
                  {lead.email && <span style={{ color: MUTED }}>{lead.email}</span>}
                </div>
                <span style={{ color: MUTED, fontSize: "0.72rem", whiteSpace: "nowrap" }}>{fmtDateShort(lead.createdAt)}</span>
              </Link>
            ))}
          </Panel>

          {/* Komende afspraken */}
          <Panel title="Komende afspraken" link="/dashboard/afspraken" linkLabel="Alle afspraken →">
            {komendeAfspraken.docs.length === 0 ? (
              <Empty>Geen geplande afspraken</Empty>
            ) : komendeAfspraken.docs.map((a: any) => (
              <Link key={a.id} href={`/dashboard/afspraken/${a.id}`} style={{ display: "block", padding: "0.625rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem", borderLeft: `3px solid ${G}` }}>
                <div style={{ fontWeight: 600, marginBottom: "0.125rem" }}>{a.titel}</div>
                <div style={{ color: MUTED, fontSize: "0.72rem" }}>{fmtDate(a.datum)} · {a.type}</div>
              </Link>
            ))}
          </Panel>
        </div>

        {/* Content & snelle acties */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

          {/* Content overzicht */}
          <Panel title="Inhoud" link="/admin" linkLabel="Admin →">
            {[
              { label: "Pagina's", count: null, href: "/admin/collections/paginas", icon: "📄" },
              { label: "Nieuwsberichten", count: nieuwsPosts.totalDocs, href: "/admin/collections/nieuws", icon: "📰" },
              { label: "Teamleden", count: teamleden.totalDocs, href: "/admin/collections/team", icon: "👥" },
              { label: "Getuigenissen", count: null, href: "/admin/collections/testimonials", icon: "⭐" },
              { label: "FAQ vragen", count: null, href: "/admin/collections/faq", icon: "❓" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem" }}>
                <span>{item.icon} {item.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: MUTED }}>
                  {item.count !== null && <span style={{ background: S2, padding: "0.1rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem" }}>{item.count}</span>}
                  <span style={{ color: G }}>→</span>
                </span>
              </Link>
            ))}
          </Panel>

          {/* Lead pipeline */}
          <Panel title="Lead pipeline" link="/dashboard/leads" linkLabel="Alle leads →">
            {[
              { label: "Nieuw", status: "nieuw", kleur: G },
              { label: "Gecontacteerd", status: "gecontacteerd", kleur: "#60a5fa" },
              { label: "Bezoek gepland", status: "bezoek_gepland", kleur: "#a78bfa" },
              { label: "Onderhandeling", status: "onderhandeling", kleur: "#f472b6" },
              { label: "Afgerond", status: "afgerond", kleur: "#34d399" },
            ].map((item) => (
              <Link key={item.status} href={`/dashboard/leads?where[status][equals]=${item.status}`} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem", borderLeft: `3px solid ${item.kleur}` }}>
                <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ color: G }}>→</span>
              </Link>
            ))}
          </Panel>
        </div>

      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, marginBottom: "0.625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ flex: 1, height: "1px", background: BORDER }} />
      {children}
      <span style={{ flex: 1, height: "1px", background: BORDER }} />
    </div>
  );
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <Link href={href} style={{ display: "block", background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", textDecoration: "none", border: `1px solid ${BORDER}`, borderTop: accent ? `3px solid ${G}` : `1px solid ${BORDER}`, transition: "border-color 0.15s" }}>
      <div style={{ fontSize: "2.25rem", fontWeight: 800, color: accent ? G : TEXT, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</div>
      <div style={{ fontSize: "0.75rem", color: MUTED, marginTop: "0.4rem", fontWeight: 500 }}>{label}</div>
    </Link>
  );
}

function Panel({ title, link, linkLabel, children }: { title: string; link: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: TEXT, margin: 0 }}>{title}</h2>
        <Link href={link} style={{ fontSize: "0.72rem", color: G, textDecoration: "none" }}>{linkLabel}</Link>
      </div>
      {children}
    </div>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: "0.375rem", padding: "0 0.5rem" }}>{label}</div>
      {children}
    </div>
  );
}

function NavItem({ href, icon, children, active }: { href: string; icon: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", color: active ? G : "#888", textDecoration: "none", fontSize: "0.82rem", fontWeight: active ? 600 : 400, background: active ? "rgba(250,203,4,0.08)" : "transparent" }}>
      <span style={{ width: "1rem", textAlign: "center", fontSize: "0.8rem" }}>{icon}</span>
      {children}
    </Link>
  );
}

function QuickBtn({ href, children, gold }: { href: string; children: React.ReactNode; gold?: boolean }) {
  return (
    <Link href={href} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: gold ? G : S3, color: gold ? "#111" : TEXT, textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, border: `1px solid ${gold ? G : BORDER}` }}>
      {children}
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "2rem 1rem", color: MUTED, fontSize: "0.8rem" }}>{children}</div>;
}
