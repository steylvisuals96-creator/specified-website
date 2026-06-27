export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, LimeBtn } from "@/components/DashboardShell";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const MUTED = "rgba(255,255,255,0.4)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f0f0f0";
const S1 = "#27272a";

function fmtDag(d: string) {
  return new Date(d).toLocaleDateString("nl-BE", { weekday: "long", day: "numeric", month: "long" });
}
function fmtTijd(d: string) {
  return new Date(d).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
}
function fmtDatumKort(d: string) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short" });
}

function googleCalendarUrl(doc: any) {
  const start = new Date(doc.datum);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const kandidaatNaam = doc.kandidaat?.naam || [doc.kandidaat?.voornaam, doc.kandidaat?.achternaam].filter(Boolean).join(" ") || "";
  const details = [doc.inhoud, kandidaatNaam ? `Kandidaat: ${kandidaatNaam}` : "", doc.bedrijf?.naam ? `Bedrijf: ${doc.bedrijf.naam}` : ""].filter(Boolean).join("\n");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(doc.onderwerp)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(details)}`;
}

function outlookUrl(doc: any) {
  const start = new Date(doc.datum);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(doc.onderwerp)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(doc.inhoud ?? "")}`;
}

function isVoorbij(datum: string) {
  return new Date(datum) < new Date();
}

export default async function AgendaPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  // All meetings, sorted by datum
  const docs = await payload.find({
    collection: "activiteiten" as any,
    where: { type: { equals: "meeting" } },
    sort: "datum",
    limit: 200,
    depth: 1,
  });

  const all = docs.docs as any[];
  const komende = all.filter((d) => !isVoorbij(d.datum));
  const voorbij = all.filter((d) => isVoorbij(d.datum));

  // Group komende by date
  function groupByDay(items: any[]) {
    const map = new Map<string, any[]>();
    for (const item of items) {
      const dag = new Date(item.datum).toDateString();
      if (!map.has(dag)) map.set(dag, []);
      map.get(dag)!.push(item);
    }
    return map;
  }

  const komendeGroups = groupByDay(komende);

  function MeetingCard({ doc, dimmed }: { doc: any; dimmed?: boolean }) {
    const kandidaatNaam = doc.kandidaat?.naam || [doc.kandidaat?.voornaam, doc.kandidaat?.achternaam].filter(Boolean).join(" ") || null;
    const bedrijfNaam = doc.bedrijf?.naam || null;

    return (
      <div style={{ background: dimmed ? "rgba(255,255,255,0.02)" : S1, borderRadius: "6px", border: `1px solid ${BORDER}`, padding: "1rem 1.25rem", opacity: dimmed ? 0.6 : 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: dimmed ? MUTED : TEXT, marginBottom: "0.25rem" }}>{doc.onderwerp}</div>
            <div style={{ fontSize: "0.75rem", color: "#555", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <span>🕐 {fmtTijd(doc.datum)}</span>
              {kandidaatNaam && <span style={{ color: LIME }}>👤 {kandidaatNaam}</span>}
              {bedrijfNaam && <span style={{ color: "#fb923c" }}>🏢 {bedrijfNaam}</span>}
            </div>
            {doc.inhoud && (
              <div style={{ fontSize: "0.77rem", color: "#555", marginTop: "0.4rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "50ch" }}>
                {doc.inhoud.trim().replace(/\n/g, " ").substring(0, 100)}
              </div>
            )}
          </div>

          {/* Calendar export buttons */}
          {!dimmed && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flexShrink: 0 }}>
              <a
                href={googleCalendarUrl(doc)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.65rem", borderRadius: "3px", fontSize: "0.71rem", fontWeight: 600, color: "#4285f4", background: "rgba(66,133,244,0.1)", border: "1px solid rgba(66,133,244,0.25)", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#4285f4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </a>
              <a
                href={outlookUrl(doc)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.65rem", borderRadius: "3px", fontSize: "0.71rem", fontWeight: 600, color: "#0078d4", background: "rgba(0,120,212,0.1)", border: "1px solid rgba(0,120,212,0.25)", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#0078d4"><path d="M7 2H2v20h12l8-8V2H7zm0 2h12v9h-7v7H4V4h3z"/></svg>
                Outlook
              </a>
              <a
                href={`/api/agenda/ics/${doc.id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.65rem", borderRadius: "3px", fontSize: "0.71rem", fontWeight: 600, color: "#888", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, textDecoration: "none", whiteSpace: "nowrap" }}
              >
                ↓ .ics
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <DashboardShell activePath="/dashboard/agenda" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Agenda"
        subtitle={`${komende.length} komende meetings`}
        actions={<LimeBtn href="/dashboard/activiteiten?type=meeting">Alle meetings</LimeBtn>}
      />

      <div style={{ padding: "1.5rem 2.5rem", maxWidth: "780px" }}>

        {/* Komende meetings */}
        {komende.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#555", fontSize: "0.85rem" }}>
            Geen komende meetings gepland.
          </div>
        ) : (
          <>
            {[...komendeGroups.entries()].map(([dag, items]) => (
              <div key={dag} style={{ marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: LIME, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span>{fmtDag(items[0].datum)}</span>
                  <span style={{ flex: 1, height: "1px", background: BORDER }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {items.map((doc) => <MeetingCard key={doc.id} doc={doc} />)}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Voorbije meetings */}
        {voorbij.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#444", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span>Afgelopen</span>
              <span style={{ flex: 1, height: "1px", background: "#2a2a2a" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[...voorbij].reverse().map((doc) => <MeetingCard key={doc.id} doc={doc} dimmed />)}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
