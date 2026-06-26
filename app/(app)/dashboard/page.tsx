export const dynamic = "force-dynamic";

import { getPayload } from "payload";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const DARK = "#1e1e21";
const S1 = "#27272a";
const S2 = "#2d2d30";
const S3 = "#323236";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.45)";
const TEXT = "#ffffff";

function fmt(n: number) {
  return new Intl.NumberFormat("nl-BE").format(n);
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

  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    vacaturesActief, vacaturesTotaal, vacaturesIngevuld,
    kandidatenNieuw, kandidatenTotaal, kandidatenGeplaatst,
    sollicitatiesNieuw, sollicitatiesVoorgesteld, sollicitatiesGeplaatst,
    bedrijvenActief, teamleden,
    recenteKandidaten, recenteSollicitaties,
  ] = await Promise.all([
    payload.count({ collection: "vacatures", where: { status: { equals: "actief" } } }),
    payload.count({ collection: "vacatures" }),
    payload.count({ collection: "vacatures", where: { status: { equals: "ingevuld" } } }),
    payload.count({ collection: "kandidaten", where: { status: { equals: "nieuw" } } }),
    payload.count({ collection: "kandidaten" }),
    payload.count({ collection: "kandidaten", where: { status: { equals: "geplaatst" } } }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "nieuw" } } }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "voorgesteld" } } }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "geplaatst" } } }),
    payload.count({ collection: "bedrijven", where: { relatiestatus: { equals: "actief" } } }),
    payload.count({ collection: "team" }),
    payload.find({ collection: "kandidaten", limit: 6, sort: "-createdAt" }),
    payload.find({ collection: "sollicitaties", limit: 5, sort: "-updatedAt" }),
  ]);

  const conversieRate = kandidatenTotaal.totalDocs > 0
    ? Math.round((kandidatenGeplaatst.totalDocs / kandidatenTotaal.totalDocs) * 100)
    : 0;

  const pipelineStappen = [
    { label: "Nieuw", count: kandidatenNieuw.totalDocs, kleur: LIME },
    { label: "Gescreend", count: 0, kleur: "#60a5fa" },
    { label: "Voorgesteld", count: sollicitatiesVoorgesteld.totalDocs, kleur: "#a78bfa" },
    { label: "Interview", count: 0, kleur: "#f472b6" },
    { label: "Geplaatst", count: kandidatenGeplaatst.totalDocs, kleur: "#34d399" },
  ];
  const maxCount = Math.max(...pipelineStappen.map(s => s.count), 1);

  const statusKleuren: Record<string, string> = {
    nieuw: LIME,
    gescreend: "#60a5fa",
    in_gesprek: "#a78bfa",
    voorgesteld: "#f472b6",
    geplaatst: "#34d399",
    afgewezen: "#6b7280",
    on_hold: "#f59e0b",
  };

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── Sidebar ─── */}
      <aside style={{ width: "240px", background: S1, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <svg width="22" height="22" viewBox="0 0 26.3 24.4" xmlns="http://www.w3.org/2000/svg">
            <path fill="none" stroke={LIME} strokeWidth="1.5" d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
            <path fill="none" stroke={LIME} strokeWidth="1.5" d="M1.2,16.4c1,2.4,2.6,4.4,4.8,5.8,2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4c-1.4-.9-2.5-2.3-3.2-3.9l-4,1.7Z"/>
          </svg>
          <span style={{ color: TEXT, fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Specified</span>
        </div>

        <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
          <NavSection label="Recruitment">
            <NavItem href="/dashboard" icon="▦" active>Dashboard</NavItem>
            <NavItem href="/admin/collections/vacatures" icon="📋">Vacatures</NavItem>
            <NavItem href="/admin/collections/kandidaten" icon="👤">Kandidaten</NavItem>
            <NavItem href="/admin/collections/sollicitaties" icon="🔗">Sollicitaties</NavItem>
            <NavItem href="/admin/collections/bedrijven" icon="🏢">Bedrijven</NavItem>
          </NavSection>
          <NavSection label="Inhoud">
            <NavItem href="/admin/collections/team" icon="👥">Team</NavItem>
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
            <QuickBtn href="/admin/collections/vacatures/create" lime>+ Vacature</QuickBtn>
            <QuickBtn href="/admin/collections/kandidaten/create">+ Kandidaat</QuickBtn>
            <QuickBtn href="/admin/collections/sollicitaties/create">+ Sollicitatie</QuickBtn>
          </div>
        </div>

        {/* Stat cards — Vacatures */}
        <SectionTitle>Vacatures</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "1.5rem" }}>
          <StatCard label="Actieve vacatures" value={vacaturesActief.totalDocs} href="/admin/collections/vacatures?where[status][equals]=actief" accent />
          <StatCard label="Totaal vacatures" value={vacaturesTotaal.totalDocs} href="/admin/collections/vacatures" />
          <StatCard label="Ingevuld" value={vacaturesIngevuld.totalDocs} href="/admin/collections/vacatures?where[status][equals]=ingevuld" />
        </div>

        {/* Stat cards — Kandidaten */}
        <SectionTitle>Kandidaten & Pipeline</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.875rem", marginBottom: "1rem" }}>
          <StatCard label="Nieuwe kandidaten" value={kandidatenNieuw.totalDocs} href="/admin/collections/kandidaten?where[status][equals]=nieuw" accent />
          <StatCard label="Totaal kandidaten" value={kandidatenTotaal.totalDocs} href="/admin/collections/kandidaten" />
          <StatCard label="Geplaatst" value={kandidatenGeplaatst.totalDocs} href="/admin/collections/kandidaten?where[status][equals]=geplaatst" />
          <StatCard label="Actieve klanten" value={bedrijvenActief.totalDocs} href="/admin/collections/bedrijven" />
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem", marginBottom: "2rem" }}>
          {/* Open sollicitaties */}
          <Link href="/admin/collections/sollicitaties" style={{ display: "block", background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", textDecoration: "none", border: `1px solid ${BORDER}`, borderTop: `3px solid ${LIME}` }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>Open sollicitaties</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: LIME, lineHeight: 1 }}>{sollicitatiesNieuw.totalDocs}</div>
            <div style={{ fontSize: "0.7rem", color: MUTED, marginTop: "0.4rem" }}>{sollicitatiesVoorgesteld.totalDocs} voorgesteld aan klant</div>
          </Link>
          {/* Conversieratio */}
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>Plaatsingsratio</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, lineHeight: 1 }}>{conversieRate}%</div>
              <div style={{ fontSize: "0.75rem", color: MUTED, paddingBottom: "0.2rem" }}>{kandidatenGeplaatst.totalDocs} geplaatst</div>
            </div>
            <div style={{ marginTop: "0.75rem", height: 6, borderRadius: 3, background: "#1a1a1d", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${conversieRate}%`, background: "#34d399", borderRadius: 3 }} />
            </div>
          </div>
          {/* Pipeline per fase */}
          <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: "0.875rem" }}>Pipeline per fase</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {pipelineStappen.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontSize: "0.65rem", color: MUTED, width: 70, flexShrink: 0 }}>{s.label}</div>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#1a1a1d", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.count / maxCount) * 100}%`, background: s.kleur, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: TEXT, fontWeight: 600, width: 20, textAlign: "right" }}>{s.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <Panel title="Recente kandidaten" link="/admin/collections/kandidaten" linkLabel="Alle kandidaten →">
            {recenteKandidaten.docs.length === 0 ? (
              <Empty>Nog geen kandidaten</Empty>
            ) : recenteKandidaten.docs.map((k: any) => (
              <Link key={k.id} href={`/admin/collections/kandidaten/${k.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: statusKleuren[k.status] || MUTED, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{k.naam}</span>
                  {k.functietitel && <span style={{ color: MUTED }}>{k.functietitel}</span>}
                </div>
                <span style={{ color: MUTED, fontSize: "0.72rem", whiteSpace: "nowrap" }}>{fmtDateShort(k.createdAt)}</span>
              </Link>
            ))}
          </Panel>

          <Panel title="Recente sollicitaties" link="/admin/collections/sollicitaties" linkLabel="Alle sollicitaties →">
            {recenteSollicitaties.docs.length === 0 ? (
              <Empty>Nog geen sollicitaties</Empty>
            ) : recenteSollicitaties.docs.map((s: any) => (
              <Link key={s.id} href={`/admin/collections/sollicitaties/${s.id}`} style={{ display: "block", padding: "0.625rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem", borderLeft: `3px solid ${statusKleuren[s.status] || MUTED}` }}>
                <div style={{ fontWeight: 600, marginBottom: "0.125rem" }}>{s.status}</div>
                <div style={{ color: MUTED, fontSize: "0.72rem" }}>{fmtDateShort(s.updatedAt)}</div>
              </Link>
            ))}
          </Panel>
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <Panel title="Snelle acties" link="/admin" linkLabel="Admin →">
            {[
              { label: "Nieuwe vacature aanmaken", href: "/admin/collections/vacatures/create", icon: "📋" },
              { label: "Kandidaat toevoegen", href: "/admin/collections/kandidaten/create", icon: "👤" },
              { label: "Bedrijf toevoegen", href: "/admin/collections/bedrijven/create", icon: "🏢" },
              { label: "Team beheren", href: "/admin/collections/team", icon: "👥" },
              { label: "Media uploaden", href: "/admin/collections/media/create", icon: "🖼" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem" }}>
                <span>{item.icon} {item.label}</span>
                <span style={{ color: LIME }}>→</span>
              </Link>
            ))}
          </Panel>

          <Panel title="Statistieken" link="/admin/collections/kandidaten" linkLabel="Alle kandidaten →">
            {[
              { label: "Teamleden", count: teamleden.totalDocs, href: "/admin/collections/team", icon: "👥" },
              { label: "Actieve vacatures", count: vacaturesActief.totalDocs, href: "/admin/collections/vacatures", icon: "📋" },
              { label: "Kandidaten in pipeline", count: kandidatenTotaal.totalDocs, href: "/admin/collections/kandidaten", icon: "👤" },
              { label: "Geplaatste profielen", count: kandidatenGeplaatst.totalDocs, href: "/admin/collections/kandidaten?where[status][equals]=geplaatst", icon: "✅" },
              { label: "Actieve klanten", count: bedrijvenActief.totalDocs, href: "/admin/collections/bedrijven", icon: "🏢" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", background: S3, textDecoration: "none", color: TEXT, fontSize: "0.8rem", border: `1px solid ${BORDER}`, marginBottom: "0.375rem" }}>
                <span>{item.icon} {item.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: MUTED }}>
                  <span style={{ background: S2, padding: "0.1rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", color: LIME, fontWeight: 700 }}>{item.count}</span>
                  <span style={{ color: LIME }}>→</span>
                </span>
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
    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: LIME, marginBottom: "0.625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ flex: 1, height: "1px", background: BORDER }} />
      {children}
      <span style={{ flex: 1, height: "1px", background: BORDER }} />
    </div>
  );
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <Link href={href} style={{ display: "block", background: S2, borderRadius: "0.625rem", padding: "1.25rem 1.5rem", textDecoration: "none", border: `1px solid ${BORDER}`, borderTop: accent ? `3px solid ${LIME}` : `1px solid ${BORDER}` }}>
      <div style={{ fontSize: "2.25rem", fontWeight: 800, color: accent ? LIME : TEXT, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</div>
      <div style={{ fontSize: "0.75rem", color: MUTED, marginTop: "0.4rem", fontWeight: 500 }}>{label}</div>
    </Link>
  );
}

function Panel({ title, link, linkLabel, children }: { title: string; link: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div style={{ background: S2, borderRadius: "0.625rem", padding: "1.25rem", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: TEXT, margin: 0 }}>{title}</h2>
        <Link href={link} style={{ fontSize: "0.72rem", color: LIME, textDecoration: "none" }}>{linkLabel}</Link>
      </div>
      {children}
    </div>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: "0.375rem", padding: "0 0.5rem" }}>{label}</div>
      {children}
    </div>
  );
}

function NavItem({ href, icon, children, active }: { href: string; icon: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", color: active ? LIME : "#888", textDecoration: "none", fontSize: "0.82rem", fontWeight: active ? 600 : 400, background: active ? "rgba(223,253,123,0.08)" : "transparent" }}>
      <span style={{ width: "1rem", textAlign: "center", fontSize: "0.8rem" }}>{icon}</span>
      {children}
    </Link>
  );
}

function QuickBtn({ href, children, lime }: { href: string; children: React.ReactNode; lime?: boolean }) {
  return (
    <Link href={href} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: lime ? LIME : S3, color: lime ? "#1e1e21" : TEXT, textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, border: `1px solid ${lime ? LIME : BORDER}` }}>
      {children}
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "2rem 1rem", color: MUTED, fontSize: "0.8rem" }}>{children}</div>;
}
