export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, CheckboxField, FormSection, SaveBtn, DeleteBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import { htmlToLexical, lexicalToHtml } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function PaginaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const doc = await payload.findByID({ collection: "paginas", id, depth: 1 }).catch(() => null);
  if (!doc) notFound();
  const d = doc as any;
  const inhoudHtml = d.inhoud ? lexicalToHtml(d.inhoud) : "";

  async function update(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") { await p.delete({ collection: "paginas", id }); redirect("/dashboard/paginas"); }
    const html = fd.get("inhoud") as string;
    await p.update({
      collection: "paginas", id, data: {
        titel: fd.get("titel"), slug: fd.get("slug"),
        inhoud: html ? htmlToLexical(html) : undefined,
        gepubliceerd: fd.get("gepubliceerd") === "true",
        seo_titel: fd.get("seo_titel") || undefined,
        seo_beschrijving: fd.get("seo_beschrijving") || undefined,
        seo_afbeelding: fd.get("seo_afbeelding") || null,
      } as any,
    });
    redirect(`/dashboard/paginas/${id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/paginas" userName={(user as any).naam || user.email} title={d.titel} backHref="/dashboard/paginas"
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection title="Pagina">
          <Field label="Titel" name="titel" required defaultValue={d.titel} />
          <Field label="Slug (URL)" name="slug" required defaultValue={d.slug} />
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Inhoud</div>
            <RichTextEditor name="inhoud" defaultValue={inhoudHtml} />
          </div>
          <CheckboxField label="Gepubliceerd" name="gepubliceerd" defaultChecked={d.gepubliceerd} />
        </FormSection>
        <FormSection title="SEO">
          <Field label="SEO Titel" name="seo_titel" defaultValue={d.seo_titel} />
          <Field label="Meta beschrijving" name="seo_beschrijving" type="textarea" rows={2} defaultValue={d.seo_beschrijving} />
          <div style={{ marginBottom: "0.35rem", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a" }}>Social share afbeelding</div>
          <MediaUpload name="seo_afbeelding" currentUrl={d.seo_afbeelding?.url} currentId={d.seo_afbeelding?.id || d.seo_afbeelding} />
        </FormSection>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
