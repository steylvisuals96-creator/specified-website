export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, RelationField, SaveBtn, DeleteBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function GetuigenisEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const [doc, panden] = await Promise.all([
    payload.findByID({ collection: "testimonials", id, depth: 1 }).catch(() => null),
    payload.find({ collection: "panden", limit: 200, sort: "titel" }),
  ]);
  if (!doc) notFound();
  const d = doc as any;

  async function update(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") { await p.delete({ collection: "testimonials", id }); redirect("/dashboard/getuigenissen"); }
    await p.update({
      collection: "testimonials", id, data: {
        naam: fd.get("naam"), type: fd.get("type") || undefined,
        tekst: fd.get("tekst"), beoordeling: fd.get("beoordeling") || "5",
        pand: fd.get("pand") || null, goedgekeurd: fd.get("goedgekeurd") === "true",
      } as any,
    });
    redirect(`/dashboard/getuigenissen/${id}/edit`);
  }

  return (
    <FormShell activePath="/dashboard/getuigenissen" userName={(user as any).naam || user.email} title={d.naam} backHref="/dashboard/getuigenissen"
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection>
          <FormRow>
            <Field label="Naam klant" name="naam" required defaultValue={d.naam} />
            <SelectField label="Type klant" name="type" defaultValue={d.type} placeholder="Selecteer type" options={[
              { label: "Koper", value: "koper" }, { label: "Verkoper", value: "verkoper" },
              { label: "Huurder", value: "huurder" }, { label: "Verhuurder", value: "verhuurder" },
            ]} />
          </FormRow>
          <Field label="Getuigenis" name="tekst" type="textarea" required rows={5} defaultValue={d.tekst} />
          <FormRow>
            <SelectField label="Beoordeling" name="beoordeling" defaultValue={d.beoordeling} options={[
              { label: "5 sterren", value: "5" }, { label: "4 sterren", value: "4" }, { label: "3 sterren", value: "3" },
            ]} />
            <RelationField label="Gekoppeld pand" name="pand" defaultValue={d.pand?.id || d.pand}
              options={panden.docs.map((x: any) => ({ label: x.titel, value: x.id }))} />
          </FormRow>
          <CheckboxField label="Goedgekeurd voor publicatie" name="goedgekeurd" defaultChecked={d.goedgekeurd} />
        </FormSection>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
