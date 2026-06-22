export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, SelectField, CheckboxField, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import MediaUpload from "@/components/MediaUpload";
import PandBeschrijvingSection from "@/components/PandBeschrijvingSection";
import { htmlToLexical } from "@/lib/lexical";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function PandCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  async function create(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });
    const beschrijvingHtml = fd.get("beschrijving") as string;
    const result = await p.create({
      collection: "panden", data: {
        titel: fd.get("titel"), type: fd.get("type"), transactie: fd.get("transactie"),
        status: fd.get("status") || "beschikbaar", prijs: Number(fd.get("prijs")),
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
        hoofdfoto: fd.get("hoofdfoto") || undefined,
        video_url: fd.get("video_url") || undefined,
        uitgelicht: fd.get("uitgelicht") === "true",
      } as any,
    });
    redirect(`/dashboard/panden/${result.id}`);
  }

  return (
    <FormShell activePath="/dashboard/panden" userName={(user as any).naam || user.email} title="Nieuw pand" backHref="/dashboard/panden" actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={create}>
        <FormSection title="Basisinfo">
          <Field label="Titel" name="titel" required placeholder="Bijv. Moderne villa te Gent" />
          <FormRow>
            <SelectField label="Type" name="type" required placeholder="Selecteer type" options={[
              { label: "Woning", value: "woning" }, { label: "Appartement", value: "appartement" },
              { label: "Grond", value: "grond" }, { label: "Commercieel", value: "commercieel" },
              { label: "Nieuwbouw", value: "nieuwbouw" },
            ]} />
            <SelectField label="Transactie" name="transactie" required placeholder="Selecteer" options={[
              { label: "Te koop", value: "koop" }, { label: "Te huur", value: "huur" },
            ]} />
            <SelectField label="Status" name="status" defaultValue="beschikbaar" options={[
              { label: "Beschikbaar", value: "beschikbaar" }, { label: "Onder bod", value: "onder_bod" },
              { label: "Verkocht", value: "verkocht" }, { label: "Verhuurd", value: "verhuurd" },
            ]} />
          </FormRow>
          <Field label="Prijs (€)" name="prijs" type="number" required placeholder="350000" />
        </FormSection>

        <FormSection title="Locatie">
          <Field label="Adres" name="adres" placeholder="Straat en huisnummer" />
          <FormRow>
            <Field label="Gemeente" name="gemeente" placeholder="Gent" />
            <Field label="Postcode" name="postcode" placeholder="9000" />
          </FormRow>
        </FormSection>

        <FormSection title="Details">
          <FormRow>
            <Field label="Slaapkamers" name="slaapkamers" type="number" placeholder="3" />
            <Field label="Badkamers" name="badkamers" type="number" placeholder="2" />
            <Field label="Bewoonbare opp. (m²)" name="bewoonbare_opp" type="number" placeholder="180" />
            <Field label="Perceelgrootte (m²)" name="perceelgrootte" type="number" placeholder="600" />
          </FormRow>
          <FormRow>
            <Field label="Bouwjaar" name="bouwjaar" type="number" placeholder="2005" />
            <Field label="EPC-label" name="epc" placeholder="A, B, C..." />
          </FormRow>
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem" }}>
            <CheckboxField label="Garage" name="garage" />
            <CheckboxField label="Tuin" name="tuin" />
            <CheckboxField label="Terras" name="terras" />
          </div>
          <PandBeschrijvingSection />
        </FormSection>

        <FormSection title="Media">
          <div style={{ marginBottom: "0.35rem", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a" }}>Hoofdfoto</div>
          <MediaUpload name="hoofdfoto" label="Hoofdfoto uploaden" />
          <Field label="Video URL" name="video_url" placeholder="https://www.youtube.com/..." />
        </FormSection>

        <FormSection title="Opties">
          <CheckboxField label="Uitgelicht op homepage" name="uitgelicht" />
        </FormSection>

        <SaveBtn />
      </form>
    </FormShell>
  );
}
