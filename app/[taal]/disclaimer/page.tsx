import LegalPage from "@/components/LegalPage";
import { huidigeTaal } from "@/lib/taal-server";
import { taalAlternates } from "@/lib/taal";

const META_NL = {
  title: "Disclaimer | Specified",
  description: "Voorwaarden voor het gebruik van de website van Specified NV.",
  alternates: { canonical: "/disclaimer" },
};

const META_EN = {
  title: "Disclaimer | Specified",
  description: "Terms of use of the Specified NV website.",
};

export async function generateMetadata() {
  const taal = await huidigeTaal();
  const meta = taal === "en" ? META_EN : META_NL;
  return { ...meta, alternates: taalAlternates(taal, "/disclaimer") };
}

function DisclaimerNl() {
  return (
    <LegalPage title="Disclaimer" updated="12 november 2026">
      <h2>1. Uitgever</h2>
      <p>
        Deze website is van <strong>Specified NV</strong>, Veldkant 31a, 2550 Kontich, België, ondernemingsnummer BE 0727.537.711.
        Je bereikt ons via <a href="mailto:info@specified.be">info@specified.be</a>.
      </p>

      <h2>2. Inhoud</h2>
      <p>
        We stellen de inhoud van deze website met zorg samen en houden ze actueel. Toch kan informatie onvolledig of verouderd zijn.
        De inhoud is algemeen van aard en is geen persoonlijk of professioneel advies. Aan de informatie op deze website, ook aan
        vacatures, kan je geen rechten ontlenen.
      </p>

      <h2>3. Aansprakelijkheid</h2>
      <p>
        Specified NV is niet aansprakelijk voor schade door het gebruik van deze website, door onjuiste of onvolledige informatie, of
        doordat de website tijdelijk niet beschikbaar is, tenzij bij opzet of zware fout.
      </p>

      <h2>4. Links naar andere websites</h2>
      <p>
        Deze website kan links bevatten naar websites van anderen. We hebben geen zeggenschap over de inhoud van die websites en zijn
        er niet voor aansprakelijk.
      </p>

      <h2>5. Intellectuele eigendom</h2>
      <p>
        Teksten, beelden, logo&apos;s en vormgeving op deze website zijn beschermd. Je mag ze niet overnemen of verspreiden zonder
        onze schriftelijke toestemming.
      </p>

      <h2>6. Toepasselijk recht</h2>
      <p>Op deze website is het Belgische recht van toepassing. Geschillen worden voorgelegd aan de bevoegde Belgische rechtbanken.</p>
    </LegalPage>
  );
}

function DisclaimerEn() {
  return (
    <LegalPage title="Disclaimer" updated="November 12, 2026">
      <h2>1. Publisher</h2>
      <p>
        This website belongs to <strong>Specified NV</strong>, Veldkant 31a, 2550 Kontich, Belgium, company number BE 0727.537.711.
        You can reach us at <a href="mailto:info@specified.be">info@specified.be</a>.
      </p>

      <h2>2. Content</h2>
      <p>
        We compile the content of this website with care and keep it up to date. Nevertheless, information may be incomplete or out
        of date. The content is general in nature and is not personal or professional advice. No rights can be derived from the
        information on this website, including job openings.
      </p>

      <h2>3. Liability</h2>
      <p>
        Specified NV is not liable for damage resulting from the use of this website, from incorrect or incomplete information, or
        from the website being temporarily unavailable, except in the case of intent or gross negligence.
      </p>

      <h2>4. Links to other websites</h2>
      <p>
        This website may contain links to websites of others. We have no control over the content of those websites and are not
        liable for them.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        Texts, images, logos and design on this website are protected. You may not copy or distribute them without our written
        permission.
      </p>

      <h2>6. Applicable law</h2>
      <p>This website is governed by Belgian law. Disputes are submitted to the competent Belgian courts.</p>
    </LegalPage>
  );
}

export default async function Disclaimer() {
  return (await huidigeTaal()) === "en" ? <DisclaimerEn /> : <DisclaimerNl />;
}
