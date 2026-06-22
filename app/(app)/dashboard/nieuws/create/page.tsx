export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import { htmlToLexical } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function NieuwsCreatePage() {
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
      collection: "nieuws", data: {
        titel: fd.get("titel"), slug: fd.get("slug"),
        samenvatting: fd.get("samenvatting") || undefined,
        inhoud: html ? htmlToLexical(html) : undefined,
        categorie: fd.get("categorie") || undefined,
        publicatiedatum: fd.get("publicatiedatum") || undefined,
        gepubliceerd: fd.get("gepubliceerd") === "true",
        afbeelding: fd.get("afbeelding") || undefined,
        seo_titel: fd.get("seo_titel") || undefined,
        seo_beschrijving: fd.get("seo_beschrijving") || undefined,
      } as any,
    });
    redirect(`/dashboard/nieuws/${result.id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/nieuws" userName={(user as any).naam || user.email} title="Nieuw bericht" backHref="/dashboard/nieuws" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={create}>
        <FormSection title="Inhoud">
          <Field label="Titel" name="titel" required placeholder="Titel van het bericht" />
          <Field label="Slug (URL)" name="slug" required placeholder="bijv. marktnieuws-2024" />
          <Field label="Samenvatting" name="samenvatting" type="textarea" rows={2} placeholder="Korte intro voor overzichtspagina..." />
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Inhoud</div>
            <RichTextEditor name="inhoud" />
          </div>
        </FormSection>

        <FormSection title="Afbeelding">
          <MediaUpload name="afbeelding" label="Uitgelichte afbeelding uploaden" />
        </FormSection>

        <FormSection title="Publicatie">
          <FormRow>
            <SelectField label="Categorie" name="categorie" placeholder="Selecteer categorie" options={[
              { label: "Marktnieuws", value: "marktnieuws" }, { label: "Kooptips", value: "kooptips" },
              { label: "Verkooptips", value: "verkooptips" }, { label: "Vastgoed nieuws", value: "vastgoednieuws" },
              { label: "Bedrijfsnieuws", value: "bedrijfsnieuws" },
            ]} />
            <Field label="Publicatiedatum" name="publicatiedatum" type="date" />
          </FormRow>
          <CheckboxField label="Gepubliceerd" name="gepubliceerd" />
        </FormSection>

        <FormSection title="SEO">
          <Field label="SEO Titel" name="seo_titel" placeholder="Optionele SEO titel" />
          <Field label="Meta beschrijving" name="seo_beschrijving" type="textarea" rows={2} placeholder="Max. 160 tekens" />
        </FormSection>

        <SaveBtn />
      </form>
    </FormShell>
  );
}
