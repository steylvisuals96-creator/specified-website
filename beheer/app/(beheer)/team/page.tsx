import type { Metadata } from "next";
import Link from "next/link";
import Paginakop from "@/components/Paginakop";
import { vereisSessie } from "@/lib/sessie";
import { team } from "@/lib/data";

export const metadata: Metadata = { title: "Team" };

export default async function Team({ searchParams }: { searchParams: Promise<{ verwijderd?: string }> }) {
  await vereisSessie();
  const { verwijderd } = await searchParams;
  const leden = await team();
  return (
    <>
      <Paginakop titel="Team" accent={`${leden.filter((l) => l.actief).length} op de website`} vul={25} uitleg="De mensen in de teamsectie van de homepage, in de volgorde die je hier kiest.">
        <Link href="/team/nieuw" className="knop">
          Teamlid toevoegen
        </Link>
      </Paginakop>
      {verwijderd && (
        <p role="status" className="melding-in label mb-6" data-toon="goed">
          Het teamlid is verwijderd.
        </p>
      )}
      {leden.length === 0 ? (
        <p className="glas px-5 py-5 stil">Nog geen teamleden. Zolang deze lijst leeg is, toont de website de vaste teamfoto&apos;s.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {leden.map((l) => (
            <li key={l.id}>
              <Link href={`/team/${l.id}`} className="glas flex gap-4 p-4 items-center hover:border-[var(--streep)]">
                <span className="w-16 h-20 flex-none overflow-hidden bg-[rgba(0,0,0,.25)] border border-[var(--glasrand)]">
                  {l.foto_id && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/m/${l.foto_id}`} alt="" className="w-full h-full object-cover" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium truncate">
                    {l.voornaam} {l.achternaam}
                  </span>
                  <span className="block text-[13px] stil truncate">{l.rol || "Geen functie"}</span>
                  <span className="label mt-2" data-toon={l.actief ? "goed" : "uit"}>
                    {l.actief ? "Zichtbaar" : "Verborgen"}, volgorde {l.volgorde}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
