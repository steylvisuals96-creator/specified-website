import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Seizoensteken from "@/components/Seizoensteken";
import { isSeizoen, SEIZOENEN } from "@/lib/seizoen";

export const metadata: Metadata = { title: "Voorbeeld seizoensthema", robots: { index: false, follow: false } };
export const dynamicParams = false;

export function generateStaticParams() {
  return SEIZOENEN.flatMap((thema) => ["donker", "licht"].map((weergave) => ({ thema, weergave })));
}

export default async function SeizoenVoorbeeld({ params }: { params: Promise<{ thema: string; weergave: string }> }) {
  const { thema, weergave } = await params;
  if (!isSeizoen(thema) || (weergave !== "donker" && weergave !== "licht")) notFound();

  return (
    <main id="inhoud" className="seizoenstaal" data-seizoen={thema} data-thema={weergave}>
      <header className="seizoenstaal__kop display">Specified</header>
      <div className="seizoenstaal__blad">
        <Seizoensteken seizoen={thema} />
        <h1 className="display">We <span>engineer</span><br />possibilities.</h1>
        <span className="seizoenstaal__knop">Neem contact op</span>
      </div>
    </main>
  );
}
