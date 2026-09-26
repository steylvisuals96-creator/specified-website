export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, LimeBtn } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function InstellingenPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const s = await (payload as any).findGlobal({ slug: "instellingen" }).catch(() => null);

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div style={{ display: "flex", borderBottom: "1px solid var(--ink-900)", padding: "1rem 0", gap: "2rem", alignItems: "flex-start" }}>
      <div style={{ width: "220px", flexShrink: 0, color: "var(--bone-400)", fontSize: "0.8125rem", fontWeight: 700, paddingTop: "2px" }}>{label}</div>
      <div style={{ color: value ? "#e5e5e5" : "var(--olive-600)", fontSize: "0.88rem" }}>{value || "—"}</div>
    </div>
  );

  const woorden = (s?.hero_woorden || []).map((w: any) => w.woord).join(", ");
  const heroTitel = [s?.hero_prefix, woorden, s?.hero_suffix].filter(Boolean).join(" ");

  return (
    <DashboardShell activePath="/dashboard/instellingen" userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader title="Website-instellingen" subtitle="Alle zichtbare teksten van de website"
        actions={<LimeBtn href="/dashboard/instellingen/edit">Bewerken</LimeBtn>} />
      <div className="px-5 py-6 sm:px-8 lg:px-10">
        <div style={{ background: "var(--ink-900)", border: "1px solid var(--ink-900)", borderRadius: "2px", padding: "1.5rem 2rem", maxWidth: "820px" }}>
          <Row label="Bedrijfsnaam" value={s?.naam} />
          <Row label="Contact e-mail" value={s?.contact_email} />
          <Row label="Telefoon" value={s?.telefoon} />
          <Row label="Adres" value={s?.adres} />
          <Row label="LinkedIn" value={s?.linkedin} />
          <Row label="Hero-titel" value={heroTitel} />
          <Row label="Tagline" value={s?.hero_tagline} />
          <Row label="Aantal kerncijfers" value={s?.statistieken?.length ? `${s.statistieken.length} cijfers` : null} />
          <Row label="Jobs-titel" value={s?.jobs_titel} />
          <Row label="Contact-titel" value={s?.contact_titel} />
          <Row label="Over ons-titel" value={[s?.over_titel, s?.over_titel_accent].filter(Boolean).join(" ")} />
          <Row label="Meta titel (SEO)" value={s?.meta_titel} />
        </div>
        <p style={{ color: "var(--bone-400)", fontSize: "0.875rem", marginTop: "1rem", maxWidth: "820px" }}>
          Klik op <span style={{ color: "#dffd7b" }}>Bewerken</span> om alle teksten, kerncijfers, dienstenblokken en de sectorbalk van de homepage aan te passen. Teamleden beheer je onder <span style={{ color: "#dffd7b" }}>Team</span>, vacatures onder <span style={{ color: "#dffd7b" }}>Vacatures</span>.
        </p>
      </div>
    </DashboardShell>
  );
}
