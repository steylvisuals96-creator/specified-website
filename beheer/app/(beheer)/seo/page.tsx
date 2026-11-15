import type { Metadata } from "next";
import Link from "next/link";
import Paginakop from "@/components/Paginakop";
import SeoBeslissen from "@/components/SeoBeslissen";
import { wanneer } from "@/lib/data";
import { seoConfig, type Rapport } from "@/lib/seo/config";
import { vereisBeheerder } from "@/lib/sessie";
import { supabaseServer } from "@/lib/supabase/server";
import { r2Ingesteld } from "@/lib/r2";

export const metadata: Metadata = { title: "SEO-bot" };

type Voorstel = {
  id: string;
  pad: string;
  titel: string;
  beschrijving: string;
  vorige_titel: string;
  vorige_beschrijving: string;
  reden: string;
  status: "open" | "toegepast" | "ingehaald" | "verworpen";
  besloten_door: string | null;
};

const statusTekst = {
  open: "Te beoordelen",
  toegepast: "Toegepast",
  ingehaald: "Ingehaald",
  verworpen: "Verworpen",
};
const meldingen = {
  toepassen: "De nieuwe metadata is toegepast.",
  verwerpen: "Het voorstel is verworpen.",
  ingehaald: "Dit voorstel was al behandeld of is ingehaald door een recentere wijziging.",
  fout: "Het voorstel kon niet worden opgeslagen. Probeer het opnieuw.",
};
const geheel = new Intl.NumberFormat("nl-BE");
const decimaal = new Intl.NumberFormat("nl-BE", { maximumFractionDigits: 1 });
const procent = new Intl.NumberFormat("nl-BE", { style: "percent", maximumFractionDigits: 1 });

export default async function Seo({ searchParams }: { searchParams: Promise<{ melding?: string }> }) {
  await vereisBeheerder();
  const { melding } = await searchParams;
  const config = seoConfig();
  const sb = await supabaseServer();
  const { data, error } = await sb.from("seo_runs")
    .select("id, gestart, status, artikel_id, rapport, seo_voorstellen(id, pad, titel, beschrijving, vorige_titel, vorige_beschrijving, reden, status, besloten_door)")
    .order("week", { ascending: false }).limit(8);
  const feedback = melding && Object.hasOwn(meldingen, melding) ? meldingen[melding as keyof typeof meldingen] : null;
  const draait = config.actief && config.ontbreekt.length === 0;

  return (
    <>
      <Paginakop titel="SEO-bot" uitleg="Zoekprestaties uit Google Search Console, metadata voor de site en blogconcepten op basis van vakonderzoek." />
      {feedback && <p role="status" className="melding-in label mb-6" data-toon={melding === "fout" ? "let-op" : "goed"}>{feedback}</p>}
      <section aria-label="Automatisering" className="glas px-5 py-5 md:px-7 mb-8">
        <p className="font-semibold">{draait ? "Ingepland op maandag" : "Automatisering staat stil"}</p>
        <p className="stil mt-1 text-sm">
          {config.automatisch ? "De bot mag metadata automatisch toepassen." : "Een beheerder beoordeelt de metadata."}
          {" "}Blogartikels komen binnen als concept.
          {" "}{config.beeld && r2Ingesteld() ? "AI-covers staan aan." : "AI-covers staan uit of de opslag is nog niet ingesteld."}
        </p>
        {config.ontbreekt.length > 0 && <p className="stil mt-2 text-sm">Nog te koppelen: {config.ontbreekt.join(", ")}.</p>}
      </section>

      <section aria-labelledby="seo-rondes">
        <h2 id="seo-rondes" className="text-3xl mb-3">SEO-rondes</h2>
        {error ? (
          <p role="status" className="stil">De SEO-rondes zijn niet beschikbaar. Controleer of de SEO-migratie is uitgevoerd in Supabase.</p>
        ) : !data.length ? (
          <p className="stil">Hier verschijnt het verslag van de eerste ronde met de gevonden bronnen en voorstellen.</p>
        ) : (
          <div className="glas px-5 md:px-7 divide-y divide-[var(--lijn)]">
            {data.map((run, i) => {
              const rapport = run.rapport as Rapport;
              const langBezig = run.status === "bezig" && Date.now() - Date.parse(run.gestart) > 6 * 60_000;
              const status = run.status === "klaar" ? "Afgerond" : langBezig ? "Afgebroken" : run.status === "bezig" ? "Bezig" : "Mislukt";
              return (
                <details key={run.id} className="py-4" open={i === 0 || run.seo_voorstellen.some((v) => v.status === "open")}>
                  <summary className="cursor-pointer font-medium">
                    <span className="ml-2">{wanneer(run.gestart)}</span>
                    <span className="label ml-3" data-toon={run.status === "klaar" ? "goed" : "let-op"}>{status}</span>
                  </summary>
                  <div className="space-y-5 pt-4 pb-2">
                    {run.artikel_id && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Link className="tekstknop" href={`/blog/${run.artikel_id}`}>Open het artikel</Link>
                        {rapport.cover && <span className="stil text-sm">Met AI-cover</span>}
                      </div>
                    )}
                    {!!rapport.meldingen?.length && <ul className="list-disc pl-5 space-y-1 stil text-sm">
                      {rapport.meldingen.map((tekst) => <li key={tekst}>{tekst}</li>)}
                    </ul>}
                    {!!rapport.signalen?.length && (
                      <div className="tabel-schuif">
                        <table className="tabel min-w-[500px]">
                          <caption className="text-left mb-2 font-medium">
                            Google Search Console {rapport.periode && <span className="stil text-sm">({rapport.periode.start} t/m {rapport.periode.einde})</span>}
                          </caption>
                          <thead><tr><th>Zoekterm en pagina</th><th>Vertoningen</th><th>Klikken</th><th>CTR</th><th>Positie</th></tr></thead>
                          <tbody>
                            {rapport.signalen.map((s) => (
                              <tr key={s.pad}>
                                <td>{s.zoekterm}<span className="stil block">{s.pad}</span></td>
                                <td>{geheel.format(s.vertoningen)}</td><td>{geheel.format(s.klikken)}</td>
                                <td>{procent.format(s.ctr)}</td><td>{decimaal.format(s.positie)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {run.seo_voorstellen.length > 0 && <div className="space-y-5">
                      <h3 className="font-semibold">Metadatavoorstellen</h3>
                      {(run.seo_voorstellen as Voorstel[]).map((v) => (
                        <article key={v.id} className="border-t border-[var(--lijn)] pt-4 space-y-3">
                          <div className="flex flex-wrap gap-2 items-center">
                            <h4 className="font-medium">{v.pad === "/" ? "Homepage" : v.pad}</h4>
                            <span className="label" data-toon={v.status === "toegepast" ? "goed" : "uit"}>
                              {v.status === "toegepast" && !v.besloten_door ? "Automatisch toegepast" : statusTekst[v.status]}
                            </span>
                          </div>
                          <p className="stil text-sm">{v.reden}</p>
                          <dl className="grid gap-4 lg:grid-cols-2">
                            <div className="min-w-0">
                              <dt className="stil text-sm">Voor de wijziging</dt>
                              <dd className="break-words"><p className="font-medium">{v.vorige_titel}</p><p className="stil text-sm">{v.vorige_beschrijving}</p></dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="stil text-sm">Voorgesteld</dt>
                              <dd className="break-words"><p className="font-medium">{v.titel}</p><p className="stil text-sm">{v.beschrijving}</p></dd>
                            </div>
                          </dl>
                          {v.status === "open" && <SeoBeslissen id={v.id} />}
                        </article>
                      ))}
                    </div>}
                    {!!rapport.bronnen?.length && (
                      <details>
                        <summary className="cursor-pointer font-medium">Vakbronnen ({rapport.bronnen.length})</summary>
                        <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                          {rapport.bronnen.map((bron) => (
                            <li key={bron.url}>
                              <a className="tekstknop break-words" href={bron.url} target="_blank" rel="noreferrer">{bron.titel}</a>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
