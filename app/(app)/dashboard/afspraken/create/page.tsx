export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, RelationField, SaveBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function AfspraakCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const [leads, panden] = await Promise.all([
    payload.find({ collection: "leads", limit: 200, sort: "-createdAt" }),
    payload.find({ collection: "panden", limit: 200, sort: "titel" }),
  ]);

  async function create(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    const result = await p.create({
      collection: "afspraken", data: {
        titel: fd.get("titel"), type: fd.get("type"), status: fd.get("status") || "gepland",
        datum: fd.get("datum"), duur: fd.get("duur") || "60",
        locatie: fd.get("locatie") || undefined, notities: fd.get("notities") || undefined,
        lead: fd.get("lead") || undefined, pand: fd.get("pand") || undefined,
      } as any,
    });
    redirect(`/dashboard/afspraken/${result.id}`);
  }

  return (
    <FormShell activePath="/dashboard/afspraken" userName={(user as any).naam || user.email} title="Nieuwe afspraak" backHref="/dashboard/afspraken" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={create}>
        <FormSection>
          <Field label="Titel" name="titel" required placeholder="Bijv. Bezichtiging Villa Gent" />
          <FormRow>
            <SelectField label="Type" name="type" required placeholder="Selecteer type" options={[
              { label: "Bezichtiging", value: "bezichtiging" }, { label: "Gratis schatting", value: "schatting" },
              { label: "Notariaat", value: "notariaat" }, { label: "Kennismaking", value: "kennismaking" },
              { label: "Vergadering", value: "vergadering" }, { label: "Andere", value: "andere" },
            ]} />
            <SelectField label="Status" name="status" defaultValue="gepland" options={[
              { label: "Gepland", value: "gepland" }, { label: "Bevestigd", value: "bevestigd" },
              { label: "Geannuleerd", value: "geannuleerd" }, { label: "Afgerond", value: "afgerond" },
            ]} />
          </FormRow>
          <FormRow>
            <Field label="Datum & tijd" name="datum" type="datetime-local" required />
            <SelectField label="Duur" name="duur" defaultValue="60" options={[
              { label: "30 minuten", value: "30" }, { label: "1 uur", value: "60" },
              { label: "1,5 uur", value: "90" }, { label: "2 uur", value: "120" },
            ]} />
          </FormRow>
          <Field label="Locatie / adres" name="locatie" placeholder="Straat 1, Gemeente" />
          <FormRow>
            <RelationField label="Klant / lead" name="lead"
              options={leads.docs.map((d: any) => ({ label: d.naam, value: d.id }))} />
            <RelationField label="Pand" name="pand"
              options={panden.docs.map((d: any) => ({ label: d.titel, value: d.id }))} />
          </FormRow>
          <Field label="Notities" name="notities" type="textarea" rows={3} />
        </FormSection>
        <SaveBtn />
      </form>
    </FormShell>
  );
}
