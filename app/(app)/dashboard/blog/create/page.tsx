export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import { htmlToLexical } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function BlogCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const teamleden = await payload
    .find({ collection: "team" as any, limit: 100, sort: "volgorde" })
    .catch(() => ({ docs: [] as any[] }));

  const auteurOpties = (teamleden.docs || []).map((t: any) => ({
    label: [t.voornaam, t.achternaam].filter(Boolean).join(" ") || t.naam || String(t.id),
    value: String(t.id),
  }));

  async function create(fd: FormData) {
    "use server";
    const { payload: p, als } = await payloadAlsGebruiker();
    const html = fd.get("inhoud") as string;
    const str = (k: string) => {
      const v = fd.get(k);
      return v ? String(v) : undefined;
    };

    const result = await p.create({
      ...als,
      collection: "blog" as any,
      data: {
        titel: fd.get("titel"),
        slug: str("slug"),
        status: str("status") || "concept",
        publicatiedatum: str("publicatiedatum") || new Date().toISOString(),
        auteur: str("auteur"),
        cover: fd.get("cover") || undefined,
        samenvatting: str("samenvatting"),
        inhoud: html ? htmlToLexical(html) : undefined,
        meta_titel: str("meta_titel"),
        meta_beschrijving: str("meta_beschrijving"),
      } as any,
    });
    redirect(`/dashboard/blog/${(result as any).id}/edit`);
  }

  return (
    <FormShell
      activePath="/dashboard/blog"
      userName={(user as any).naam || user.email}
      rol={(user as any).rol}
      title="Nieuw artikel"
      backHref="/dashboard/blog"
      actions={<SaveBtn form="main-form" />}
    >
      <form id="main-form" action={create}>
        <FormSection title="Artikel">
          <Field label="Titel" name="titel" required placeholder="Bv. Zo vind je de juiste engineer" />
          <Field label="Korte samenvatting" name="samenvatting" type="textarea" rows={3} placeholder="1 à 2 zinnen — verschijnt in het overzicht en in Google." />
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", marginBottom: "0.5rem" }}>
              Inhoud
            </div>
            <RichTextEditor name="inhoud" />
          </div>
        </FormSection>

        <FormSection title="Coverafbeelding">
          <MediaUpload name="cover" label="Coverafbeelding uploaden" />
        </FormSection>

        <FormSection title="Publicatie">
          <FormRow>
            <SelectField
              label="Status"
              name="status"
              defaultValue="concept"
              options={[
                { label: "Concept", value: "concept" },
                { label: "Gepubliceerd", value: "gepubliceerd" },
              ]}
            />
            <Field label="Publicatiedatum" name="publicatiedatum" type="date" />
          </FormRow>
          <FormRow>
            <SelectField label="Auteur" name="auteur" placeholder="— Kies auteur —" options={auteurOpties} />
            <Field label="URL (laat leeg = automatisch)" name="slug" placeholder="zo-vind-je-de-juiste-engineer" />
          </FormRow>
        </FormSection>

        <FormSection title="SEO (optioneel)">
          <Field label="Meta titel" name="meta_titel" placeholder="Laat leeg om de titel te gebruiken" />
          <Field label="Meta beschrijving" name="meta_beschrijving" type="textarea" rows={2} placeholder="Laat leeg om de samenvatting te gebruiken" />
        </FormSection>

        <SaveBtn />
      </form>
    </FormShell>
  );
}
