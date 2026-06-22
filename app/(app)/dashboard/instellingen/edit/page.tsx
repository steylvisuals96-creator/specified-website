export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import MediaUpload from "@/components/MediaUpload";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function InstellingenEditPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const s = await (payload as any).findGlobal({ slug: "instellingen" }).catch(() => null);

  async function save(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    await (p as any).updateGlobal({
      slug: "instellingen",
      data: {
        naam: fd.get("naam"),
        contact_email: fd.get("contact_email") || undefined,
        contact_telefoon: fd.get("contact_telefoon") || undefined,
        adres: fd.get("adres") || undefined,
        kleur_primair: fd.get("kleur_primair") || "#B8843A",
        kleur_donker: fd.get("kleur_donker") || "#0A0A0A",
        instagram: fd.get("instagram") || undefined,
        facebook: fd.get("facebook") || undefined,
        linkedin: fd.get("linkedin") || undefined,
        logo: fd.get("logo") || null,
      } as any,
    });
    redirect("/dashboard/instellingen");
  }

  return (
    <FormShell activePath="/dashboard/instellingen" userName={(user as any).naam || user.email}
      title="Kantoor instellingen bewerken" backHref="/dashboard/instellingen"
      actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={save}>
        <FormSection title="Kantoor">
          <Field label="Naam kantoor" name="naam" required defaultValue={s?.naam} placeholder="SOM Vastgoed" />
          <FormRow>
            <Field label="Contact e-mail" name="contact_email" type="email" defaultValue={s?.contact_email} placeholder="info@somvastgoed.be" />
            <Field label="Telefoonnummer" name="contact_telefoon" defaultValue={s?.contact_telefoon} placeholder="+32 ..." />
          </FormRow>
          <Field label="Adres kantoor" name="adres" defaultValue={s?.adres} placeholder="Straat 1, 9000 Gent" />
        </FormSection>

        <FormSection title="Logo">
          <MediaUpload name="logo" currentUrl={s?.logo?.url} currentId={s?.logo?.id || s?.logo} label="Logo uploaden" />
        </FormSection>

        <FormSection title="Huisstijl">
          <FormRow>
            <Field label="Primaire kleur (hex)" name="kleur_primair" defaultValue={s?.kleur_primair || "#B8843A"} placeholder="#B8843A" />
            <Field label="Donkere kleur (hex)" name="kleur_donker" defaultValue={s?.kleur_donker || "#0A0A0A"} placeholder="#0A0A0A" />
          </FormRow>
        </FormSection>

        <FormSection title="Sociale media">
          <Field label="Instagram URL" name="instagram" defaultValue={s?.instagram} placeholder="https://instagram.com/..." />
          <Field label="Facebook URL" name="facebook" defaultValue={s?.facebook} placeholder="https://facebook.com/..." />
          <Field label="LinkedIn URL" name="linkedin" defaultValue={s?.linkedin} placeholder="https://linkedin.com/..." />
        </FormSection>

        <SaveBtn />
      </form>
    </FormShell>
  );
}
