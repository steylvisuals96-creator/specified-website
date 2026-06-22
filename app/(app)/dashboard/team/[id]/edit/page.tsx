export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, SaveBtn, DeleteBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import { htmlToLexical, lexicalToHtml } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function TeamEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const doc = await payload.findByID({ collection: "team", id, depth: 1 }).catch(() => null);
  if (!doc) notFound();
  const d = doc as any;
  const bioHtml = d.bio ? lexicalToHtml(d.bio) : "";

  async function update(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") { await p.delete({ collection: "team", id }); redirect("/dashboard/team"); }
    const html = fd.get("bio") as string;
    await p.update({
      collection: "team", id, data: {
        naam: fd.get("naam"), functie: fd.get("functie") || undefined,
        email: fd.get("email") || undefined, telefoon: fd.get("telefoon") || undefined,
        bio: html ? htmlToLexical(html) : undefined,
        volgorde: fd.get("volgorde") ? Number(fd.get("volgorde")) : 99,
        actief: fd.get("actief") === "true",
        foto: fd.get("foto") || null,
      } as any,
    });
    redirect(`/dashboard/team/${id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/team" userName={(user as any).naam || user.email} title={d.naam} backHref="/dashboard/team"
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection title="Foto">
          <MediaUpload name="foto" currentUrl={d.foto?.url} currentId={d.foto?.id || d.foto} label="Profielfoto" />
        </FormSection>
        <FormSection title="Gegevens">
          <FormRow>
            <Field label="Naam" name="naam" required defaultValue={d.naam} />
            <SelectField label="Functie" name="functie" defaultValue={d.functie} placeholder="Selecteer functie" options={[
              { label: "Zaakvoerder", value: "zaakvoerder" }, { label: "Senior makelaar", value: "senior_makelaar" },
              { label: "Makelaar", value: "makelaar" }, { label: "Vastgoedconsulent", value: "consultant" },
              { label: "Administratie", value: "administratie" }, { label: "Stagiair", value: "stagiair" },
            ]} />
          </FormRow>
          <FormRow>
            <Field label="E-mail" name="email" type="email" defaultValue={d.email} />
            <Field label="Telefoon" name="telefoon" defaultValue={d.telefoon} />
          </FormRow>
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Bio</div>
            <RichTextEditor name="bio" defaultValue={bioHtml} />
          </div>
          <FormRow>
            <Field label="Volgorde" name="volgorde" type="number" defaultValue={d.volgorde} />
            <CheckboxField label="Actief / zichtbaar op website" name="actief" defaultChecked={d.actief} />
          </FormRow>
        </FormSection>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
