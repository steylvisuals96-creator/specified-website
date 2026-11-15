import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import MediaUpload from "@/components/MediaUpload";
import MediaKaart from "@/components/MediaKaart";
import { vereisSessie } from "@/lib/sessie";
import { media } from "@/lib/data";
import { r2Ingesteld } from "@/lib/r2";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPagina() {
  await vereisSessie();
  const lijst = await media();
  return (
    <>
      <Paginakop titel="Media" accent={`${lijst.length} beelden`} uitleg="Foto's voor blogartikels en teamleden. Ze staan in een afgeschermde opslag en gaan alleen naar buiten via de website." vul={30} />
      {r2Ingesteld() ? (
        <MediaUpload />
      ) : (
        <p className="glas px-5 py-4 stil">De mediaopslag (Cloudflare R2) is nog niet ingesteld in dit beheer. Uploaden kan zodra de R2-gegevens in de omgevingsvariabelen staan.</p>
      )}
      {lijst.length === 0 ? (
        <p className="stil mt-8">Nog geen beelden.</p>
      ) : (
        <ul className="grid gap-5 mt-8 sm:grid-cols-2 xl:grid-cols-3">
          {lijst.map((m) => (
            <MediaKaart key={m.id} m={m} />
          ))}
        </ul>
      )}
    </>
  );
}
