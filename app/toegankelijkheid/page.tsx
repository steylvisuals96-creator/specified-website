import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Toegankelijkheidsverklaring — Specified",
  description: "Hoe Specified NV werkt aan een website die voor iedereen bruikbaar is.",
  alternates: { canonical: "/toegankelijkheid" },
};

export default function Toegankelijkheid() {
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
