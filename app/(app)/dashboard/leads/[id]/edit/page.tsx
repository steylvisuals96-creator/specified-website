export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, RelationField, SaveBtn, DeleteBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function LeadEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const [doc, panden, gebruikers] = await Promise.all([
    payload.findByID({ collection: "leads", id }).catch(() => null),
    payload.find({ collection: "panden", limit: 200, sort: "titel" }),
    payload.find({ collection: "gebruikers", limit: 50 }),
  ]);
  if (!doc) notFound();

  const d = doc as any;

  async function updateLead(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") {
      await p.delete({ collection: "leads", id });
      redirect("/dashboard/leads");
    }
    await p.update({
      collection: "leads", id, data: {
        naam: fd.get("naam"), email: fd.get("email"), telefoon: fd.get("telefoon") || undefined,
        bericht: fd.get("bericht") || undefined, status: fd.get("status") || "nieuw",
        bron: fd.get("bron") || "website", notities: fd.get("notities") || undefined,
        opvolging: fd.get("opvolging") || undefined,
        pand: fd.get("pand") || null, toegewezen_aan: fd.get("toegewezen_aan") || null,
      } as any,
    });
    redirect(`/dashboard/leads/${id}`);
  }

  return (
    <FormShell activePath="/dashboard/leads" userName={(user as any).naam || user.email} title={`Lead: ${d.naam}`} backHref={`/dashboard/leads/${id}`}
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={updateLead}>
        <FormSection title="Contactgegevens">
          <FormRow>
            <Field label="Naam" name="naam" required defaultValue={d.naam} />
            <Field label="E-mail" name="email" type="email" required defaultValue={d.email} />
            <Field label="Telefoon" name="telefoon" defaultValue={d.telefoon} />
          </FormRow>
          <Field label="Bericht" name="bericht" type="textarea" rows={4} defaultValue={d.bericht} />
        </FormSection>
        <FormSection title="CRM">
          <FormRow>
            <SelectField label="Status" name="status" defaultValue={d.status} options={[
              { label: "Nieuw", value: "nieuw" }, { label: "Gecontacteerd", value: "gecontacteerd" },
              { label: "Bezoek gepland", value: "bezoek_gepland" }, { label: "In onderhandeling", value: "onderhandeling" },
              { label: "Afgerond", value: "afgerond" }, { label: "Niet geïnteresseerd", value: "niet_geinteresseerd" },
            ]} />
            <SelectField label="Bron" name="bron" defaultValue={d.bron} options={[
              { label: "Website", value: "website" }, { label: "Instagram", value: "instagram" },
              { label: "Immoweb", value: "immoweb" }, { label: "Telefoon", value: "telefoon" },
              { label: "Doorverwijzing", value: "doorverwijzing" },
            ]} />
            <Field label="Opvolgingsdatum" name="opvolging" type="date" defaultValue={d.opvolging?.split("T")[0]} />
          </FormRow>
          <FormRow>
            <RelationField label="Geïnteresseerd in pand" name="pand" defaultValue={d.pand?.id || d.pand}
              options={panden.docs.map((x: any) => ({ label: x.titel, value: x.id }))} />
            <RelationField label="Toegewezen aan" name="toegewezen_aan" defaultValue={d.toegewezen_aan?.id || d.toegewezen_aan}
              options={gebruikers.docs.map((x: any) => ({ label: x.naam || x.email, value: x.id }))} />
          </FormRow>
          <Field label="Interne notities" name="notities" type="textarea" rows={3} defaultValue={d.notities} />
        </FormSection>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn />
          <SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
