export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import { htmlToLexical } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function TeamCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  async function create(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    const html = fd.get("bio") as string;
    const result = await p.create({
      collection: "team", data: {
        naam: fd.get("naam"), functie: fd.get("functie") || undefined,
        email: fd.get("email") || undefined, telefoon: fd.get("telefoon") || undefined,
        bio: html ? htmlToLexical(html) : undefined,
        volgorde: fd.get("volgorde") ? Number(fd.get("volgorde")) : 99,
        actief: fd.get("actief") === "true",
        foto: fd.get("foto") || undefined,
      } as any,
    });
    redirect(`/dashboard/team/${result.id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/team" userName={(user as any).naam || user.email} title="Nieuw teamlid" backHref="/dashboard/team" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={create}>
        <FormSection title="Foto">
          <MediaUpload name="foto" label="Profielfoto uploaden" />
        </FormSection>
        <FormSection title="Gegevens">
          <FormRow>
            <Field label="Naam" name="naam" required placeholder="Voornaam Achternaam" />
            <SelectField label="Functie" name="functie" placeholder="Selecteer functie" options={[
              { label: "Zaakvoerder", value: "zaakvoerder" }, { label: "Senior makelaar", value: "senior_makelaar" },
              { label: "Makelaar", value: "makelaar" }, { label: "Vastgoedconsulent", value: "consultant" },
              { label: "Administratie", value: "administratie" }, { label: "Stagiair", value: "stagiair" },
            ]} />
          </FormRow>
          <FormRow>
            <Field label="E-mail" name="email" type="email" placeholder="naam@somvastgoed.be" />
            <Field label="Telefoon" name="telefoon" placeholder="+32 ..." />
          </FormRow>
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Bio</div>
            <RichTextEditor name="bio" />
          </div>
          <FormRow>
            <Field label="Volgorde" name="volgorde" type="number" defaultValue={99} placeholder="99" />
            <CheckboxField label="Actief / zichtbaar op website" name="actief" defaultChecked />
          </FormRow>
        </FormSection>
        <SaveBtn />
      </form>
    </FormShell>
  );
}
