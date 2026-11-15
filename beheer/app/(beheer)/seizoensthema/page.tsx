import Paginakop from "@/components/Paginakop";
import SeizoensthemaFormulier from "@/components/SeizoensthemaFormulier";
import { belgischeDatum, themaOptie, type Instelling } from "@/lib/seizoensthema";
import { vereisBeheerder } from "@/lib/sessie";
import { supabaseServer } from "@/lib/supabase/server";
import { WEBSITE_URL } from "@/lib/website";

const datumLabel = (iso: string) => new Intl.DateTimeFormat("nl-BE", { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));

export default async function SeizoensthemaPagina() {
  await vereisBeheerder();
  const sb = await supabaseServer();
  const { data, error } = await sb.from("seizoensthema").select("thema, vanaf, tot_en_met").eq("id", true).single();
  const keuze = themaOptie(data?.thema);
  const instelling: Instelling | null = !error && keuze && data ? { thema: keuze.id, vanaf: data.vanaf, tot_en_met: data.tot_en_met } : null;
  const vandaag = belgischeDatum.format();
  const toekomstig = Boolean(instelling?.vanaf && instelling.vanaf > vandaag);
  const afgelopen = Boolean(instelling?.tot_en_met && instelling.tot_en_met < vandaag);
  const actief = !toekomstig && !afgelopen ? keuze?.naam : "Standaard";

  return (
    <>
      <Paginakop
        titel="Seizoensthema"
        terug={{ href: "/", label: "Terug naar overzicht" }}
        uitleg="Geef de hele website een andere sfeer. Je kiest wat bezoekers te zien krijgen en wanneer."
      />
      {instelling ? (
        <>
          <p className="mb-5 stil">
            Nu op de website: <strong className="text-[var(--tekst)]">{actief}</strong>
            {toekomstig && instelling.vanaf && <>. {keuze?.naam} staat gepland vanaf {datumLabel(instelling.vanaf)}.</>}
            {!toekomstig && !afgelopen && instelling.tot_en_met && <> tot en met {datumLabel(instelling.tot_en_met)}.</>}
            {afgelopen && instelling.tot_en_met && <>. {keuze?.naam} liep tot en met {datumLabel(instelling.tot_en_met)}.</>}
          </p>
          <SeizoensthemaFormulier instelling={instelling} websiteUrl={WEBSITE_URL} />
        </>
      ) : (
        <p className="paneel" role="status">Het ingestelde thema kon niet geladen worden. Herlaad de pagina en probeer opnieuw.</p>
      )}
    </>
  );
}
