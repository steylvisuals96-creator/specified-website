import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { huidigeTaal } from "@/lib/taal-server";
import { taalAlternates } from "@/lib/taal";

const META_NL = {
  title: "Cookiebeleid | Specified",
  description: "Welke cookies Specified gebruikt en hoe je je voorkeuren beheert.",
};

const META_EN = {
  title: "Cookie policy | Specified",
  description: "Which cookies Specified uses and how you manage your preferences.",
};

export async function generateMetadata() {
  const taal = await huidigeTaal();
  const meta = taal === "en" ? META_EN : META_NL;
  return { ...meta, alternates: taalAlternates(taal, "/cookies") };
}

function CookiesPageNl() {
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
        Bij je eerste bezoek vragen we je toestemming voor niet-noodzakelijke cookies. Zolang je
        die niet geeft, laden we geen analytische scripts. Je kan je keuze op elk moment herzien
        via <strong>Cookievoorkeuren</strong> onderaan elke pagina; daarnaast kan je in je browser
        bestaande cookies verwijderen en nieuwe blokkeren.
      </p>

      <h2>4. Vragen</h2>
      <p>
        Heb je vragen over ons cookiegebruik? Neem contact op via{" "}
        <a href="mailto:info@specified.be">info@specified.be</a>. Meer over hoe we met
        persoonsgegevens omgaan, lees je in ons <Link href="/privacy">privacybeleid</Link>.
      </p>
    </LegalPage>
  );
}

function CookiesPageEn() {
  return (
    <LegalPage title="Cookie policy" updated="5 July 2026">
      <p>
        This website uses cookies and similar technologies. In this cookie policy we explain what cookies are, which ones we use and
        how you can manage your preferences.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files that are placed on your device when you visit a website. They help the site function properly
        and can remember information about your visit.
      </p>

      <h2>2. Which cookies we use</h2>
      <ul>
        <li>
          <strong>Necessary cookies:</strong> these are essential for the website to work (for example remembering your cookie
          preference). No consent is required for these.
        </li>
        <li>
          <strong>Analytics cookies:</strong> if enabled, these help us understand how visitors use the site so that we can improve
          it. They are only placed after your consent.
        </li>
      </ul>

      <h2>3. Managing your preferences</h2>
      <p>
        On your first visit we ask for your consent for non-necessary cookies. As long as you do not give it, we do not load any
        analytics scripts. You can change your choice at any time via <strong>Cookie preferences</strong> at the bottom of every page;
        you can also delete existing cookies and block new ones in your browser.
      </p>

      <h2>4. Questions</h2>
      <p>
        Do you have questions about our use of cookies? Contact us at <a href="mailto:info@specified.be">info@specified.be</a>. Read
        more about how we handle personal data in our <Link href="/en/privacy">privacy policy</Link>.
      </p>
    </LegalPage>
  );
}

export default async function CookiesPage() {
  return (await huidigeTaal()) === "en" ? <CookiesPageEn /> : <CookiesPageNl />;
}
