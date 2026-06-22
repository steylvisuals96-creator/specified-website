export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, RelationField, SaveBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function GetuigenisCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const panden = await payload.find({ collection: "panden", limit: 200, sort: "titel" });

  async function create(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    const result = await p.create({
      collection: "testimonials", data: {
        naam: fd.get("naam"), type: fd.get("type") || undefined,
        tekst: fd.get("tekst"), beoordeling: fd.get("beoordeling") || "5",
        pand: fd.get("pand") || undefined, goedgekeurd: fd.get("goedgekeurd") === "true",
      } as any,
    });
    redirect(`/dashboard/getuigenissen/${result.id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/getuigenissen" userName={(user as any).naam || user.email} title="Nieuwe getuigenis" backHref="/dashboard/getuigenissen" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={create}>
        <FormSection>
          <FormRow>
            <Field label="Naam klant" name="naam" required placeholder="Jan Janssen" />
            <SelectField label="Type klant" name="type" placeholder="Selecteer type" options={[
              { label: "Koper", value: "koper" }, { label: "Verkoper", value: "verkoper" },
              { label: "Huurder", value: "huurder" }, { label: "Verhuurder", value: "verhuurder" },
            ]} />
          </FormRow>
          <Field label="Getuigenis" name="tekst" type="textarea" required rows={5} placeholder="Wat zei de klant?" />
          <FormRow>
            <SelectField label="Beoordeling" name="beoordeling" defaultValue="5" options={[
              { label: "5 sterren", value: "5" }, { label: "4 sterren", value: "4" }, { label: "3 sterren", value: "3" },
            ]} />
            <RelationField label="Gekoppeld pand" name="pand"
              options={panden.docs.map((d: any) => ({ label: d.titel, value: d.id }))} />
          </FormRow>
          <CheckboxField label="Goedgekeurd voor publicatie" name="goedgekeurd" />
        </FormSection>
        <SaveBtn />
      </form>
    </FormShell>
  );
}
