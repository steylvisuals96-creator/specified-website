import type { Metadata } from "next";
import Link from "next/link";
import Paginakop from "@/components/Paginakop";
import { vereisSessie } from "@/lib/sessie";
import { artikels, wanneer } from "@/lib/data";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Blog" };

export default async function Blog({ searchParams }: { searchParams: Promise<{ verwijderd?: string }> }) {
  await vereisSessie();
  const { verwijderd } = await searchParams;
  const lijst = await artikels();
  const vandaag = new Date().toISOString().slice(0, 10);
  const online = lijst.filter((a) => a.status === "gepubliceerd" && a.publicatiedatum <= vandaag).length;

  return (
    <>
      <Paginakop titel="Blog" accent={`${online} online`} vul={Math.min(100, online * 10)}>
        <Link href="/blog/nieuw" className="knop">
          Nieuw artikel
        </Link>
      </Paginakop>
      {verwijderd && (
        <p role="status" className="melding-in label mb-6" data-toon="goed">
          Het artikel is verwijderd.
        </p>
      )}
      <section className="glas px-5 md:px-7 pt-6 pb-2">
        {lijst.length === 0 ? (
          <p className="stil pb-6">Nog geen artikels.</p>
        ) : (
          <div className="tabel-schuif">
            <table className="tabel min-w-[560px]">
              <thead>
                <tr>
                  <th>Titel</th>
                  <th>Status</th>
                  <th>Datum</th>
                  <th>Gewijzigd</th>
                </tr>
              </thead>
              <tbody>
                {lijst.map((a) => {
                  const gepland = a.status === "gepubliceerd" && a.publicatiedatum > vandaag;
                  const isOnline = a.status === "gepubliceerd" && !gepland;
                  return (
                    <tr key={a.id}>
                      <td className="max-w-[420px]">
                        <Link href={`/blog/${a.id}`} className="rij-link">
                          {a.titel}
                        </Link>
                        {a.samenvatting && <p className="text-[12.5px] zwak line-clamp-1">{a.samenvatting}</p>}
                      </td>
                      <td>
                        <span className="label" data-toon={isOnline ? "goed" : gepland ? "let-op" : "uit"}>
                          {isOnline ? "Online" : gepland ? "Gepland" : "Concept"}
                        </span>
                      </td>
                      <td className="text-[13px] stil whitespace-nowrap">{new Date(a.publicatiedatum).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="text-[13px] zwak whitespace-nowrap">
                        {wanneer(a.gewijzigd)}
                        {isOnline && (
                          <a href={`${WEBSITE_URL}/blog/${a.slug}`} target="_blank" rel="noopener noreferrer" className="tekstknop ml-3">
                            Bekijk
                          </a>
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
