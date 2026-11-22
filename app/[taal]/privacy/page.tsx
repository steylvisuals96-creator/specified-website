import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { huidigeTaal } from "@/lib/taal-server";
import { taalAlternates } from "@/lib/taal";

const META_NL = {
  title: "Privacybeleid — Specified",
  description: "Hoe Specified NV omgaat met je persoonsgegevens conform de GDPR.",
};

const META_EN = {
  title: "Privacy policy — Specified",
  description: "How Specified NV handles your personal data in accordance with the GDPR.",
};

export async function generateMetadata() {
  const taal = await huidigeTaal();
  const meta = taal === "en" ? META_EN : META_NL;
  return { ...meta, alternates: taalAlternates(taal, "/privacy") };
}

function PrivacyPageNl() {
  return (
    <LegalPage title="Privacybeleid" updated="5 juli 2026">
      <p>
        Specified NV hecht veel belang aan de bescherming van je persoonsgegevens en respecteert
        je privacy. In dit privacybeleid leggen we uit welke gegevens we verzamelen, waarom, en
        welke rechten je hebt. Dit beleid is opgesteld conform de Algemene Verordening
        Gegevensbescherming (GDPR / AVG).
      </p>

      <h2>1. Verwerkingsverantwoordelijke</h2>
      <p>
        <strong>Specified NV</strong>, met maatschappelijke zetel te Veldkant 31a, 2550 Kontich, België.
        Ondernemingsnummer: BE 0727.537.711. Voor alle vragen over dit beleid kan je ons
        bereiken via <a href="mailto:info@specified.be">info@specified.be</a>.
      </p>

      <h2>2. Welke gegevens we verzamelen</h2>
      <p>Afhankelijk van je interactie met ons verzamelen we:</p>
      <ul>
        <li><strong>Contactgegevens:</strong> naam, e-mailadres, telefoonnummer.</li>
        <li><strong>Sollicitatiegegevens:</strong> cv, functietitel, ervaring, sector en beschikbaarheid wanneer je solliciteert of je kandidaat stelt.</li>
        <li><strong>Bedrijfsgegevens:</strong> contactpersoon en bedrijfsgegevens wanneer je als opdrachtgever contact opneemt.</li>
        <li><strong>Technische gegevens:</strong> beperkte, geanonimiseerde gebruiksgegevens van de website (zie ons <Link href="/cookies">cookiebeleid</Link>).</li>
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
        Je kan deze rechten uitoefenen via <a href="mailto:info@specified.be">info@specified.be</a>.
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

function PrivacyPageEn() {
  return (
    <LegalPage title="Privacy policy" updated="5 July 2026">
      <p>
        Specified NV attaches great importance to protecting your personal data and respects your privacy. In this privacy policy we
        explain which data we collect, why, and which rights you have. This policy has been drawn up in accordance with the General
        Data Protection Regulation (GDPR). In case of differences, the Dutch version prevails.
      </p>

      <h2>1. Data controller</h2>
      <p>
        <strong>Specified NV</strong>, with registered office at Veldkant 31a, 2550 Kontich, Belgium. Company number: BE 0727.537.711.
        For any questions about this policy you can reach us at <a href="mailto:info@specified.be">info@specified.be</a>.
      </p>

      <h2>2. What data we collect</h2>
      <p>Depending on your interaction with us, we collect:</p>
      <ul>
        <li><strong>Contact details:</strong> name, email address, phone number.</li>
        <li><strong>Application data:</strong> CV, job title, experience, sector and availability when you apply or put yourself forward as a candidate.</li>
        <li><strong>Company data:</strong> contact person and company details when you contact us as a client.</li>
        <li><strong>Technical data:</strong> limited, anonymised usage data of the website (see our <Link href="/en/cookies">cookie policy</Link>).</li>
      </ul>

      <h2>3. Purposes and legal basis</h2>
      <p>We only process your data for:</p>
      <ul>
        <li>Answering your question or contact request (legal basis: your consent or our legitimate interest).</li>
        <li>Guiding applications and matching candidates with vacancies (legal basis: performance of a contract or your consent).</li>
        <li>Maintaining the relationship with clients (legal basis: performance of a contract).</li>
      </ul>

      <h2>4. Retention period</h2>
      <p>
        We do not keep your data longer than necessary for the purposes for which it was collected. We keep application data for a
        maximum of 2 years after the last contact, unless you ask us to delete it sooner.
      </p>

      <h2>5. Sharing with third parties</h2>
      <p>
        We never sell your data. We only share it with clients in the context of a specific application (and only with your
        knowledge), and with processors who help us deliver the service (such as hosting and email), who are contractually bound to
        confidentiality.
      </p>

      <h2>6. Your rights</h2>
      <p>Under the GDPR you have the right to:</p>
      <ul>
        <li>Access the data we hold about you;</li>
        <li>Correction of inaccurate data;</li>
        <li>Erasure of your data (&quot;right to be forgotten&quot;);</li>
        <li>Restriction of or objection to the processing;</li>
        <li>Portability of your data.</li>
      </ul>
      <p>
        You can exercise these rights via <a href="mailto:info@specified.be">info@specified.be</a>. If you are not satisfied with how
        we handle your data, you can lodge a complaint with the Belgian Data Protection Authority (
        <a href="https://www.dataprotectionauthority.be" target="_blank" rel="noopener noreferrer">dataprotectionauthority.be</a>).
      </p>

      <h2>7. Changes</h2>
      <p>We may amend this privacy policy from time to time. The most recent version can always be found on this page.</p>
    </LegalPage>
  );
}

export default async function PrivacyPage() {
  return (await huidigeTaal()) === "en" ? <PrivacyPageEn /> : <PrivacyPageNl />;
}
