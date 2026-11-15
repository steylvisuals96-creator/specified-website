export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, SaveBtn, DeleteBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import LiveEditor from "@/components/LiveEditor";
import { htmlToLexical, lexicalToHtml } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const doc: any = await payload
    .findByID({ collection: "blog" as any, id, depth: 1 })
    .catch(() => null);
  if (!doc) notFound();

  const teamleden = await payload
    .find({ collection: "team" as any, limit: 100, sort: "volgorde" })
    .catch(() => ({ docs: [] as any[] }));
  const auteurOpties = (teamleden.docs || []).map((t: any) => ({
    label: [t.voornaam, t.achternaam].filter(Boolean).join(" ") || t.naam || String(t.id),
    value: String(t.id),
  }));

  const inhoudHtml = doc.inhoud ? lexicalToHtml(doc.inhoud) : "";
  const auteurId = typeof doc.auteur === "object" ? doc.auteur?.id : doc.auteur;
  const datum = doc.publicatiedatum ? String(doc.publicatiedatum).slice(0, 10) : "";

  async function save(fd: FormData) {
    "use server";
    const { payload: p, als } = await payloadAlsGebruiker();

    if (fd.get("_action") === "delete") {
      await p.delete({ ...als, collection: "blog" as any, id });
      redirect("/dashboard/blog");
    }

    const html = fd.get("inhoud") as string;
    const str = (k: string) => {
      const v = fd.get(k);
      return v ? String(v) : undefined;
    };

    await p.update({
      ...als,
      collection: "blog" as any,
      id,
      data: {
        titel: fd.get("titel"),
        slug: str("slug"),
        status: str("status") || "concept",
        publicatiedatum: str("publicatiedatum") || undefined,
        auteur: str("auteur") || null,
        cover: fd.get("cover") || null,
        samenvatting: str("samenvatting"),
        inhoud: html ? htmlToLexical(html) : undefined,
        meta_titel: str("meta_titel"),
        meta_beschrijving: str("meta_beschrijving"),
      } as any,
    });
    redirect("/dashboard/blog");
  }

  return (
    <FormShell
      wide
      activePath="/dashboard/blog"
      userName={(user as any).naam || user.email}
      rol={(user as any).rol}
      title="Artikel bewerken"
      backHref="/dashboard/blog"
      actions={<SaveBtn form="main-form" />}
    >
      <LiveEditor soort="blog" voorbeeldPad="/blog/voorbeeld">
      <form id="main-form" action={save}>
        <FormSection title="Artikel">
          <Field label="Titel" name="titel" required defaultValue={doc.titel} />
          <Field label="Korte samenvatting" name="samenvatting" type="textarea" rows={3} defaultValue={doc.samenvatting} />
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", marginBottom: "0.5rem" }}>
              Inhoud
            </div>
            <RichTextEditor name="inhoud" defaultValue={inhoudHtml} />
          </div>
        </FormSection>

        <FormSection title="Coverafbeelding">
          <MediaUpload name="cover" currentUrl={doc.cover?.url} currentId={doc.cover?.id || doc.cover} label="Coverafbeelding uploaden" />
        </FormSection>

        <FormSection title="Publicatie">
          <FormRow>
            <SelectField
              label="Status"
              name="status"
              defaultValue={doc.status || "concept"}
              options={[
                { label: "Concept", value: "concept" },
                { label: "Gepubliceerd", value: "gepubliceerd" },
              ]}
            />
            <Field label="Publicatiedatum" name="publicatiedatum" type="date" defaultValue={datum} />
          </FormRow>
          <FormRow>
            <SelectField label="Auteur" name="auteur" defaultValue={auteurId ? String(auteurId) : ""} placeholder="— Kies auteur —" options={auteurOpties} />
            <Field label="URL (slug)" name="slug" defaultValue={doc.slug} />
          </FormRow>
          {doc.status === "gepubliceerd" && doc.slug && (
            <p style={{ fontSize: "0.8125rem", color: "var(--bone-400)", marginTop: "-0.5rem" }}>
              Live op:{" "}
              <a href={`https://specified-website.vercel.app/blog/${doc.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#dffd7b" }}>
                /blog/{doc.slug}
              </a>
            </p>
          )}
        </FormSection>

        <FormSection title="SEO (optioneel)">
          <Field label="Meta titel" name="meta_titel" defaultValue={doc.meta_titel} placeholder="Laat leeg om de titel te gebruiken" />
          <Field label="Meta beschrijving" name="meta_beschrijving" type="textarea" rows={2} defaultValue={doc.meta_beschrijving} placeholder="Laat leeg om de samenvatting te gebruiken" />
        </FormSection>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <SaveBtn />
          <DeleteBtn label="Artikel verwijderen" />
        </div>
      </form>
      </LiveEditor>
    </FormShell>
  );
}
