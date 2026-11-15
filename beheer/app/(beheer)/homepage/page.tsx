import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import HomepageEditor from "@/components/HomepageEditor";
import { vereisBeheerder } from "@/lib/sessie";
import { homepage, wanneer } from "@/lib/data";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Homepage" };

export default async function Homepage() {
  await vereisBeheerder();
  const { waarde, gewijzigd } = await homepage();
  return (
    <div className="xl:-mr-[clamp(0rem,3vw,2rem)]">
      <Paginakop
        titel="Homepage"
        accent="teksten"
        vul={60}
        uitleg={
          <>
            Klik in een veld: het voorbeeld rechts scrollt naar dat stuk van de website en toont je tekst meteen. Een leeg veld gebruikt de standaardtekst.
            {gewijzigd && <span className="zwak"> Laatst gewijzigd {wanneer(gewijzigd)}.</span>}
          </>
        }
      />
      <HomepageEditor waarde={waarde} websiteUrl={WEBSITE_URL} />
    </div>
  );
}
