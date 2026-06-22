export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import FormShell, { Field, SelectField, FormSection, FormRow, RelationField, SaveBtn, DeleteBtn } from "@/components/FormShell";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function TaakEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const [doc, gebruikers, leads, panden] = await Promise.all([
    payload.findByID({ collection: "taken", id }).catch(() => null),
    payload.find({ collection: "gebruikers", limit: 50 }),
    payload.find({ collection: "leads", limit: 200, sort: "-createdAt" }),
    payload.find({ collection: "panden", limit: 200, sort: "titel" }),
  ]);
  if (!doc) notFound();
  const d = doc as any;

  const deadlineValue = d.deadline ? new Date(d.deadline).toISOString().slice(0, 16) : "";

  async function update(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") { await p.delete({ collection: "taken", id }); redirect("/dashboard/taken"); }
    await p.update({
      collection: "taken", id, data: {
        titel: fd.get("titel"), status: fd.get("status"), prioriteit: fd.get("prioriteit"),
        deadline: fd.get("deadline") || undefined, toegewezen_aan: fd.get("toegewezen_aan") || null,
        lead: fd.get("lead") || null, pand: fd.get("pand") || null,
        beschrijving: fd.get("beschrijving") || undefined,
      } as any,
    });
    redirect(`/dashboard/taken/${id}`);
  }

  return (
    <FormShell activePath="/dashboard/taken" userName={(user as any).naam || user.email} title={d.titel} backHref={`/dashboard/taken/${id}`}
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection>
          <Field label="Taak omschrijving" name="titel" required defaultValue={d.titel} />
          <FormRow>
            <SelectField label="Status" name="status" defaultValue={d.status} options={[
              { label: "Open", value: "open" }, { label: "Bezig", value: "bezig" }, { label: "Afgerond", value: "afgerond" },
            ]} />
            <SelectField label="Prioriteit" name="prioriteit" defaultValue={d.prioriteit} options={[
              { label: "Hoog", value: "hoog" }, { label: "Normaal", value: "normaal" }, { label: "Laag", value: "laag" },
            ]} />
            <Field label="Deadline" name="deadline" type="datetime-local" defaultValue={deadlineValue} />
          </FormRow>
          <FormRow>
            <RelationField label="Toegewezen aan" name="toegewezen_aan" defaultValue={d.toegewezen_aan?.id || d.toegewezen_aan}
              options={gebruikers.docs.map((x: any) => ({ label: x.naam || x.email, value: x.id }))} />
            <RelationField label="Gekoppeld aan lead" name="lead" defaultValue={d.lead?.id || d.lead}
              options={leads.docs.map((x: any) => ({ label: x.naam, value: x.id }))} />
            <RelationField label="Gekoppeld aan pand" name="pand" defaultValue={d.pand?.id || d.pand}
              options={panden.docs.map((x: any) => ({ label: x.titel, value: x.id }))} />
          </FormRow>
          <Field label="Beschrijving" name="beschrijving" type="textarea" rows={4} defaultValue={d.beschrijving} />
        </FormSection>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
