import type { Metadata } from "next";
import Link from "next/link";
import Paginakop from "@/components/Paginakop";
import { vereisSessie } from "@/lib/sessie";
import { ontbreekt, opDeSite, vacatures, wanneer } from "@/lib/data";
import { STATUSSEN, VAKGEBIEDEN, labelVan } from "@/lib/opties";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Vacatures" };

const FILTERS = [
  { sleutel: "alle", label: "Alle" },
  { sleutel: "site", label: "Op de website" },
  { sleutel: "intern", label: "Niet op de website" },
];

export default async function Vacatures({ searchParams }: { searchParams: Promise<{ toon?: string; verwijderd?: string }> }) {
  await vereisSessie();
  const { toon = "alle", verwijderd } = await searchParams;
  const alle = await vacatures();
  const lijst = alle.filter((v) => (toon === "site" ? opDeSite(v) : toon === "intern" ? !opDeSite(v) : true));
  const open = alle.filter((v) => opDeSite(v) && v.status === "actief").length;

  return (
    <>
      <Paginakop titel="Vacatures" accent={`${open} open`} vul={Math.min(100, open * 12)} uitleg="Actieve en ingevulde vacatures staan op de website, ingevulde met een markering. On hold en geannuleerd blijven intern.">
        <Link href="/vacatures/nieuw" className="knop">
          Nieuwe vacature
        </Link>
      </Paginakop>

      {verwijderd && (
        <p role="status" className="melding-in label mb-6" data-toon="goed">
          De vacature is verwijderd.
        </p>
      )}

      <nav aria-label="Filter" className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <Link key={f.sleutel} href={f.sleutel === "alle" ? "/vacatures" : `/vacatures?toon=${f.sleutel}`} aria-current={toon === f.sleutel ? "page" : undefined} className="chip aria-[current=page]:border-[var(--limoen)] aria-[current=page]:text-[var(--tekst)] aria-[current=page]:bg-[var(--limoen-zacht)]">
            {f.label}
          </Link>
        ))}
      </nav>

      <section className="glas px-5 md:px-7 pt-6 pb-2">
        {lijst.length === 0 ? (
          <p className="stil pb-6">Geen vacatures in deze lijst.</p>
        ) : (
          <div className="tabel-schuif">
            <table className="tabel min-w-[640px]">
              <thead>
                <tr>
                  <th>Functie</th>
                  <th>Vakgebied</th>
                  <th>Status</th>
                  <th>Nog aan te vullen</th>
                  <th>Gewijzigd</th>
                </tr>
              </thead>
              <tbody>
                {lijst.map((v) => {
                  const mist = ontbreekt(v);
                  return (
                    <tr key={v.id}>
                      <td>
                        <Link href={`/vacatures/${v.id}`} className="rij-link">
                          {v.titel}
                        </Link>
                        <p className="text-[12.5px] zwak">{v.locatie}</p>
                      </td>
                      <td className="stil text-[14px]">{labelVan(VAKGEBIEDEN, v.vakgebied)}</td>
                      <td>
                        <span className="label" data-toon={!opDeSite(v) ? "uit" : v.status === "actief" ? "goed" : undefined}>
                          {labelVan(STATUSSEN, v.status)}
                          {!v.zichtbaar && ", verborgen"}
                        </span>
                      </td>
                      <td className="text-[13px] stil">{mist.length ? mist.join(", ") : <span className="zwak">volledig</span>}</td>
                      <td className="text-[13px] zwak whitespace-nowrap">
                        {wanneer(v.gewijzigd)}
                        {opDeSite(v) && (
                          <>
                            {" "}
                            <a href={`${WEBSITE_URL}/vacatures/${v.slug}`} target="_blank" rel="noopener noreferrer" className="tekstknop ml-2">
                              Bekijk
                            </a>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
