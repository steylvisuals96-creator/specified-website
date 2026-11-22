import LegalPage from "@/components/LegalPage";
import { huidigeTaal } from "@/lib/taal-server";
import { taalAlternates } from "@/lib/taal";

const META_NL = {
  title: "Toegankelijkheidsverklaring — Specified",
  description: "Hoe Specified NV werkt aan een website die voor iedereen bruikbaar is.",
  alternates: { canonical: "/toegankelijkheid" },
};

const META_EN = {
  title: "Accessibility statement — Specified",
  description: "How Specified NV works on a website that everyone can use.",
};

export async function generateMetadata() {
  const taal = await huidigeTaal();
  const meta = taal === "en" ? META_EN : META_NL;
  return { ...meta, alternates: taalAlternates(taal, "/toegankelijkheid") };
}

function ToegankelijkheidNl() {
  return (
    <LegalPage title="Toegankelijkheid" updated="12 november 2026">
      <h2>1. Ons streven</h2>
      <p>
        Specified NV wil dat iedereen deze website kan gebruiken, ook mensen met een visuele, auditieve, motorische of cognitieve
        beperking. We streven naar de richtlijnen voor toegankelijke webinhoud WCAG 2.1, niveau AA.
      </p>

      <h2>2. Wat we doen</h2>
      <ul>
        <li>De website is volledig met het toetsenbord te bedienen, met een zichtbare focus en een link om naar de inhoud te springen.</li>
        <li>Teksten hebben voldoende contrast, in het donkere en in het lichte thema.</li>
        <li>Wie in het besturingssysteem kiest voor minder beweging, krijgt een stilstaande versie zonder animaties.</li>
        <li>Formulieren hebben duidelijke labels en melden fouten in tekst.</li>
        <li>De inhoud blijft leesbaar tot 200 procent zoom en op kleine schermen.</li>
      </ul>

      <h2>3. Bekende beperkingen</h2>
      <p>
        De website is nog niet door een onafhankelijke partij getoetst. Het kan dat een onderdeel nog niet volledig voldoet. We
        verbeteren wat we vinden of wat je ons meldt.
      </p>

      <h2>4. Een probleem melden</h2>
      <p>
        Loop je ergens tegenaan? Mail naar <a href="mailto:info@specified.be">info@specified.be</a> en vermeld de pagina en wat er
        misging.
      </p>
    </LegalPage>
  );
}

function ToegankelijkheidEn() {
  return (
    <LegalPage title="Accessibility" updated="12 November 2026">
      <h2>1. Our aim</h2>
      <p>
        Specified NV wants everyone to be able to use this website, including people with a visual, auditory, motor or cognitive
        impairment. We aim to meet the Web Content Accessibility Guidelines WCAG 2.1, level AA.
      </p>

      <h2>2. What we do</h2>
      <ul>
        <li>The website can be fully operated with the keyboard, with a visible focus and a link to skip to the content.</li>
        <li>Texts have sufficient contrast, in both the dark and the light theme.</li>
        <li>If you choose reduced motion in your operating system, you get a still version without animations.</li>
        <li>Forms have clear labels and report errors in text.</li>
        <li>The content remains readable up to 200 percent zoom and on small screens.</li>
      </ul>

      <h2>3. Known limitations</h2>
      <p>
        The website has not yet been tested by an independent party. Some parts may not yet fully comply. We fix what we find or
        what you report to us.
      </p>

      <h2>4. Reporting a problem</h2>
      <p>
        Running into a problem? Email <a href="mailto:info@specified.be">info@specified.be</a> and mention the page and what went
        wrong.
      </p>
    </LegalPage>
  );
}

export default async function Toegankelijkheid() {
  return (await huidigeTaal()) === "en" ? <ToegankelijkheidEn /> : <ToegankelijkheidNl />;
}
