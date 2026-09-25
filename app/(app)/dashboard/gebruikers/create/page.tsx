export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isBeheerder, isCreator } from "@/lib/access";
import FormShell, { Field, SelectField, FormSection, SaveBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function GebruikerCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  if (!isBeheerder(user)) redirect("/dashboard");

  async function create(fd: FormData) {
    "use server";
    const { payload: p, als } = await payloadAlsGebruiker();
    const result = await p.create({
      ...als,
      collection: "gebruikers", data: {
        naam: fd.get("naam"), email: fd.get("email"),
        password: fd.get("password"), rol: fd.get("rol") || "consultant",
      } as any,
    });
    redirect(`/dashboard/gebruikers`);
  }

  return (
    <FormShell activePath="/dashboard/gebruikers" userName={(user as any).naam || user.email} title="Nieuwe gebruiker" backHref="/dashboard/gebruikers" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={create}>
        <FormSection>
          <Field label="Naam" name="naam" required placeholder="Voornaam Achternaam" />
          <Field label="E-mail" name="email" type="email" required placeholder="naam@somvastgoed.be" />
          <Field label="Wachtwoord" name="password" type="password" required placeholder="Minimaal 8 tekens" />
          <SelectField label="Rol" name="rol" defaultValue="consultant" options={[
            ...(isCreator(user) ? [{ label: "Creator (SteylVisuals)", value: "creator" }] : []),
            { label: "Beheerder", value: "beheerder" },
            { label: "Recruitment Consultant", value: "consultant" },
          ]} />
        </FormSection>
        <SaveBtn />
      </form>
    </FormShell>
  );
}
