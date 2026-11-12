import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Disclaimer — Specified",
  description: "Voorwaarden voor het gebruik van de website van Specified NV.",
  alternates: { canonical: "/disclaimer" },
};

export default function Disclaimer() {
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
