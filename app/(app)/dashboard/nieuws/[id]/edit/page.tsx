export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, SaveBtn, DeleteBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import { htmlToLexical, lexicalToHtml } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function NieuwsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const doc = await payload.findByID({ collection: "nieuws", id, depth: 1 }).catch(() => null);
  if (!doc) notFound();
  const d = doc as any;

  const inhoudHtml = d.inhoud ? lexicalToHtml(d.inhoud) : "";
  const pubDate = d.publicatiedatum ? d.publicatiedatum.split("T")[0] : "";

  async function update(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") { await p.delete({ collection: "nieuws", id }); redirect("/dashboard/nieuws"); }
    const html = fd.get("inhoud") as string;
    await p.update({
      collection: "nieuws", id, data: {
        titel: fd.get("titel"), slug: fd.get("slug"),
        samenvatting: fd.get("samenvatting") || undefined,
        inhoud: html ? htmlToLexical(html) : undefined,
        categorie: fd.get("categorie") || undefined,
        publicatiedatum: fd.get("publicatiedatum") || undefined,
        gepubliceerd: fd.get("gepubliceerd") === "true",
        afbeelding: fd.get("afbeelding") || null,
        seo_titel: fd.get("seo_titel") || undefined,
        seo_beschrijving: fd.get("seo_beschrijving") || undefined,
      } as any,
    });
    redirect(`/dashboard/nieuws/${id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/nieuws" userName={(user as any).naam || user.email} title={d.titel} backHref="/dashboard/nieuws"
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection title="Inhoud">
          <Field label="Titel" name="titel" required defaultValue={d.titel} />
          <Field label="Slug (URL)" name="slug" required defaultValue={d.slug} />
          <Field label="Samenvatting" name="samenvatting" type="textarea" rows={2} defaultValue={d.samenvatting} />
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Inhoud</div>
            <RichTextEditor name="inhoud" defaultValue={inhoudHtml} />
          </div>
        </FormSection>

        <FormSection title="Afbeelding">
          <MediaUpload name="afbeelding" currentUrl={d.afbeelding?.url} currentId={d.afbeelding?.id || d.afbeelding} label="Uitgelichte afbeelding" />
        </FormSection>

        <FormSection title="Publicatie">
          <FormRow>
            <SelectField label="Categorie" name="categorie" defaultValue={d.categorie} placeholder="Selecteer categorie" options={[
              { label: "Marktnieuws", value: "marktnieuws" }, { label: "Kooptips", value: "kooptips" },
              { label: "Verkooptips", value: "verkooptips" }, { label: "Vastgoed nieuws", value: "vastgoednieuws" },
              { label: "Bedrijfsnieuws", value: "bedrijfsnieuws" },
            ]} />
            <Field label="Publicatiedatum" name="publicatiedatum" type="date" defaultValue={pubDate} />
          </FormRow>
          <CheckboxField label="Gepubliceerd" name="gepubliceerd" defaultChecked={d.gepubliceerd} />
        </FormSection>

        <FormSection title="SEO">
          <Field label="SEO Titel" name="seo_titel" defaultValue={d.seo_titel} />
          <Field label="Meta beschrijving" name="seo_beschrijving" type="textarea" rows={2} defaultValue={d.seo_beschrijving} />
        </FormSection>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
