export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell, { PageHeader, LimeBtn, Empty } from "@/components/DashboardShell";
const configPromise = import("@payload-config").then((m) => m.default);

export default async function MediaPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  const docs = await payload.find({ collection: "media", limit: 100, sort: "-createdAt" });

  return (
    <DashboardShell activePath="/dashboard/media" userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader
        title="Media"
        subtitle={`${docs.totalDocs} bestanden`}
        actions={<LimeBtn href="/dashboard/media/create">Bestand uploaden</LimeBtn>}
      />
      <div className="px-5 py-6 sm:px-8 lg:px-10">
        {docs.docs.length === 0 ? (
          <Empty>Nog geen mediabestanden geüpload.</Empty>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1.25rem",
          }}>
            {docs.docs.map((doc: any) => {
              const isImage = doc.mimeType?.startsWith("image/");
              const ext = doc.filename?.split(".").pop()?.toUpperCase() || "FILE";
              return (
                <a
                  key={doc.id}
                  href={`/dashboard/media/${doc.id}/edit`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{
                    background: "#111",
                    border: "1px solid #222",
                    borderRadius: "2px",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}>
                    <div style={{
                      width: "100%",
                      height: "130px",
                      background: "var(--ink-900)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      {isImage && doc.url ? (
                        <img
                          src={doc.url}
                          alt={doc.alt || doc.filename}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{
                          background: "var(--ink-900)",
                          border: "1px solid var(--olive-600)",
                          borderRadius: "2px",
                          padding: "0.5rem 0.75rem",
                          fontFamily: "monospace",
                          fontSize: "0.8125rem",
                          color: "#dffd7b",
                        }}>{ext}</div>
                      )}
                    </div>
                    <div style={{ padding: "0.75rem" }}>
                      <div style={{
                        fontSize: "0.8125rem",
                        color: "#e5e5e5",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "DM Sans, sans-serif",
                      }}>{doc.filename}</div>
                      {doc.filesize && (
                        <div style={{ fontSize: "0.8125rem", color: "var(--bone-400)", marginTop: "0.25rem" }}>
                          {(doc.filesize / 1024).toFixed(0)} KB
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
