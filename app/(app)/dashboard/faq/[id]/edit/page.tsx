export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, SaveBtn, DeleteBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import { htmlToLexical, lexicalToHtml } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function FAQEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const doc = await payload.findByID({ collection: "faq", id }).catch(() => null);
  if (!doc) notFound();
  const d = doc as any;
  const antwoordHtml = d.antwoord ? lexicalToHtml(d.antwoord) : "";

  async function update(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") { await p.delete({ collection: "faq", id }); redirect("/dashboard/faq"); }
    const html = fd.get("antwoord") as string;
    await p.update({
      collection: "faq", id, data: {
        vraag: fd.get("vraag"), antwoord: html ? htmlToLexical(html) : undefined,
        categorie: fd.get("categorie") || undefined,
        volgorde: fd.get("volgorde") ? Number(fd.get("volgorde")) : 99,
      } as any,
    });
    redirect(`/dashboard/faq/${id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/faq" userName={(user as any).naam || user.email} title={d.vraag} backHref="/dashboard/faq"
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection>
          <Field label="Vraag" name="vraag" required defaultValue={d.vraag} />
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Antwoord</div>
            <RichTextEditor name="antwoord" defaultValue={antwoordHtml} />
          </div>
          <FormRow>
            <SelectField label="Categorie" name="categorie" defaultValue={d.categorie} placeholder="Selecteer categorie" options={[
              { label: "Kopen", value: "kopen" }, { label: "Verkopen", value: "verkopen" },
              { label: "Huren", value: "huren" }, { label: "Verhuren", value: "verhuren" },
              { label: "Schatting", value: "schatting" }, { label: "Algemeen", value: "algemeen" },
            ]} />
            <Field label="Volgorde" name="volgorde" type="number" defaultValue={d.volgorde} />
          </FormRow>
        </FormSection>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
