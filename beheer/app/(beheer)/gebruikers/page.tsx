import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import { GebruikerRij, Uitnodigen } from "@/components/Gebruikers";
import { vereisBeheerder } from "@/lib/sessie";
import { adminIngesteld, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Gebruikers" };

export default async function Gebruikers() {
  const s = await vereisBeheerder();
  const sb = await supabaseServer();
  const { data } = await sb.from("profielen").select("id, naam, rol").order("aangemaakt");
  const lijst = data ?? [];

  return (
    <>
      <Paginakop titel="Gebruikers" accent={`${lijst.length} met toegang`} vul={20} uitleg="Wie in dit beheer mag. Elk account kan tweestapslogin aanzetten bij Account." />
      {!adminIngesteld() && (
        <p className="glas px-5 py-4 mb-5 stil">Accounts aanmaken kan pas als SUPABASE_SECRET_KEY in de instellingen van het beheer staat.</p>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
        <section className="paneel">
          <ul>
            {lijst.map((g) => (
              <GebruikerRij key={g.id} g={g} ikZelf={g.id === s.id} />
            ))}
          </ul>
        </section>
        <section className="paneel blad">
          <h2 className="text-[30px] mb-5">Iemand toegang geven</h2>
          <Uitnodigen />
        </section>
      </div>
    </>
  );
}
