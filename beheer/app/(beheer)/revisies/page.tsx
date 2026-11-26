import type { Metadata } from "next";
import Link from "next/link";
import Paginakop from "@/components/Paginakop";
import { vereisSessie } from "@/lib/sessie";
import { supabaseServer } from "@/lib/supabase/server";
import { STATUS, PRIORITEIT, APPARAAT, isKeuze, revisieDatum } from "@/lib/revisies";

export const metadata: Metadata = { title: "Revisies" };
export default async function Revisies({ searchParams }: { searchParams: Promise<{ status?: string; eigen?: string; p?: string }> }) {
  const sessie = await vereisSessie();
  const params = await searchParams;
  const status = params.status && isKeuze(STATUS, params.status) ? params.status : "";
  const eigen = params.eigen === "1";
  const p = Math.max(1, Math.min(10000, Number.parseInt(params.p ?? "1", 10) || 1));
  const sb = await supabaseServer();
  let query = sb.from("revisies").select("id, titel, pagina, status, prioriteit, apparaat, auteur_naam, aangemaakt", { count: "exact" }).order("aangemaakt", { ascending: false }).order("id");
  if (status) query = query.eq("status", status);
  if (eigen) query = query.eq("aangemaakt_door", sessie.id);
  const { data, count, error } = await query.range((p - 1) * 30, p * 30 - 1);
  const href = (pagina: number) => `/revisies?${new URLSearchParams({ status, eigen: eigen ? "1" : "", p: String(pagina) })}`;
  return <>
    <Paginakop titel="Revisies" accent="samen bijsturen" uitleg="Feedback en correcties op de website. Bij elke melding, reactie en statuswijziging zie je wie ze heeft toegevoegd."><Link href="/revisies/nieuw" className="knop">Revisie toevoegen</Link></Paginakop>
    <form className="flex flex-wrap items-end gap-4 mb-7" action="/revisies">
      <div className="min-w-[200px]"><label htmlFor="status-filter" className="veld-label">Status</label><select className="invoer" id="status-filter" name="status" defaultValue={status}><option value="">Alle statussen</option>{Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <label className="flex items-center gap-2 py-3"><input type="checkbox" name="eigen" value="1" defaultChecked={eigen} /> Alleen mijn meldingen</label>
      <button className="knop knop-stil">Toon revisies</button>
    </form>
    {error ? <p role="alert" className="paneel">De revisies konden niet geladen worden. Vernieuw de pagina of probeer het later opnieuw.</p> : <>
      <p className="stil mb-4">{count ?? 0} {(count ?? 0) === 1 ? "revisie" : "revisies"}{status || eigen ? " binnen deze selectie" : " in totaal"}</p>
      {!data?.length ? <section className="paneel"><h2 className="text-3xl mb-3">{status || eigen ? "Geen revisies gevonden" : "Nog geen revisies"}</h2><p className="stil max-w-[65ch]">{status || eigen ? "Pas de filters aan om andere meldingen te bekijken." : "Zie je iets dat beter kan? Voeg een revisie toe met de pagina en de gewenste correctie."}</p></section> : <ul className="glas divide-y divide-[var(--lijn)]">{data.map(r => <li key={r.id}><Link href={`/revisies/${r.id}`} className="block p-5 md:p-7 hover:bg-[var(--paneel-sterk)] transition-colors">
        <div className="flex flex-wrap justify-between gap-3 mb-2"><h2 className="font-sans! text-lg! leading-snug! font-medium! tracking-normal! break-words min-w-0">{r.titel}</h2><span className="label" data-toon={r.status === "afgerond" ? "goed" : "uit"}>{STATUS[r.status as keyof typeof STATUS]}</span></div>
        <p className="stil break-all text-sm">{r.pagina}</p><p className="mt-3 text-sm break-words">Door {r.auteur_naam} <span className="stil">op {revisieDatum(r.aangemaakt)}</span></p>
        <p className="stil text-sm mt-1">Prioriteit: {PRIORITEIT[r.prioriteit as keyof typeof PRIORITEIT]}. {APPARAAT[r.apparaat as keyof typeof APPARAAT]}.</p>
      </Link></li>)}</ul>}
      {(p > 1 || p * 30 < (count ?? 0)) && <nav aria-label="Revisiepagina’s" className="flex flex-wrap items-center gap-4 mt-6">{p > 1 && <Link className="knop knop-stil" href={href(p - 1)}>Vorige pagina</Link>}<span className="stil">Pagina {p}</span>{p * 30 < (count ?? 0) && <Link className="knop knop-stil" href={href(p + 1)}>Volgende pagina</Link>}</nav>}
    </>}
  </>;
}
