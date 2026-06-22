export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, CheckboxField, FormSection, SaveBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import { htmlToLexical } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function PaginaCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  async function create(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    const html = fd.get("inhoud") as string;
    const result = await p.create({
      collection: "paginas", data: {
        titel: fd.get("titel"), slug: fd.get("slug"),
        inhoud: html ? htmlToLexical(html) : undefined,
        gepubliceerd: fd.get("gepubliceerd") === "true",
        seo_titel: fd.get("seo_titel") || undefined,
        seo_beschrijving: fd.get("seo_beschrijving") || undefined,
        seo_afbeelding: fd.get("seo_afbeelding") || undefined,
      } as any,
    });
    redirect(`/dashboard/paginas/${result.id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/paginas" userName={(user as any).naam || user.email} title="Nieuwe pagina" backHref="/dashboard/paginas" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={create}>
        <FormSection title="Pagina">
          <Field label="Titel" name="titel" required placeholder="Bijv. Over ons" />
          <Field label="Slug (URL)" name="slug" required placeholder="bijv. over-ons" />
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Inhoud</div>
            <RichTextEditor name="inhoud" />
          </div>
          <CheckboxField label="Gepubliceerd" name="gepubliceerd" />
        </FormSection>
        <FormSection title="SEO">
          <Field label="SEO Titel" name="seo_titel" placeholder="Optionele SEO titel" />
          <Field label="Meta beschrijving" name="seo_beschrijving" type="textarea" rows={2} placeholder="Max. 160 tekens" />
          <div style={{ marginBottom: "0.35rem", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a" }}>Social share afbeelding</div>
          <MediaUpload name="seo_afbeelding" label="Afbeelding voor social media" />
        </FormSection>
        <SaveBtn />
      </form>
    </FormShell>
  );
}
