export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import MediaUpload from "@/components/MediaUpload";
import LiveEditor from "@/components/LiveEditor";

const configPromise = import("@payload-config").then((m) => m.default);

function teamData(fd: FormData) {
  const tekst = (k: string) => (fd.get(k) ? String(fd.get(k)) : undefined);
  return {
    voornaam: tekst("voornaam"),
    achternaam: tekst("achternaam"),
    rol: tekst("rol"),
    bio: tekst("bio"),
    email: tekst("email"),
    linkedin: tekst("linkedin"),
    volgorde: fd.get("volgorde") ? Number(fd.get("volgorde")) : 99,
    actief: fd.get("actief") === "true",
    foto: fd.get("foto") || null,
  };
}

export default async function TeamCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  async function create(fd: FormData) {
    "use server";
    const { payload: p, als } = await payloadAlsGebruiker();
    const nieuw = await p.create({ ...als, collection: "team", data: teamData(fd) as any });
    redirect(`/dashboard/team/${(nieuw as any).id}/edit`);
  }

  return (
    <FormShell
      wide
      activePath="/dashboard/team"
      userName={(user as any).naam || user.email}
      rol={(user as any).rol}
      title="Nieuw teamlid"
      backHref="/dashboard/team"
      actions={<SaveBtn form="main-form" />}
    >
      <LiveEditor soort="team" voorbeeldPad="/voorbeeld/team">
        <form id="main-form" action={create}>
        <FormSection title="Foto">
          <MediaUpload name="foto" label="Profielfoto" />
        </FormSection>
        <FormSection title="Gegevens">
          <FormRow>
            <Field label="Voornaam" name="voornaam" required  />
            <Field label="Achternaam" name="achternaam" required  />
          </FormRow>
          <SelectField label="Rol" name="rol"  placeholder="Kies een rol" options={[
              { label: "Managing Partner", value: "managing_partner" },
              { label: "Senior Consultant", value: "senior_consultant" },
              { label: "Consultant", value: "consultant" },
              { label: "Talent Acquisition Specialist", value: "talent" },
              { label: "Office Manager", value: "office" },
            ]} />
          <Field label="Bio" name="bio" type="textarea" rows={6}  />
          <FormRow>
            <Field label="E-mail" name="email" type="email"  />
            <Field label="LinkedIn URL" name="linkedin"  />
          </FormRow>
          <FormRow>
            <Field label="Volgorde (lager = eerder)" name="volgorde" type="number" defaultValue={99} />
            <CheckboxField label="Actief / zichtbaar op website" name="actief" defaultChecked={true} />
          </FormRow>
        </FormSection>
          <SaveBtn />
        </form>
      </LiveEditor>
    </FormShell>
  );
}
