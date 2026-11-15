export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, SaveBtn, DeleteBtn } from "@/components/FormShell";
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

export default async function TeamEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const doc = await payload.findByID({ collection: "team", id, depth: 1 }).catch(() => null);
  if (!doc) notFound();
  const d = doc as any;

  async function update(fd: FormData) {
    "use server";
    const { payload: p, als } = await payloadAlsGebruiker();
    if (fd.get("_action") === "delete") {
      await p.delete({ ...als, collection: "team", id });
      redirect("/dashboard/team");
    }
    await p.update({ ...als, collection: "team", id, data: teamData(fd) as any });
    redirect(`/dashboard/team/${id}/edit`);
  }

  return (
    <FormShell
      wide
      activePath="/dashboard/team"
      userName={(user as any).naam || user.email}
      rol={(user as any).rol}
      title={[d.voornaam, d.achternaam].filter(Boolean).join(" ") || d.naam || "Teamlid"}
      backHref="/dashboard/team"
      actions={<SaveBtn form="main-form" />}
    >
      <LiveEditor soort="team" voorbeeldPad={`/voorbeeld/team?id=${id}`}>
        <form id="main-form" action={update}>
        <FormSection title="Foto">
          <MediaUpload name="foto" currentUrl={d.foto?.url} currentId={d.foto?.id || d.foto} label="Profielfoto" />
        </FormSection>
        <FormSection title="Gegevens">
          <FormRow>
            <Field label="Voornaam" name="voornaam" required defaultValue={d.voornaam} />
            <Field label="Achternaam" name="achternaam" required defaultValue={d.achternaam} />
          </FormRow>
          <SelectField label="Rol" name="rol" defaultValue={d.rol} placeholder="Kies een rol" options={[
              { label: "Managing Partner", value: "managing_partner" },
              { label: "Senior Consultant", value: "senior_consultant" },
              { label: "Consultant", value: "consultant" },
              { label: "Talent Acquisition Specialist", value: "talent" },
              { label: "Office Manager", value: "office" },
            ]} />
          <Field label="Bio" name="bio" type="textarea" rows={6} defaultValue={d.bio} />
          <FormRow>
            <Field label="E-mail" name="email" type="email" defaultValue={d.email} />
            <Field label="LinkedIn URL" name="linkedin" defaultValue={d.linkedin} />
          </FormRow>
          <FormRow>
            <Field label="Volgorde (lager = eerder)" name="volgorde" type="number" defaultValue={d.volgorde ?? 99} />
            <CheckboxField label="Actief / zichtbaar op website" name="actief" defaultChecked={d.actief !== false} />
          </FormRow>
        </FormSection>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
            <DeleteBtn label="Teamlid verwijderen" />
            <SaveBtn />
          </div>
        </form>
      </LiveEditor>
    </FormShell>
  );
}
