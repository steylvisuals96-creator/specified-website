export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import { htmlToLexical } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function FAQCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  async function create(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    const html = fd.get("antwoord") as string;
    const result = await p.create({
      collection: "faq", data: {
        vraag: fd.get("vraag"),
        antwoord: html ? htmlToLexical(html) : undefined,
        categorie: fd.get("categorie") || undefined,
        volgorde: fd.get("volgorde") ? Number(fd.get("volgorde")) : 99,
      } as any,
    });
    redirect(`/dashboard/faq/${result.id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/faq" userName={(user as any).naam || user.email} title="Nieuwe FAQ vraag" backHref="/dashboard/faq" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={create}>
        <FormSection>
          <Field label="Vraag" name="vraag" required placeholder="Hoe werkt een gratis schatting?" />
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Antwoord <span style={{ color: "#facb04" }}>*</span></div>
            <RichTextEditor name="antwoord" />
          </div>
          <FormRow>
            <SelectField label="Categorie" name="categorie" placeholder="Selecteer categorie" options={[
              { label: "Kopen", value: "kopen" }, { label: "Verkopen", value: "verkopen" },
              { label: "Huren", value: "huren" }, { label: "Verhuren", value: "verhuren" },
              { label: "Schatting", value: "schatting" }, { label: "Algemeen", value: "algemeen" },
            ]} />
            <Field label="Volgorde" name="volgorde" type="number" defaultValue={99} />
          </FormRow>
        </FormSection>
        <SaveBtn />
      </form>
    </FormShell>
  );
}
