import type { Payload } from "payload";
import Link from "next/link";

type Props = {
  payload?: Payload;
};

export default async function Dashboard({ payload }: Props) {
  if (!payload) return null;

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
    <div style={{ padding: "0 0 2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.25rem", color: "var(--theme-text)" }}>
        Overzicht
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            style={{
              display: "block",
              background: "var(--theme-elevation-100)",
              borderRadius: "0.5rem",
              padding: "1.25rem 1.5rem",
              textDecoration: "none",
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 700, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--theme-elevation-500)", marginTop: "0.4rem" }}>
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ background: "var(--theme-elevation-100)", borderRadius: "0.5rem", padding: "1.25rem 1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--theme-text)" }}>
            Snelle acties
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { label: "➕ Nieuw pand toevoegen", href: "/admin/collections/panden/create" },
              { label: "👤 Nieuwe lead toevoegen", href: "/admin/collections/leads/create" },
              { label: "🏠 Alle panden bekijken", href: "/admin/collections/panden" },
              { label: "📋 Alle leads bekijken", href: "/admin/collections/leads" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "block",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  background: "var(--theme-elevation-150)",
                  color: "var(--theme-text)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--theme-elevation-100)", borderRadius: "0.5rem", padding: "1.25rem 1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--theme-text)" }}>
            Lead pipeline
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { label: "🆕 Nieuw", status: "nieuw", color: "#3b82f6" },
              { label: "📞 Gecontacteerd", status: "gecontacteerd", color: "#f59e0b" },
              { label: "📅 Bezoek gepland", status: "bezoek_gepland", color: "#8b5cf6" },
              { label: "💬 Onderhandeling", status: "onderhandeling", color: "#ec4899" },
              { label: "✅ Afgerond", status: "afgerond", color: "#22c55e" },
            ].map((item) => (
              <Link
                key={item.status}
                href={`/admin/collections/leads?where[status][equals]=${item.status}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "0.375rem",
                  background: "var(--theme-elevation-150)",
                  color: "var(--theme-text)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
