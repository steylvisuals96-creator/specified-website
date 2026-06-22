export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, RelationField, SaveBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function TaakCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const [gebruikers, leads, panden] = await Promise.all([
    payload.find({ collection: "gebruikers", limit: 50 }),
    payload.find({ collection: "leads", limit: 200, sort: "-createdAt" }),
    payload.find({ collection: "panden", limit: 200, sort: "titel" }),
  ]);

  async function createTaak(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    const result = await p.create({
      collection: "taken", data: {
        titel: fd.get("titel"), status: fd.get("status") || "open",
        prioriteit: fd.get("prioriteit") || "normaal",
        deadline: fd.get("deadline") || undefined,
        toegewezen_aan: fd.get("toegewezen_aan") || undefined,
        lead: fd.get("lead") || undefined, pand: fd.get("pand") || undefined,
        beschrijving: fd.get("beschrijving") || undefined,
      } as any,
    });
    redirect(`/dashboard/taken/${result.id}`);
  }

  return (
    <FormShell activePath="/dashboard/taken" userName={(user as any).naam || user.email} title="Nieuwe taak" backHref="/dashboard/taken" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={createTaak}>
        <FormSection>
          <Field label="Taak omschrijving" name="titel" required placeholder="Wat moet er gedaan worden?" />
          <FormRow>
            <SelectField label="Status" name="status" defaultValue="open" options={[
              { label: "Open", value: "open" }, { label: "Bezig", value: "bezig" }, { label: "Afgerond", value: "afgerond" },
            ]} />
            <SelectField label="Prioriteit" name="prioriteit" defaultValue="normaal" options={[
              { label: "Hoog", value: "hoog" }, { label: "Normaal", value: "normaal" }, { label: "Laag", value: "laag" },
            ]} />
            <Field label="Deadline" name="deadline" type="datetime-local" />
          </FormRow>
          <FormRow>
            <RelationField label="Toegewezen aan" name="toegewezen_aan"
              options={gebruikers.docs.map((d: any) => ({ label: d.naam || d.email, value: d.id }))} />
            <RelationField label="Gekoppeld aan lead" name="lead"
              options={leads.docs.map((d: any) => ({ label: d.naam, value: d.id }))} />
            <RelationField label="Gekoppeld aan pand" name="pand"
              options={panden.docs.map((d: any) => ({ label: d.titel, value: d.id }))} />
          </FormRow>
          <Field label="Beschrijving" name="beschrijving" type="textarea" rows={4} />
        </FormSection>
        <SaveBtn />
      </form>
    </FormShell>
  );
}
