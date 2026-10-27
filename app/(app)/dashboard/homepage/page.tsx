export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import FormShell, { Field, FormSection, FormRow, SaveBtn } from "@/components/FormShell";
import { LimeBtn } from "@/components/DashboardShell";
import LiveEditor from "@/components/LiveEditor";
import ProfielenLijst from "@/components/ProfielenLijst";
import { unflatten } from "@/lib/vormdata";
import { isBeheerder } from "@/lib/access";

const configPromise = import("@payload-config").then((m) => m.default);

const LETTERS = ["S", "P", "E", "C", "I", "F", "I", "E", "D"];

export default async function HomepageEditor({ searchParams }: { searchParams: Promise<{ opgeslagen?: string; fout?: string }> }) {
  const { opgeslagen, fout } = await searchParams;
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  // De homepage past alleen een beheerder aan; consultants werken aan kandidaten, vacatures en blog.
  if (!isBeheerder(user)) redirect("/dashboard");

  const w: any = await (payload as any).findGlobal({ slug: "website" }).catch(() => ({}));

  async function save(fd: FormData) {
    "use server";
    const { payload: p, user: u, als } = await payloadAlsGebruiker();
    if (!isBeheerder(u)) throw new Error("Geen toegang.");
    let melding = "";
    try {
      await (p as any).updateGlobal({ ...als, slug: "website", data: unflatten(fd.entries() as Iterable<[string, unknown]>) });
    } catch (e: any) {
      // Payload geeft per veld een melding; die staan in het Nederlands in de veldregels.
      const velden: string[] = (e?.data?.errors ?? []).map((x: any) => x?.message).filter(Boolean);
      melding = (velden.length ? velden.join(" ") : "Opslaan is niet gelukt. Probeer het opnieuw.").slice(0, 300);
    }
    revalidatePath("/dashboard/homepage");
    redirect(melding ? `/dashboard/homepage?fout=${encodeURIComponent(melding)}` : "/dashboard/homepage?opgeslagen=1");
  }

  const profielen: string[] = (w.consultants?.profielen ?? []).map((x: any) => x.naam).filter(Boolean);
  const callouts: { label?: string; tekst?: string }[] = w.callouts ?? [];

  return (
    <FormShell
      wide
      activePath="/dashboard/homepage"
      userName={(user as any).naam || user.email}
      rol={(user as any).rol}
      title="Homepage"
      backHref="/dashboard"
      actions={<><LimeBtn href="/dashboard/homepage/pagina" outline>Op de pagina bewerken</LimeBtn><SaveBtn form="main-form" /></>}
    >
      <LiveEditor soort="homepage" voorbeeldPad="/voorbeeld/home">
        <form id="main-form" action={save}>
          {opgeslagen && (
            <p style={{ background: "rgba(155,209,127,0.12)", border: "1px solid #9bd17f66", color: "#9bd17f", padding: "0.6rem 0.9rem", borderRadius: "2px", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Opgeslagen. De site toont het binnen een minuut.
            </p>
          )}
          {fout && (
            <p role="alert" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid #ef444466", color: "#f87171", padding: "0.6rem 0.9rem", borderRadius: "2px", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Niet opgeslagen: {fout}
            </p>
          )}
          <p style={{ fontSize: "0.8125rem", color: "var(--bone-400)", marginBottom: "1.5rem" }}>
            Wat je hier aanpast, zie je rechts meteen. Een leeg veld toont de standaardtekst van de website. De tekening bovenaan bouwt zich opnieuw op als je even stopt met typen.
          </p>

          <FormSection title="Kop bovenaan">
            <FormRow>
              <Field label="Eerste woord" name="hero.prefix" defaultValue={w.hero?.prefix} maxLength={20} />
              <Field label="Accentwoord (in limoen)" name="hero.woord" defaultValue={w.hero?.woord} maxLength={24} />
            </FormRow>
            <Field label="Tweede regel" name="hero.suffix" defaultValue={w.hero?.suffix} maxLength={30} />
            <FormRow>
              <Field label="Knop voor bedrijven" name="hero.ctaBedrijven" defaultValue={w.hero?.ctaBedrijven} maxLength={40} />
              <Field label="Knop voor engineers" name="hero.ctaEngineers" defaultValue={w.hero?.ctaEngineers} maxLength={40} />
            </FormRow>
          </FormSection>

          <FormSection title="Technische tekening">
            <Field label="Inleiding" name="tekening.intro" type="textarea" rows={2} defaultValue={w.tekening?.intro} maxLength={140} />
            <Field label="Scrollhint" name="tekening.scrollHint" defaultValue={w.tekening?.scrollHint} maxLength={60} />
            <FormRow>
              <Field label="Titelblok: project" name="tekening.project" defaultValue={w.tekening?.project} maxLength={40} />
              <Field label="Titelblok: locatie (stad, regio)" name="tekening.locatie" defaultValue={w.tekening?.locatie} maxLength={40} placeholder="Kontich, Antwerpen" pattern=".+, .+" title="Schrijf stad en regio gescheiden door een komma en een spatie, bv. Kontich, Antwerpen." />
            </FormRow>
            <FormRow>
              <Field label="Titelblok: waarden" name="tekening.waarden" defaultValue={w.tekening?.waarden} maxLength={40} />
              <Field label="Titelblok: goedkeuring" name="tekening.akkoord" defaultValue={w.tekening?.akkoord} maxLength={40} />
            </FormRow>
          </FormSection>

          <FormSection title="Letters van SPECIFIED">
            <p style={{ fontSize: "0.8125rem", color: "var(--bone-400)", marginBottom: "1rem" }}>
              Negen regels, één per letter, in volgorde. Het label begint met de letter.
            </p>
            {LETTERS.map((letter, i) => (
              <FormRow key={i}>
                <Field label={`${i + 1}. ${letter}: label`} name={`callouts.${i}.label`} defaultValue={callouts[i]?.label} maxLength={24} />
                <Field label="Toelichting" name={`callouts.${i}.tekst`} defaultValue={callouts[i]?.tekst} maxLength={44} />
              </FormRow>
            ))}
          </FormSection>

          <FormSection title="Onze consultants">
            <FormRow>
              <Field label="Titel" name="consultants.titel" defaultValue={w.consultants?.titel} maxLength={20} />
              <Field label="Accentwoord (in limoen)" name="consultants.accent" defaultValue={w.consultants?.accent} maxLength={24} />
            </FormRow>
            <Field label="Tekst" name="consultants.tekst" type="textarea" rows={3} defaultValue={w.consultants?.tekst} maxLength={220} />
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", marginBottom: "0.5rem" }}>Profielen (schuiven mee met de scroll)</div>
            <ProfielenLijst prefix="consultants.profielen" startwaarden={profielen} />
          </FormSection>

          <FormSection title="Blok: voor bedrijven">
            <FormRow>
              <Field label="Kop" name="diensten_bedrijven.kop" defaultValue={w.diensten_bedrijven?.kop} maxLength={30} />
              <Field label="Knop" name="diensten_bedrijven.cta" defaultValue={w.diensten_bedrijven?.cta} maxLength={40} />
            </FormRow>
            <Field label="Titel" name="diensten_bedrijven.titel" defaultValue={w.diensten_bedrijven?.titel} maxLength={60} />
            <Field label="Tekst" name="diensten_bedrijven.tekst" type="textarea" rows={5} defaultValue={w.diensten_bedrijven?.tekst} maxLength={450} />
          </FormSection>

          <FormSection title="Blok: voor engineers">
            <FormRow>
              <Field label="Kop" name="diensten_engineers.kop" defaultValue={w.diensten_engineers?.kop} maxLength={30} />
              <Field label="Knop" name="diensten_engineers.cta" defaultValue={w.diensten_engineers?.cta} maxLength={40} />
            </FormRow>
            <Field label="Titel" name="diensten_engineers.titel" defaultValue={w.diensten_engineers?.titel} maxLength={60} />
            <Field label="Tekst" name="diensten_engineers.tekst" type="textarea" rows={5} defaultValue={w.diensten_engineers?.tekst} maxLength={450} />
          </FormSection>

          <FormSection title="Vacatures op de homepage">
            <FormRow>
              <Field label="Titel" name="jobs.titel" defaultValue={w.jobs?.titel} maxLength={40} />
              <Field label="Link naar alle vacatures" name="jobs.linkTekst" defaultValue={w.jobs?.linkTekst} maxLength={40} />
            </FormRow>
          </FormSection>

          <FormSection title="Contact en footer">
            <p style={{ fontSize: "0.8125rem", color: "var(--bone-400)", marginBottom: "1rem" }}>
              Staat in het contactblok en onderaan elke pagina. Een leeg telefoonveld verbergt het nummer.
            </p>
            <FormRow>
              <Field label="Contact-e-mail" name="contact.email" type="email" defaultValue={w.contact?.email} placeholder="info@specified.be" maxLength={120} />
              <Field label="Telefoon" name="contact.telefoon" type="tel" defaultValue={w.contact?.telefoon} placeholder="+32 3 123 45 67" maxLength={30} pattern="\+?[0-9 \(\)\.\/\-]{6,30}" title="Alleen cijfers, spaties en + ( ) . / -" />
            </FormRow>
            <Field label="LinkedIn-pagina" name="contact.linkedin" type="url" defaultValue={w.contact?.linkedin} placeholder="https://www.linkedin.com/company/specified-be" maxLength={200} pattern="https://([a-zA-Z]+\.)?linkedin\.com/.*" title="Het volledige adres, beginnend met https://www.linkedin.com/" />
            <Field label="Regel onderaan (footer)" name="contact.footerTekst" defaultValue={w.contact?.footerTekst} placeholder="© 2026 Specified BV, Kontich, België" maxLength={120} />
          </FormSection>

          <SaveBtn />
        </form>
      </LiveEditor>
    </FormShell>
  );
}
