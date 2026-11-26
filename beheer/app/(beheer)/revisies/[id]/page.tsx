import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Paginakop from "@/components/Paginakop";
import { RevisieOpvolgen, RevisieReactie } from "@/components/RevisieFormulieren";
import { vereisSessie, isBeheerder } from "@/lib/sessie";
import { supabaseServer } from "@/lib/supabase/server";
import { uuidOfNull } from "@/lib/formulier";
import { STATUS, PRIORITEIT, APPARAAT, revisieDatum, revisiePad } from "@/lib/revisies";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Revisie bekijken" };
export default async function Revisie({ params }: { params: Promise<{ id: string }> }) {
  const sessie = await vereisSessie();
  const id = uuidOfNull((await params).id);
  if (!id) notFound();
  const sb = await supabaseServer();
  const [{ data: r, error }, { data: reacties, error: reactieFout }, { data: activiteiten, error: activiteitFout }] = await Promise.all([
    sb.from("revisies").select("*").eq("id", id).maybeSingle(),
    sb.from("revisie_reacties").select("id, auteur_naam, tekst, aangemaakt").eq("revisie_id", id).order("aangemaakt").limit(500),
    sb.from("revisie_activiteiten").select("id, auteur_naam, actie, van, naar, aangemaakt").eq("revisie_id", id).order("aangemaakt").limit(500),
  ]);
  if (error) return <p role="alert" className="paneel">De revisie kon niet geladen worden. Vernieuw de pagina of probeer het later opnieuw.</p>;
  if (!r) notFound();
  const pad = revisiePad(r.pagina);
  return <>
    <Paginakop titel="Revisie" accent="feedback opvolgen" terug={{ href: "/revisies", label: "Alle revisies" }}>{pad && <a className="knop knop-stil" href={`${WEBSITE_URL.replace(/\/$/, "")}${pad}`} target="_blank" rel="noopener noreferrer">Bekijk pagina op website</a>}</Paginakop>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] items-start">
      <div className="min-w-0 space-y-7">
        <section className="paneel"><p className="label mb-4" data-toon={r.status === "afgerond" ? "goed" : "uit"}>{STATUS[r.status as keyof typeof STATUS]}</p><h2 className="text-[clamp(1.75rem,4vw,2.75rem)] break-words mb-4">{r.titel}</h2>
          <p className="text-sm mb-2">Gemeld door <strong>{r.auteur_naam}</strong> op {revisieDatum(r.aangemaakt)}</p><p className="stil text-sm break-all">{r.pagina}</p><p className="stil text-sm mb-6">{APPARAAT[r.apparaat as keyof typeof APPARAAT]}. Prioriteit: {PRIORITEIT[r.prioriteit as keyof typeof PRIORITEIT]}.</p>
          <p className="whitespace-pre-wrap break-words max-w-[70ch]">{r.beschrijving}</p>
        </section>
        <section className="paneel"><h2 className="text-3xl mb-5">Reacties</h2>
          {reactieFout ? <p role="alert">Reacties konden niet geladen worden. Vernieuw de pagina.</p> : !reacties?.length ? <p className="stil">Nog geen reacties. Voeg extra uitleg toe of bespreek de correctie met het team.</p> : <ol className="divide-y divide-[var(--lijn)]">{reacties.map(x => <li key={x.id} className="py-4 first:pt-0"><p className="text-sm mb-2"><strong>{x.auteur_naam}</strong> <span className="stil">op {revisieDatum(x.aangemaakt)}</span></p><p className="whitespace-pre-wrap break-words">{x.tekst}</p></li>)}</ol>}
          {reacties?.length === 500 && <p className="stil">De eerste 500 reacties worden getoond.</p>}
          <RevisieReactie id={id} naam={sessie.naam} />
        </section>
      </div>
      <aside className="space-y-6 min-w-0">
        <section className="paneel"><h2 className="text-3xl mb-5">Opvolging</h2>{isBeheerder(sessie) ? <RevisieOpvolgen key={r.gewijzigd} id={id} status={r.status} prioriteit={r.prioriteit} gewijzigd={r.gewijzigd} /> : <p className="stil">Een beheerder past de status en prioriteit aan. Je kunt hieronder reageren.</p>}</section>
        <section className="paneel"><h2 className="text-3xl mb-5">Historiek</h2>{activiteitFout ? <p role="alert">De historiek kon niet geladen worden. Vernieuw de pagina.</p> : <ol className="space-y-5">{activiteiten?.map(a => <li key={a.id} className="text-sm break-words"><p><strong>{a.auteur_naam}</strong></p><p>{a.actie === "aangemaakt" ? "Revisie toegevoegd" : a.actie === "status" ? `Status: ${STATUS[a.van as keyof typeof STATUS]} naar ${STATUS[a.naar as keyof typeof STATUS]}` : `Prioriteit: ${PRIORITEIT[a.van as keyof typeof PRIORITEIT]} naar ${PRIORITEIT[a.naar as keyof typeof PRIORITEIT]}`}</p><p className="stil mt-1">{revisieDatum(a.aangemaakt)}</p></li>)}</ol>}{activiteiten?.length === 500 && <p className="stil mt-4">De eerste 500 activiteiten worden getoond.</p>}</section>
      </aside>
    </div>
  </>;
}
