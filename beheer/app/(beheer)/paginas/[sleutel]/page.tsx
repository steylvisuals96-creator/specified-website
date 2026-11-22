import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Paginakop from "@/components/Paginakop";
import PaginaEditor from "@/components/PaginaEditor";
import TaalTabs from "@/components/TaalTabs";
import { vereisBeheerder } from "@/lib/sessie";
import { paginaVanSchema } from "@/lib/paginas-server";
import { supabaseServer } from "@/lib/supabase/server";
import { wanneer } from "@/lib/data";
import { leesTaal, metTaal, rijSleutel } from "@/lib/taal";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Pagina" };

export default async function PaginaBewerken({ params, searchParams }: { params: Promise<{ sleutel: string }>; searchParams: Promise<{ taal?: string }> }) {
  await vereisBeheerder();
  const { sleutel } = await params;
  const taal = leesTaal((await searchParams).taal);
  if (!/^[a-z-]{2,40}$/.test(sleutel)) notFound();
  const def = await paginaVanSchema(sleutel, taal);
  if (!def) notFound();
  const sb = await supabaseServer();
  const { data } = await sb.from("pagina_inhoud").select("waarde, gewijzigd").eq("sleutel", rijSleutel(sleutel, taal)).maybeSingle();

  return (
    <div className="xl:-mr-[clamp(0rem,3vw,2rem)]">
      <Paginakop
        titel={def.titel}
        terug={{ href: metTaal("/paginas", taal), label: "Alle pagina's" }}
        vul={60}
        uitleg={
          <>
            {def.uitleg ? `${def.uitleg} ` : ""}Klik in een veld: het voorbeeld scrollt naar dat stuk. Een leeg veld gebruikt de standaardtekst
            {taal === "en" ? " in het Engels" : ""} (grijs).
            {data?.gewijzigd && Object.keys(data.waarde ?? {}).length > 0 && <span className="zwak"> Laatst gewijzigd {wanneer(data.gewijzigd)}.</span>}
          </>
        }
      >
        <TaalTabs taal={taal} href={`/paginas/${sleutel}`} />
      </Paginakop>
      <PaginaEditor key={taal} taal={taal} def={def} waarde={(data?.waarde as Record<string, unknown>) ?? {}} websiteUrl={WEBSITE_URL} />
    </div>
  );
}
