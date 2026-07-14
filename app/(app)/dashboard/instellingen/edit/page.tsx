export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import MediaUpload from "@/components/MediaUpload";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function InstellingenEditPage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  const s = await (payload as any).findGlobal({ slug: "instellingen" }).catch(() => null);

  // Array-velden omzetten naar bewerkbare tekst
  const woordenTekst = (s?.hero_woorden || []).map((w: any) => w.woord).join(", ");
  const sectorenTekst = (s?.sectoren || []).map((x: any) => x.naam).join("\n");
  const statsTekst = (s?.statistieken || []).map((x: any) => `${x.waarde} | ${x.label}`).join("\n");

  async function save(fd: FormData) {
    "use server";
    const cfg = await configPromise;
    const p = await getPayload({ config: cfg as any });

    const str = (k: string) => {
      const v = fd.get(k);
      return v ? String(v) : undefined;
    };
    const woorden = String(fd.get("hero_woorden") || "")
      .split(",").map((w) => w.trim()).filter(Boolean).map((woord) => ({ woord }));
    const sectoren = String(fd.get("sectoren") || "")
      .split("\n").map((l) => l.trim()).filter(Boolean).map((naam) => ({ naam }));
    const statistieken = String(fd.get("statistieken") || "")
      .split("\n").map((l) => l.trim()).filter(Boolean)
      .map((line) => {
        const [waarde, ...rest] = line.split("|");
        return { waarde: (waarde || "").trim(), label: rest.join("|").trim() };
      })
      .filter((x) => x.waarde && x.label);

    await (p as any).updateGlobal({
      slug: "instellingen",
      data: {
        naam: fd.get("naam"),
        contact_email: str("contact_email"),
        telefoon: str("telefoon"),
        adres: str("adres"),
        linkedin: str("linkedin"),
        footer_tekst: str("footer_tekst"),
        logo: fd.get("logo") || null,
        // Hero
        hero_prefix: str("hero_prefix"),
        hero_woorden: woorden,
        hero_suffix: str("hero_suffix"),
        hero_tagline: str("hero_tagline"),
        hero_subtitel: str("hero_subtitel"),
        hero_cta_tekst: str("hero_cta_tekst"),
        hero_cta_2_tekst: str("hero_cta_2_tekst"),
        statistieken,
        // Diensten
        kandidaten_tag: str("kandidaten_tag"),
        kandidaten_titel: str("kandidaten_titel"),
        kandidaten_tekst: str("kandidaten_tekst"),
        kandidaten_cta: str("kandidaten_cta"),
        bedrijven_tag: str("bedrijven_tag"),
        bedrijven_titel: str("bedrijven_titel"),
        bedrijven_tekst: str("bedrijven_tekst"),
        bedrijven_cta: str("bedrijven_cta"),
        // Sectietitels & sectorbalk
        jobs_titel: str("jobs_titel"),
        jobs_link_tekst: str("jobs_link_tekst"),
        contact_titel: str("contact_titel"),
        sectoren,
        // Over ons
        over_titel: str("over_titel"),
        over_titel_accent: str("over_titel_accent"),
        over_tekst: str("over_tekst"),
        // SEO
        meta_titel: str("meta_titel"),
        meta_beschrijving: str("meta_beschrijving"),
      } as any,
    });
    redirect("/dashboard/instellingen");
  }

  return (
    <FormShell activePath="/dashboard/instellingen" userName={(user as any).naam || user.email}
      title="Website-instellingen bewerken" backHref="/dashboard/instellingen"
      actions={<SaveBtn form="main-form" />}>
      <form id="main-form" action={save}>
        <FormSection title="Bedrijf & contact">
          <Field label="Bedrijfsnaam" name="naam" required defaultValue={s?.naam} placeholder="Specified" />
          <FormRow>
            <Field label="Contact e-mail" name="contact_email" type="email" defaultValue={s?.contact_email} placeholder="info@specified.be" />
            <Field label="Telefoonnummer" name="telefoon" defaultValue={s?.telefoon} placeholder="+32 ..." />
          </FormRow>
          <Field label="Adres" name="adres" defaultValue={s?.adres} placeholder="Kontich, België" />
          <Field label="LinkedIn URL" name="linkedin" defaultValue={s?.linkedin} placeholder="https://linkedin.com/company/..." />
          <Field label="Footer — bedrijfsregel" name="footer_tekst" defaultValue={s?.footer_tekst} placeholder="© 2026 Specified BV — Kontich, België" />
        </FormSection>

        <FormSection title="Logo">
          <MediaUpload name="logo" currentUrl={s?.logo?.url} currentId={s?.logo?.id || s?.logo} label="Logo uploaden" />
        </FormSection>

        <FormSection title="Homepage — Hero (grote titel)">
          <FormRow>
            <Field label="Vast woord vóór" name="hero_prefix" defaultValue={s?.hero_prefix} placeholder="We" />
            <Field label="Vast woord ná" name="hero_suffix" defaultValue={s?.hero_suffix} placeholder="possibilities." />
          </FormRow>
          <Field label="Wisselende woorden (komma-gescheiden, animeren in lime)" name="hero_woorden" defaultValue={woordenTekst} placeholder="engineer, shape, unlock, build, define" />
          <Field label="Tagline (klein boven titel)" name="hero_tagline" defaultValue={s?.hero_tagline} placeholder="Engineering recruitment" />
          <Field label="Subtitel" name="hero_subtitel" type="textarea" defaultValue={s?.hero_subtitel} />
          <FormRow>
            <Field label="Knop 1 tekst" name="hero_cta_tekst" defaultValue={s?.hero_cta_tekst} placeholder="Bekijk vacatures" />
            <Field label="Knop 2 tekst" name="hero_cta_2_tekst" defaultValue={s?.hero_cta_2_tekst} placeholder="Neem contact op" />
          </FormRow>
        </FormSection>

        <FormSection title="Homepage — Kerncijfers">
          <Field label="Statistieken — één per regel, formaat: waarde | label" name="statistieken" type="textarea" rows={5} defaultValue={statsTekst} placeholder={"200+ | Plaatsingen gedaan\n98% | Retentie na 1 jaar"} />
        </FormSection>

        <FormSection title="Homepage — Blok 'Voor kandidaten'">
          <Field label="Label" name="kandidaten_tag" defaultValue={s?.kandidaten_tag} placeholder="Voor kandidaten" />
          <Field label="Titel" name="kandidaten_titel" defaultValue={s?.kandidaten_titel} />
          <Field label="Tekst" name="kandidaten_tekst" type="textarea" defaultValue={s?.kandidaten_tekst} />
          <Field label="Knop" name="kandidaten_cta" defaultValue={s?.kandidaten_cta} placeholder="Bekijk openstaande jobs" />
        </FormSection>

        <FormSection title="Homepage — Blok 'Voor bedrijven'">
          <Field label="Label" name="bedrijven_tag" defaultValue={s?.bedrijven_tag} placeholder="Voor bedrijven" />
          <Field label="Titel" name="bedrijven_titel" defaultValue={s?.bedrijven_titel} />
          <Field label="Tekst" name="bedrijven_tekst" type="textarea" defaultValue={s?.bedrijven_tekst} />
          <Field label="Knop" name="bedrijven_cta" defaultValue={s?.bedrijven_cta} placeholder="Vertel ons wat je zoekt" />
        </FormSection>

        <FormSection title="Homepage — Sectietitels & sectorbalk">
          <FormRow>
            <Field label="Jobs — titel" name="jobs_titel" defaultValue={s?.jobs_titel} placeholder="Vind jouw volgende stap." />
            <Field label="Jobs — link tekst" name="jobs_link_tekst" defaultValue={s?.jobs_link_tekst} placeholder="Alle vacatures" />
          </FormRow>
          <Field label="Contact — titel" name="contact_titel" defaultValue={s?.contact_titel} placeholder="Laten we kennismaken." />
          <Field label="Sectorbalk — één sector per regel" name="sectoren" type="textarea" rows={5} defaultValue={sectorenTekst} placeholder={"Civiele techniek\nElektrotechniek\nIT & Software"} />
        </FormSection>

        <FormSection title="Homepage — Over ons (team-kop)">
          <FormRow>
            <Field label="Titel" name="over_titel" defaultValue={s?.over_titel} placeholder="Twee founders." />
            <Field label="Titel — accent" name="over_titel_accent" defaultValue={s?.over_titel_accent} placeholder="Eén missie." />
          </FormRow>
          <Field label="Introductietekst (optioneel)" name="over_tekst" type="textarea" defaultValue={s?.over_tekst} />
        </FormSection>

        <FormSection title="SEO & Google">
          <Field label="Meta titel" name="meta_titel" defaultValue={s?.meta_titel} />
          <Field label="Meta beschrijving" name="meta_beschrijving" type="textarea" defaultValue={s?.meta_beschrijving} />
        </FormSection>

        <SaveBtn />
      </form>
    </FormShell>
  );
}
