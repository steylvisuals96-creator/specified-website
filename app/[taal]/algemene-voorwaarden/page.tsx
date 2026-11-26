import LegalPage from "@/components/LegalPage";
import { huidigeTaal } from "@/lib/taal-server";
import { taalAlternates } from "@/lib/taal";

// Niet indexeren zolang de tekst van Specified er niet staat.
const META_NL = {
  title: "Algemene voorwaarden | Specified",
  description: "De algemene voorwaarden van Specified NV.",
  alternates: { canonical: "/algemene-voorwaarden" },
  robots: { index: false },
};

const META_EN = {
  title: "Terms and conditions | Specified",
  description: "The general terms and conditions of Specified NV.",
  robots: { index: false },
};

export async function generateMetadata() {
  const taal = await huidigeTaal();
  const meta = taal === "en" ? META_EN : META_NL;
  return { ...meta, alternates: taalAlternates(taal, "/algemene-voorwaarden") };
}

function AlgemeneVoorwaardenNl() {
  return (
    <LegalPage title="Algemene voorwaarden" updated="12 november 2026">
      <p>
        De algemene voorwaarden van <strong>Specified NV</strong> (Veldkant 31a, 2550 Kontich, ondernemingsnummer BE 0727.537.711)
        worden binnenkort op deze pagina gepubliceerd.
      </p>
      <p>
        Wil je ze nu al ontvangen? Vraag ze op via <a href="mailto:info@specified.be">info@specified.be</a>.
      </p>
    </LegalPage>
  );
}

function AlgemeneVoorwaardenEn() {
  return (
    <LegalPage title="Terms and conditions" updated="November 12, 2026">
      <p>
        The general terms and conditions of <strong>Specified NV</strong> (Veldkant 31a, 2550 Kontich, company number BE 0727.537.711)
        will be published on this page soon.
      </p>
      <p>
        Would you like to receive them now? Request them via <a href="mailto:info@specified.be">info@specified.be</a>.
      </p>
    </LegalPage>
  );
}

export default async function AlgemeneVoorwaarden() {
  return (await huidigeTaal()) === "en" ? <AlgemeneVoorwaardenEn /> : <AlgemeneVoorwaardenNl />;
}
