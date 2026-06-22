export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, RelationField, SaveBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function LeadCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const [panden, gebruikers] = await Promise.all([
    payload.find({ collection: "panden", limit: 200, sort: "titel" }),
    payload.find({ collection: "gebruikers", limit: 50 }),
  ]);

  async function createLead(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    const data: any = {
      naam: fd.get("naam"), email: fd.get("email"), telefoon: fd.get("telefoon") || undefined,
      bericht: fd.get("bericht") || undefined, status: fd.get("status") || "nieuw",
      bron: fd.get("bron") || "website", notities: fd.get("notities") || undefined,
      opvolging: fd.get("opvolging") || undefined,
      pand: fd.get("pand") || undefined, toegewezen_aan: fd.get("toegewezen_aan") || undefined,
    };
    const result = await p.create({ collection: "leads", data });
    redirect(`/dashboard/leads/${result.id}`);
  }

  return (
    <FormShell activePath="/dashboard/leads" userName={(user as any).naam || user.email} title="Nieuwe lead" backHref="/dashboard/leads" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={createLead}>
        <FormSection title="Contactgegevens">
          <FormRow>
            <Field label="Naam" name="naam" required placeholder="Voornaam Achternaam" />
            <Field label="E-mail" name="email" type="email" required placeholder="email@voorbeeld.be" />
            <Field label="Telefoon" name="telefoon" placeholder="+32 ..." />
          </FormRow>
          <Field label="Bericht" name="bericht" type="textarea" rows={4} placeholder="Bericht van de klant..." />
        </FormSection>

        <FormSection title="CRM">
          <FormRow>
            <SelectField label="Status" name="status" defaultValue="nieuw" options={[
              { label: "Nieuw", value: "nieuw" },
              { label: "Gecontacteerd", value: "gecontacteerd" },
              { label: "Bezoek gepland", value: "bezoek_gepland" },
              { label: "In onderhandeling", value: "onderhandeling" },
              { label: "Afgerond", value: "afgerond" },
              { label: "Niet geïnteresseerd", value: "niet_geinteresseerd" },
            ]} />
            <SelectField label="Bron" name="bron" defaultValue="website" options={[
              { label: "Website", value: "website" },
              { label: "Instagram", value: "instagram" },
              { label: "Immoweb", value: "immoweb" },
              { label: "Telefoon", value: "telefoon" },
              { label: "Doorverwijzing", value: "doorverwijzing" },
            ]} />
            <Field label="Opvolgingsdatum" name="opvolging" type="date" />
          </FormRow>
          <FormRow>
            <RelationField label="Geïnteresseerd in pand" name="pand"
              options={panden.docs.map((d: any) => ({ label: d.titel, value: d.id }))} />
            <RelationField label="Toegewezen aan" name="toegewezen_aan"
              options={gebruikers.docs.map((d: any) => ({ label: d.naam || d.email, value: d.id }))} />
          </FormRow>
          <Field label="Interne notities" name="notities" type="textarea" rows={3} />
        </FormSection>

        <SaveBtn />
      </form>
    </FormShell>
  );
}
