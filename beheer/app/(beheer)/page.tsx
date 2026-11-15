import Link from "next/link";
import Paginakop from "@/components/Paginakop";
import { isBeheerder, vereisSessie } from "@/lib/sessie";
import { artikels, ontbreekt, opDeSite, vacatures, wanneer } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";
import { WEBSITE_URL } from "@/lib/website";

function groet() {
  const uur = Number(new Date().toLocaleString("nl-BE", { hour: "numeric", hour12: false, timeZone: "Europe/Brussels" }));
  return uur < 12 ? "Goedemorgen" : uur < 18 ? "Goedemiddag" : "Goedenavond";
}

const TABEL: Record<string, string> = { vacatures: "Vacature", blog: "Artikel", team: "Teamlid", media: "Beeld", pagina_inhoud: "Homepage", profielen: "Gebruiker" };
const ACTIE: Record<string, string> = { nieuw: "toegevoegd", gewijzigd: "gewijzigd", verwijderd: "verwijderd" };

export default async function Overzicht() {
  const s = await vereisSessie();
  const [vac, blog] = await Promise.all([vacatures(), artikels()]);
  const open = vac.filter((v) => opDeSite(v) && v.status === "actief");
  const onvolledig = open.filter((v) => ontbreekt(v).length > 0);
  const vandaag = new Date().toISOString().slice(0, 10);
  const online = blog.filter((a) => a.status === "gepubliceerd" && a.publicatiedatum <= vandaag);
  const concepten = blog.filter((a) => a.status === "concept");

  let log: { id: number; tabel: string; actie: string; titel: string; wanneer: string; door: string | null }[] = [];
  let namen = new Map<string, string>();
  if (isBeheerder(s)) {
    const sb = await supabaseServer();
    const [{ data: l }, { data: p }] = await Promise.all([
      sb.from("wijzigingen").select("id, tabel, actie, titel, wanneer, door").not("door", "is", null).order("wanneer", { ascending: false }).limit(6),
      sb.from("profielen").select("id, naam"),
    ]);
    log = l ?? [];
    namen = new Map((p ?? []).map((x) => [x.id, x.naam]));
  }

  const voornaam = s.naam.split(" ")[0];

  return (
    <>
      <Paginakop titel={groet()} accent={voornaam} vul={open.length ? 70 : 10} uitleg="Wat er nu op de website van Specified staat, en wat nog aandacht vraagt." />

      <div className="grid gap-5 md:grid-cols-3">
        <Link href="/vacatures?toon=site" className="paneel blad block hover:border-[var(--streep)]">
          <p className="stil text-[13px]">Open vacatures</p>
          <p className="kop text-[64px] mt-2">{open.length}</p>
          <p className="text-[13px] zwak mt-1">{onvolledig.length ? `${onvolledig.length} nog aan te vullen` : "alles volledig ingevuld"}</p>
        </Link>
        <Link href="/blog" className="paneel block hover:border-[var(--streep)]">
          <p className="stil text-[13px]">Artikels online</p>
          <p className="kop text-[64px] mt-2">{online.length}</p>
          <p className="text-[13px] zwak mt-1">{concepten.length ? `${concepten.length} concept${concepten.length > 1 ? "en" : ""} in de maak` : "geen concepten"}</p>
        </Link>
        <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="paneel block hover:border-[var(--streep)]">
          <p className="stil text-[13px]">Website</p>
          <p className="kop text-[40px] mt-4 leading-none">Bekijk de site</p>
          <p className="text-[13px] zwak mt-3 break-all">{WEBSITE_URL.replace(/^https?:\/\//, "")}</p>
        </a>
      </div>

      <div className="grid gap-5 mt-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="paneel">
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h2 className="text-[30px]">Vacatures op de site</h2>
            <Link href="/vacatures/nieuw" className="tekstknop">
              Nieuwe vacature
            </Link>
          </div>
          {open.length === 0 ? (
            <p className="stil">Er staan geen open vacatures online.</p>
          ) : (
            <ul>
              {open.slice(0, 8).map((v) => {
                const mist = ontbreekt(v);
                return (
                  <li key={v.id} className="flex items-center justify-between gap-4 py-3 border-t border-[var(--lijn)] first:border-0">
                    <Link href={`/vacatures/${v.id}`} className="rij-link truncate">
                      {v.titel}
                    </Link>
                    <span className="label shrink-0" data-toon={mist.length ? "let-op" : "goed"}>
                      {mist.length ? `mist ${mist.slice(0, 2).join(", ")}${mist.length > 2 ? "..." : ""}` : "volledig"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="paneel">
          <h2 className="text-[30px] mb-4">{isBeheerder(s) ? "Laatste wijzigingen" : "Blog"}</h2>
          {isBeheerder(s) ? (
            log.length === 0 ? (
              <p className="stil">Nog geen wijzigingen via het beheer.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {log.map((w) => (
                  <li key={w.id} className="text-[14px]">
                    <span className="font-medium">{TABEL[w.tabel] ?? w.tabel}</span> {ACTIE[w.actie]}
                    {w.titel && <span className="stil">: {w.titel}</span>}
                    <span className="block text-[12.5px] zwak">
                      {namen.get(w.door ?? "") ?? "Iemand"}, {wanneer(w.wanneer)}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <ul className="flex flex-col gap-3">
              {blog.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link href={`/blog/${a.id}`} className="rij-link">
                    {a.titel}
                  </Link>
                  <span className="block text-[12.5px] zwak">{a.status === "concept" ? "Concept" : "Online"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
