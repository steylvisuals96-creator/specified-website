import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Paginakop from "@/components/Paginakop";
import PaginaEditor from "@/components/PaginaEditor";
import { vereisBeheerder } from "@/lib/sessie";
import { paginaVanSchema } from "@/lib/paginas-server";
import { supabaseServer } from "@/lib/supabase/server";
import { wanneer } from "@/lib/data";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Pagina" };

export default async function PaginaBewerken({ params }: { params: Promise<{ sleutel: string }> }) {
  await vereisBeheerder();
  const { sleutel } = await params;
  if (!/^[a-z-]{2,40}$/.test(sleutel)) notFound();
  const def = await paginaVanSchema(sleutel);
  if (!def) notFound();
  const sb = await supabaseServer();
  const { data } = await sb.from("pagina_inhoud").select("waarde, gewijzigd").eq("sleutel", sleutel).maybeSingle();

  return (
    <div className="xl:-mr-[clamp(0rem,3vw,2rem)]">
      <Paginakop
        titel={def.titel}
        terug={{ href: "/paginas", label: "Alle pagina's" }}
        vul={60}
        uitleg={
          <>
            {def.uitleg ? `${def.uitleg} ` : ""}Klik in een veld: het voorbeeld scrollt naar dat stuk. Een leeg veld gebruikt de standaardtekst (grijs).
            {data?.gewijzigd && Object.keys(data.waarde ?? {}).length > 0 && <span className="zwak"> Laatst gewijzigd {wanneer(data.gewijzigd)}.</span>}
          </>
        }
      />
      <PaginaEditor def={def} waarde={(data?.waarde as Record<string, unknown>) ?? {}} websiteUrl={WEBSITE_URL} />
    </div>
  );
}
