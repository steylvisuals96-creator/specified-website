export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { isBeheerder, isCreator } from "@/lib/access";
import FormShell, { Field, SelectField, FormSection, SaveBtn, DeleteBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function GebruikerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  if (!isBeheerder(user)) redirect("/dashboard");

  const doc = await payload.findByID({ collection: "gebruikers", id, user, overrideAccess: false }).catch(() => null);
  if (!doc) notFound();
  const d = doc as any;

  async function update(fd: FormData) {
    "use server";
    const { payload: p, als } = await payloadAlsGebruiker();
    if (fd.get("_action") === "delete") { await p.delete({ ...als, collection: "gebruikers", id }); redirect("/dashboard/gebruikers"); }
    const data: any = { naam: fd.get("naam"), email: fd.get("email"), rol: fd.get("rol") };
    const pw = fd.get("password") as string;
    if (pw) data.password = pw;
    await p.update({ ...als, collection: "gebruikers", id, data });
    redirect(`/dashboard/gebruikers`);
  }

  return (
    <FormShell activePath="/dashboard/gebruikers" userName={(user as any).naam || user.email} rol={(user as any).rol} title={d.naam || d.email} backHref="/dashboard/gebruikers"
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection>
          <Field label="Naam" name="naam" required defaultValue={d.naam} />
          <Field label="E-mail" name="email" type="email" required defaultValue={d.email} />
          <Field label="Nieuw wachtwoord" name="password" type="password" placeholder="Leeg laten om ongewijzigd te houden" />
          <SelectField label="Rol" name="rol" defaultValue={d.rol} options={[
            ...(isCreator(user) ? [{ label: "Creator (SteylVisuals)", value: "creator" }] : []),
            { label: "Beheerder", value: "beheerder" },
            { label: "Recruitment Consultant", value: "consultant" },
          ]} />
        </FormSection>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
