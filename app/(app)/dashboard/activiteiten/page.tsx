export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader } from "@/components/DashboardShell";
import { ActiviteitFeed, type ActiviteitItem } from "@/components/ActiviteitFeed";
import ActiviteitCreateDrawer from "@/components/ActiviteitCreateDrawer";

const configPromise = import("@payload-config").then((m) => m.default);

const LIME = "#dffd7b";
const MUTED = "var(--bone-400)";
const BORDER = "var(--line)";
const S1 = "var(--ink-800)";

export default async function ActiviteitenPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; richting?: string }>;
}) {
  const { type, richting } = await searchParams;

  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const where: Record<string, any> = {};
  if (type) where.type = { equals: type };
  if (richting) where.richting = { equals: richting };

  const [docs, instellingen, kandidatenDocs, bedrijvenDocs] = await Promise.all([
    payload.find({
      collection: "activiteiten" as any,
      limit: 100,
      sort: "-datum",
      depth: 1,
      where: Object.keys(where).length ? where : undefined,
    }),
    payload.findGlobal({ slug: "instellingen" as any }),
    payload.find({ collection: "kandidaten" as any, limit: 200, sort: "achternaam" }),
    payload.find({ collection: "bedrijven" as any, limit: 200, sort: "naam" }),
  ]);

  const kandidaatOpties = kandidatenDocs.docs.map((k: any) => ({
    id: k.id,
    label: `${k.voornaam || ""} ${k.achternaam || ""}`.trim() || k.id,
  }));
  const bedrijfOpties = bedrijvenDocs.docs.map((b: any) => ({ id: b.id, label: b.naam || b.id }));
  const bccEmail = (instellingen as any)?.bcc_logging_email ?? undefined;

  const items: ActiviteitItem[] = docs.docs.map((d: any) => ({
    id: d.id,
    type: d.type,
    richting: d.richting,
    datum: d.datum,
    onderwerp: d.onderwerp,
    inhoud: d.inhoud,
    van: d.van,
    naar: d.naar,
    kandidaat: d.kandidaat,
    bedrijf: d.bedrijf,
  }));

  const TYPES = [
    { value: "", label: "Alle types" },
    { value: "email", label: "E-mail" },
    { value: "telefoon", label: "Telefoon" },
    { value: "meeting", label: "Afspraak" },
    { value: "notitie", label: "Notitie" },
  ];

  return (
    <DashboardShell activePath="/dashboard/activiteiten" userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader
        title="Activiteiten"
        subtitle={`${docs.totalDocs} activiteiten`}
        actions={<ActiviteitCreateDrawer kandidaten={kandidaatOpties} bedrijven={bedrijfOpties} />}
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", padding: "1rem 2.5rem", borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
        {TYPES.map((t) => {
          const active = (type ?? "") === t.value;
          const href = t.value
            ? `/dashboard/activiteiten?type=${t.value}${richting ? `&richting=${richting}` : ""}`
            : `/dashboard/activiteiten${richting ? `?richting=${richting}` : ""}`;
          return (
            <a
              key={t.value}
              href={href}
              style={{ padding: "0.35rem 0.75rem", borderRadius: "2px", fontSize: "0.8125rem", textDecoration: "none", background: active ? `${LIME}18` : "transparent", color: active ? LIME : MUTED, border: `1px solid ${active ? `${LIME}40` : BORDER}`, fontWeight: active ? 600 : 400 }}
            >
              {t.label}
            </a>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          {[
            { value: "", label: "Alle" },
            { value: "inkomend", label: "Inkomend" },
            { value: "uitgaand", label: "Uitgaand" },
          ].map((r) => {
            const active = (richting ?? "") === r.value;
            const href = r.value
              ? `/dashboard/activiteiten?richting=${r.value}${type ? `&type=${type}` : ""}`
              : `/dashboard/activiteiten${type ? `?type=${type}` : ""}`;
            return (
              <a
                key={r.value}
                href={href}
                style={{ padding: "0.35rem 0.75rem", borderRadius: "2px", fontSize: "0.8125rem", textDecoration: "none", background: active ? `${LIME}18` : "transparent", color: active ? LIME : MUTED, border: `1px solid ${active ? `${LIME}40` : BORDER}`, fontWeight: active ? 600 : 400 }}
              >
                {r.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8 lg:px-10">
        <ActiviteitFeed items={items} showRelaties bccEmail={bccEmail} />
      </div>
    </DashboardShell>
  );
}
