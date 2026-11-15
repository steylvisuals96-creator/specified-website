import type { Metadata } from "next";
import Link from "next/link";
import Paginakop from "@/components/Paginakop";
import { vereisBeheerder } from "@/lib/sessie";
import { paginaSchema } from "@/lib/paginas-server";
import { supabaseServer } from "@/lib/supabase/server";
import { wanneer } from "@/lib/data";

export const metadata: Metadata = { title: "Pagina's" };

export default async function Paginas() {
  await vereisBeheerder();
  const [schema, { data }] = await Promise.all([paginaSchema(), (await supabaseServer()).from("pagina_inhoud").select("sleutel, waarde, gewijzigd")]);
  const rijen = new Map((data ?? []).map((r) => [r.sleutel, r]));
  const aangepast = (s: string) => Object.keys((rijen.get(s)?.waarde as object) ?? {}).length > 0;

  return (
    <>
      <Paginakop titel="Pagina's" accent="teksten" vul={55} uitleg="Elke pagina van de website, met het voorbeeld ernaast. Klik je in het voorbeeld op een link, dan ga je naar de editor van die pagina." />
      {schema.length === 0 && <p className="glas px-5 py-4 mb-5 stil">De website is even niet bereikbaar, dus de lijst met pagina&apos;s kan niet geladen worden. Probeer het zo opnieuw.</p>}
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <li>
          <Link href="/homepage" className="paneel blad block h-full hover:border-[var(--streep)]">
            <p className="kop text-[30px]">Homepage</p>
            <p className="text-[13px] zwak mt-1">/</p>
            <p className="label mt-4" data-toon="goed">
              Teksten van de startpagina
            </p>
          </Link>
        </li>
        {schema.map((p) => (
          <li key={p.sleutel}>
            <Link href={`/paginas/${p.sleutel}`} className="paneel block h-full hover:border-[var(--streep)]">
              <p className="kop text-[30px]">{p.titel}</p>
              <p className="text-[13px] zwak mt-1">{p.pad ?? "op meerdere pagina's"}</p>
              <p className="label mt-4" data-toon={aangepast(p.sleutel) ? "goed" : "uit"}>
                {aangepast(p.sleutel) ? `Aangepast ${wanneer(rijen.get(p.sleutel)?.gewijzigd)}` : "Standaardteksten"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
