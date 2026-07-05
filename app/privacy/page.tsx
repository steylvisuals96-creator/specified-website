import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Privacybeleid — Specified",
  description: "Hoe Specified BV omgaat met je persoonsgegevens conform de GDPR.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacybeleid" updated="5 juli 2026">
      <p>
        Specified BV hecht veel belang aan de bescherming van je persoonsgegevens en respecteert
        je privacy. In dit privacybeleid leggen we uit welke gegevens we verzamelen, waarom, en
        welke rechten je hebt. Dit beleid is opgesteld conform de Algemene Verordening
        Gegevensbescherming (GDPR / AVG).
      </p>

      <h2>1. Verwerkingsverantwoordelijke</h2>
      <p>
        <strong>Specified BV</strong>, met maatschappelijke zetel te Kontich, België.
        Ondernemingsnummer: BE 0XXX.XXX.XXX. Voor alle vragen over dit beleid kan je ons
        bereiken via <a href="mailto:hello@specified.be">hello@specified.be</a>.
      </p>

      <h2>2. Welke gegevens we verzamelen</h2>
      <p>Afhankelijk van je interactie met ons verzamelen we:</p>
      <ul>
        <li><strong>Contactgegevens:</strong> naam, e-mailadres, telefoonnummer.</li>
        <li><strong>Sollicitatiegegevens:</strong> cv, functietitel, ervaring, sector en beschikbaarheid wanneer je solliciteert of je kandidaat stelt.</li>
        <li><strong>Bedrijfsgegevens:</strong> contactpersoon en bedrijfsgegevens wanneer je als opdrachtgever contact opneemt.</li>
        <li><strong>Technische gegevens:</strong> beperkte, geanonimiseerde gebruiksgegevens van de website (zie ons <a href="/cookies">cookiebeleid</a>).</li>
      </ul>

      <h2>3. Doeleinden en rechtsgrond</h2>
      <p>We verwerken je gegevens uitsluitend voor:</p>
      <ul>
        <li>Het beantwoorden van je vraag of contactverzoek (rechtsgrond: jouw toestemming of ons gerechtvaardigd belang).</li>
        <li>Het begeleiden van sollicitaties en het matchen van kandidaten met vacatures (rechtsgrond: uitvoering van een overeenkomst of jouw toestemming).</li>
        <li>Het onderhouden van de relatie met opdrachtgevers (rechtsgrond: uitvoering van een overeenkomst).</li>
      </ul>

      <h2>4. Bewaartermijn</h2>
      <p>
        We bewaren je gegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn
        verzameld. Sollicitatiegegevens bewaren we maximaal 2 jaar na het laatste contact, tenzij
        je ons vraagt ze eerder te verwijderen.
      </p>

      <h2>5. Delen met derden</h2>
      <p>
        We verkopen je gegevens nooit. We delen ze enkel met opdrachtgevers in het kader van een
        concrete sollicitatie (en enkel met jouw medeweten), en met verwerkers die ons helpen de
        dienst te leveren (zoals hosting en e-mail), die contractueel gebonden zijn aan
        vertrouwelijkheid.
      </p>

      <h2>6. Je rechten</h2>
      <p>Onder de GDPR heb je het recht op:</p>
      <ul>
        <li>Inzage in de gegevens die we over je bewaren;</li>
        <li>Correctie van onjuiste gegevens;</li>
        <li>Verwijdering van je gegevens ("recht om vergeten te worden");</li>
        <li>Beperking van of bezwaar tegen de verwerking;</li>
        <li>Overdraagbaarheid van je gegevens.</li>
      </ul>
      <p>
        Je kan deze rechten uitoefenen via <a href="mailto:hello@specified.be">hello@specified.be</a>.
        Ben je niet tevreden over hoe we met je gegevens omgaan, dan kan je klacht indienen bij de
        Belgische Gegevensbeschermingsautoriteit (<a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener noreferrer">gegevensbeschermingsautoriteit.be</a>).
      </p>

      <h2>7. Wijzigingen</h2>
      <p>
        We kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest recente versie vind je
        steeds op deze pagina.
      </p>
    </LegalPage>
  );
}
