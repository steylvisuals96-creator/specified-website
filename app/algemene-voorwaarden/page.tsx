import LegalPage from "@/components/LegalPage";

// Niet indexeren zolang de tekst van Specified er niet staat.
export const metadata = {
  title: "Algemene voorwaarden — Specified",
  description: "De algemene voorwaarden van Specified NV.",
  alternates: { canonical: "/algemene-voorwaarden" },
  robots: { index: false },
};

export default function AlgemeneVoorwaarden() {
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
