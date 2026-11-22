import type { Metadata } from "next";
import Link from "next/link";
import Paginakop from "@/components/Paginakop";
import TaalTabs from "@/components/TaalTabs";
import { vereisBeheerder } from "@/lib/sessie";
import { paginaSchema } from "@/lib/paginas-server";
import { supabaseServer } from "@/lib/supabase/server";
import { wanneer } from "@/lib/data";
import { leesTaal, metTaal, rijSleutel } from "@/lib/taal";

export const metadata: Metadata = { title: "Pagina's" };

export default async function Paginas({ searchParams }: { searchParams: Promise<{ taal?: string }> }) {
  await vereisBeheerder();
  const taal = leesTaal((await searchParams).taal);
  const [schema, { data }] = await Promise.all([paginaSchema(taal), (await supabaseServer()).from("pagina_inhoud").select("sleutel, waarde, gewijzigd")]);
  const rijen = new Map((data ?? []).map((r) => [r.sleutel, r]));
  const rij = (s: string) => rijen.get(rijSleutel(s, taal));
  const aangepast = (s: string) => Object.keys((rij(s)?.waarde as object) ?? {}).length > 0;

  return (
    <>
      <Paginakop
        titel="Pagina's"
        accent="teksten"
        vul={55}
        uitleg="Elke pagina van de website, met het voorbeeld ernaast. Klik je in het voorbeeld op een link, dan ga je naar de editor van die pagina. Met English pas je de teksten van de Engelse website aan (onder /en)."
      >
        <TaalTabs taal={taal} href="/paginas" />
      </Paginakop>
      {schema.length === 0 && <p className="glas px-5 py-4 mb-5 stil">De website is even niet bereikbaar, dus de lijst met pagina&apos;s kan niet geladen worden. Probeer het zo opnieuw.</p>}
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <li>
          <Link href={metTaal("/homepage", taal)} className="paneel blad block h-full hover:border-[var(--streep)]">
            <p className="kop text-[30px]">Homepage</p>
            <p className="text-[13px] zwak mt-1">{taal === "en" ? "/en" : "/"}</p>
            <p className="label mt-4" data-toon={aangepast("homepage") ? "goed" : "uit"}>
              {aangepast("homepage") ? `Aangepast ${wanneer(rij("homepage")?.gewijzigd)}` : "Standaardteksten"}
            </p>
          </Link>
        </li>
        {schema.map((p) => (
          <li key={p.sleutel}>
            <Link href={metTaal(`/paginas/${p.sleutel}`, taal)} className="paneel block h-full hover:border-[var(--streep)]">
              <p className="kop text-[30px]">{p.titel}</p>
              <p className="text-[13px] zwak mt-1">{p.pad ?? "op meerdere pagina's"}</p>
              <p className="label mt-4" data-toon={aangepast(p.sleutel) ? "goed" : "uit"}>
                {aangepast(p.sleutel) ? `Aangepast ${wanneer(rij(p.sleutel)?.gewijzigd)}` : "Standaardteksten"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
