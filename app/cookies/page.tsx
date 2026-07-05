import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Cookiebeleid — Specified",
  description: "Welke cookies Specified gebruikt en hoe je je voorkeuren beheert.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookiebeleid" updated="5 juli 2026">
      <p>
        Deze website gebruikt cookies en vergelijkbare technologieën. In dit cookiebeleid leggen we
        uit wat cookies zijn, welke we gebruiken en hoe je je voorkeuren kan beheren.
      </p>

      <h2>1. Wat zijn cookies?</h2>
      <p>
        Cookies zijn kleine tekstbestanden die op je toestel worden geplaatst wanneer je een website
        bezoekt. Ze helpen de site correct te functioneren en kunnen informatie onthouden over je
        bezoek.
      </p>

      <h2>2. Welke cookies we gebruiken</h2>
      <ul>
        <li>
          <strong>Noodzakelijke cookies:</strong> deze zijn essentieel om de website te laten werken
          (bijvoorbeeld het onthouden van je cookievoorkeur). Hiervoor is geen toestemming vereist.
        </li>
        <li>
          <strong>Analytische cookies:</strong> indien geactiveerd, helpen deze ons begrijpen hoe
          bezoekers de site gebruiken, zodat we hem kunnen verbeteren. Deze worden pas geplaatst na
          jouw toestemming.
        </li>
      </ul>

      <h2>3. Je voorkeuren beheren</h2>
      <p>
        Bij je eerste bezoek vragen we je toestemming voor niet-noodzakelijke cookies. Je kan je
        keuze op elk moment aanpassen via de instellingen van je browser, waar je bestaande cookies
        kan verwijderen en nieuwe kan blokkeren.
      </p>

      <h2>4. Vragen</h2>
      <p>
        Heb je vragen over ons cookiegebruik? Neem contact op via{" "}
        <a href="mailto:hello@specified.be">hello@specified.be</a>. Meer over hoe we met
        persoonsgegevens omgaan, lees je in ons <a href="/privacy">privacybeleid</a>.
      </p>
    </LegalPage>
  );
}
