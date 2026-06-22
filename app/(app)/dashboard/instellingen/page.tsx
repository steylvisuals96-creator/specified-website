export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, GoldBtn } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function InstellingenPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const s = await (payload as any).findGlobal({ slug: "instellingen" }).catch(() => null);

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", padding: "1rem 0", gap: "2rem", alignItems: "flex-start" }}>
      <div style={{ width: "200px", flexShrink: 0, color: "#555", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: "2px" }}>{label}</div>
      <div style={{ color: value ? "#e5e5e5" : "#333", fontSize: "0.88rem" }}>{value || "—"}</div>
    </div>
  );

  return (
    <DashboardShell activePath="/dashboard/instellingen" userName={(user as any).naam || user.email}>
      <PageHeader title="Kantoor instellingen" subtitle="Algemene informatie over het kantoor"
        actions={<GoldBtn href="/dashboard/instellingen/edit">Bewerken</GoldBtn>} />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1.5rem 2rem", maxWidth: "800px" }}>
          <Row label="Naam kantoor" value={s?.naam} />
          <Row label="Contact e-mail" value={s?.contact_email} />
          <Row label="Telefoon" value={s?.contact_telefoon} />
          <Row label="Adres" value={s?.adres} />
          <Row label="Primaire kleur" value={s?.kleur_primair} />
          <Row label="Instagram" value={s?.instagram} />
          <Row label="Facebook" value={s?.facebook} />
          <Row label="LinkedIn" value={s?.linkedin} />
        </div>
      </div>
    </DashboardShell>
  );
}
