export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, RelationField, SaveBtn, DeleteBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function AfspraakEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const [doc, leads, panden] = await Promise.all([
    payload.findByID({ collection: "afspraken", id }).catch(() => null),
    payload.find({ collection: "leads", limit: 200, sort: "-createdAt" }),
    payload.find({ collection: "panden", limit: 200, sort: "titel" }),
  ]);
  if (!doc) notFound();
  const d = doc as any;
  const datumValue = d.datum ? new Date(d.datum).toISOString().slice(0, 16) : "";

  async function update(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") { await p.delete({ collection: "afspraken", id }); redirect("/dashboard/afspraken"); }
    await p.update({
      collection: "afspraken", id, data: {
        titel: fd.get("titel"), type: fd.get("type"), status: fd.get("status"),
        datum: fd.get("datum"), duur: fd.get("duur"),
        locatie: fd.get("locatie") || undefined, notities: fd.get("notities") || undefined,
        lead: fd.get("lead") || null, pand: fd.get("pand") || null,
      } as any,
    });
    redirect(`/dashboard/afspraken/${id}`);
  }

  return (
    <FormShell activePath="/dashboard/afspraken" userName={(user as any).naam || user.email} title={d.titel} backHref={`/dashboard/afspraken/${id}`}
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection>
          <Field label="Titel" name="titel" required defaultValue={d.titel} />
          <FormRow>
            <SelectField label="Type" name="type" defaultValue={d.type} options={[
              { label: "Bezichtiging", value: "bezichtiging" }, { label: "Gratis schatting", value: "schatting" },
              { label: "Notariaat", value: "notariaat" }, { label: "Kennismaking", value: "kennismaking" },
              { label: "Vergadering", value: "vergadering" }, { label: "Andere", value: "andere" },
            ]} />
            <SelectField label="Status" name="status" defaultValue={d.status} options={[
              { label: "Gepland", value: "gepland" }, { label: "Bevestigd", value: "bevestigd" },
              { label: "Geannuleerd", value: "geannuleerd" }, { label: "Afgerond", value: "afgerond" },
            ]} />
          </FormRow>
          <FormRow>
            <Field label="Datum & tijd" name="datum" type="datetime-local" defaultValue={datumValue} />
            <SelectField label="Duur" name="duur" defaultValue={d.duur} options={[
              { label: "30 minuten", value: "30" }, { label: "1 uur", value: "60" },
              { label: "1,5 uur", value: "90" }, { label: "2 uur", value: "120" },
            ]} />
          </FormRow>
          <Field label="Locatie / adres" name="locatie" defaultValue={d.locatie} />
          <FormRow>
            <RelationField label="Klant / lead" name="lead" defaultValue={d.lead?.id || d.lead}
              options={leads.docs.map((x: any) => ({ label: x.naam, value: x.id }))} />
            <RelationField label="Pand" name="pand" defaultValue={d.pand?.id || d.pand}
              options={panden.docs.map((x: any) => ({ label: x.titel, value: x.id }))} />
          </FormRow>
          <Field label="Notities" name="notities" type="textarea" rows={3} defaultValue={d.notities} />
        </FormSection>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
