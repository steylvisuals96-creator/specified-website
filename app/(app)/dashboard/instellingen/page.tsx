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

  const instellingen = await (payload as any).findGlobal({ slug: "instellingen" }).catch(() => null);

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div style={{
      display: "flex",
      borderBottom: "1px solid #1a1a1a",
      padding: "1rem 0",
      gap: "2rem",
      alignItems: "flex-start",
    }}>
      <div style={{ width: "200px", flexShrink: 0, color: "#666", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: "2px" }}>{label}</div>
      <div style={{ color: value ? "#e5e5e5" : "#444", fontSize: "0.9rem" }}>{value || "—"}</div>
    </div>
  );

  return (
    <DashboardShell activePath="/dashboard/instellingen" userName={(user as any).naam || user.email}>
      <PageHeader
        title="Kantoor instellingen"
        subtitle="Algemene informatie over het kantoor"
        actions={<GoldBtn href="/admin/globals/instellingen">Bewerken</GoldBtn>}
      />
      <div style={{ padding: "1.5rem 2.5rem" }}>
        <div style={{
          background: "#0d0d0d",
          border: "1px solid #1a1a1a",
          borderRadius: "12px",
          padding: "1.5rem 2rem",
          maxWidth: "800px",
        }}>
          <Row label="Bedrijfsnaam" value={instellingen?.bedrijfsnaam} />
          <Row label="Telefoon" value={instellingen?.telefoon} />
          <Row label="E-mail" value={instellingen?.email} />
          <Row label="Adres" value={instellingen?.adres} />
          <Row label="BTW-nummer" value={instellingen?.btwnummer} />
          <Row label="Facebook" value={instellingen?.facebook} />
          <Row label="Instagram" value={instellingen?.instagram} />
          <Row label="LinkedIn" value={instellingen?.linkedin} />
        </div>
      </div>
    </DashboardShell>
  );
}
