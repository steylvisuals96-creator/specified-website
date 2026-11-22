import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import HomepageEditor from "@/components/HomepageEditor";
import TaalTabs from "@/components/TaalTabs";
import { vereisBeheerder } from "@/lib/sessie";
import { homepage, wanneer } from "@/lib/data";
import { leesTaal } from "@/lib/taal";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Homepage" };

export default async function Homepage({ searchParams }: { searchParams: Promise<{ taal?: string }> }) {
  await vereisBeheerder();
  const taal = leesTaal((await searchParams).taal);
  const { waarde, gewijzigd } = await homepage(taal);
  return (
    <div className="xl:-mr-[clamp(0rem,3vw,2rem)]">
      <Paginakop
        titel="Homepage"
        accent="teksten"
        vul={60}
        uitleg={
          <>
            Klik in een veld: het voorbeeld scrollt naar dat stuk van de website en toont je tekst meteen. Een leeg veld gebruikt de standaardtekst
            {taal === "en" ? " (in het Engels)" : ""}.
            {gewijzigd && Object.keys(waarde).length > 0 && <span className="zwak"> Laatst gewijzigd {wanneer(gewijzigd)}.</span>}
          </>
        }
      >
        <TaalTabs taal={taal} href="/homepage" />
      </Paginakop>
      {/* key: bij een andere taal een vers formulier, niet de waarden van de vorige taal. */}
      <HomepageEditor key={taal} taal={taal} waarde={waarde} websiteUrl={WEBSITE_URL} />
    </div>
  );
}
