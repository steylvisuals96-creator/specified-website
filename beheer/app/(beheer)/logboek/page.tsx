import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import { vereisBeheerder } from "@/lib/sessie";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Logboek" };

const TABEL: Record<string, string> = { vacatures: "Vacature", blog: "Artikel", team: "Teamlid", media: "Beeld", pagina_inhoud: "Pagina", seizoensthema: "Seizoensthema", profielen: "Gebruiker" };
const ACTIE: Record<string, string> = { nieuw: "toegevoegd", gewijzigd: "gewijzigd", verwijderd: "verwijderd" };

export default async function Logboek() {
  await vereisBeheerder();
  const sb = await supabaseServer();
  const [{ data: log }, { data: p }] = await Promise.all([
    sb.from("wijzigingen").select("id, tabel, actie, titel, wanneer, door").order("wanneer", { ascending: false }).limit(200),
    sb.from("profielen").select("id, naam"),
  ]);
  const namen = new Map((p ?? []).map((x) => [x.id, x.naam]));

  return (
    <>
      <Paginakop titel="Logboek" accent="wie wijzigde wat" vul={80} uitleg="De laatste 200 wijzigingen, automatisch bijgehouden door de database." />
      <section className="glas px-5 md:px-7 pt-6 pb-2">
        <div className="tabel-schuif">
          <table className="tabel min-w-[560px]">
            <thead>
              <tr>
                <th>Wanneer</th>
                <th>Wie</th>
                <th>Wat</th>
              </tr>
            </thead>
            <tbody>
              {(log ?? []).map((w) => (
                <tr key={w.id}>
                  <td className="text-[13px] stil whitespace-nowrap tabular-nums">
                    {new Date(w.wanneer).toLocaleString("nl-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Brussels" })}
                  </td>
                  <td className="text-[14px]">{w.door ? (namen.get(w.door) ?? "Verwijderd account") : <span className="zwak">Systeem</span>}</td>
                  <td className="text-[14px]">
                    {TABEL[w.tabel] ?? w.tabel} {ACTIE[w.actie] ?? w.actie}
                    {w.titel && <span className="stil">: {w.titel}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
