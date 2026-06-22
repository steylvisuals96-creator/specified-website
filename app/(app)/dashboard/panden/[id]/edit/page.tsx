export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, SaveBtn, DeleteBtn } from "@/components/FormShell";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUpload from "@/components/MediaUpload";
import { htmlToLexical, lexicalToHtml } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function PandEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const doc = await payload.findByID({ collection: "panden", id, depth: 1 }).catch(() => null);
  if (!doc) notFound();
  const d = doc as any;

  const beschrijvingHtml = d.beschrijving ? lexicalToHtml(d.beschrijving) : "";
  const hoofdfotoUrl = d.hoofdfoto?.url;
  const hoofdfotoId = d.hoofdfoto?.id || d.hoofdfoto;

  async function update(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    if (fd.get("_action") === "delete") { await p.delete({ collection: "panden", id }); redirect("/dashboard/panden"); }
    const beschrijvingHtml = fd.get("beschrijving") as string;
    await p.update({
      collection: "panden", id, data: {
        titel: fd.get("titel"), type: fd.get("type"), transactie: fd.get("transactie"),
        status: fd.get("status"), prijs: Number(fd.get("prijs")),
        adres: fd.get("adres") || undefined, gemeente: fd.get("gemeente") || undefined,
        postcode: fd.get("postcode") || undefined,
        slaapkamers: fd.get("slaapkamers") ? Number(fd.get("slaapkamers")) : undefined,
        badkamers: fd.get("badkamers") ? Number(fd.get("badkamers")) : undefined,
        bewoonbare_opp: fd.get("bewoonbare_opp") ? Number(fd.get("bewoonbare_opp")) : undefined,
        perceelgrootte: fd.get("perceelgrootte") ? Number(fd.get("perceelgrootte")) : undefined,
        bouwjaar: fd.get("bouwjaar") ? Number(fd.get("bouwjaar")) : undefined,
        epc: fd.get("epc") || undefined,
        garage: fd.get("garage") === "true", tuin: fd.get("tuin") === "true", terras: fd.get("terras") === "true",
        beschrijving: beschrijvingHtml ? htmlToLexical(beschrijvingHtml) : undefined,
        hoofdfoto: fd.get("hoofdfoto") || null,
        video_url: fd.get("video_url") || undefined,
        uitgelicht: fd.get("uitgelicht") === "true",
      } as any,
    });
    redirect(`/dashboard/panden/${id}`);
  }

  return (
    <FormShell activePath="/dashboard/panden" userName={(user as any).naam || user.email} title={d.titel} backHref={`/dashboard/panden/${id}`}
      actions={<><DeleteBtn /><SaveBtn form="main-form" /></>}>
      <form id="main-form" action={update}>
        <FormSection title="Basisinfo">
          <Field label="Titel" name="titel" required defaultValue={d.titel} />
          <FormRow>
            <SelectField label="Type" name="type" defaultValue={d.type} options={[
              { label: "Woning", value: "woning" }, { label: "Appartement", value: "appartement" },
              { label: "Grond", value: "grond" }, { label: "Commercieel", value: "commercieel" },
              { label: "Nieuwbouw", value: "nieuwbouw" },
            ]} />
            <SelectField label="Transactie" name="transactie" defaultValue={d.transactie} options={[
              { label: "Te koop", value: "koop" }, { label: "Te huur", value: "huur" },
            ]} />
            <SelectField label="Status" name="status" defaultValue={d.status} options={[
              { label: "Beschikbaar", value: "beschikbaar" }, { label: "Onder bod", value: "onder_bod" },
              { label: "Verkocht", value: "verkocht" }, { label: "Verhuurd", value: "verhuurd" },
            ]} />
          </FormRow>
          <Field label="Prijs (€)" name="prijs" type="number" required defaultValue={d.prijs} />
        </FormSection>

        <FormSection title="Locatie">
          <Field label="Adres" name="adres" defaultValue={d.adres} />
          <FormRow>
            <Field label="Gemeente" name="gemeente" defaultValue={d.gemeente} />
            <Field label="Postcode" name="postcode" defaultValue={d.postcode} />
          </FormRow>
        </FormSection>

        <FormSection title="Details">
          <FormRow>
            <Field label="Slaapkamers" name="slaapkamers" type="number" defaultValue={d.slaapkamers} />
            <Field label="Badkamers" name="badkamers" type="number" defaultValue={d.badkamers} />
            <Field label="Bewoonbare opp. (m²)" name="bewoonbare_opp" type="number" defaultValue={d.bewoonbare_opp} />
            <Field label="Perceelgrootte (m²)" name="perceelgrootte" type="number" defaultValue={d.perceelgrootte} />
          </FormRow>
          <FormRow>
            <Field label="Bouwjaar" name="bouwjaar" type="number" defaultValue={d.bouwjaar} />
            <Field label="EPC-label" name="epc" defaultValue={d.epc} />
          </FormRow>
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem" }}>
            <CheckboxField label="Garage" name="garage" defaultChecked={d.garage} />
            <CheckboxField label="Tuin" name="tuin" defaultChecked={d.tuin} />
            <CheckboxField label="Terras" name="terras" defaultChecked={d.terras} />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a", marginBottom: "0.5rem" }}>Beschrijving</div>
            <RichTextEditor name="beschrijving" defaultValue={beschrijvingHtml} />
          </div>
        </FormSection>

        <FormSection title="Media">
          <div style={{ marginBottom: "0.35rem", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a" }}>Hoofdfoto</div>
          <MediaUpload name="hoofdfoto" currentUrl={hoofdfotoUrl} currentId={hoofdfotoId} />
          <Field label="Video URL" name="video_url" defaultValue={d.video_url} />
        </FormSection>

        <FormSection title="Opties">
          <CheckboxField label="Uitgelicht op homepage" name="uitgelicht" defaultChecked={d.uitgelicht} />
        </FormSection>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <DeleteBtn /><SaveBtn />
        </div>
      </form>
    </FormShell>
  );
}
