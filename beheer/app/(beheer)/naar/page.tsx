import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Paginakop from "@/components/Paginakop";
import { vereisSessie } from "@/lib/sessie";
import { paginaSchema } from "@/lib/paginas-server";
import { supabaseServer } from "@/lib/supabase/server";
import { metTaal, splitsPad } from "@/lib/taal";

export const metadata: Metadata = { title: "Naar de editor" };

/**
 * Een klik op een link in het websitevoorbeeld komt hier binnen (?pad=/voor-bedrijven)
 * en gaat naar de editor die bij die pagina hoort. Bestaat er (nog) geen editor
 * voor, dan een korte uitleg in plaats van een lege pagina.
 */
export default async function Naar({ searchParams }: { searchParams: Promise<{ pad?: string }> }) {
  await vereisSessie();
  const { pad: ruw = "/" } = await searchParams;
  const volledig = (ruw.startsWith("/") ? ruw : "/").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  // Een link in het Engelse voorbeeld (/en/...) gaat naar de Engelse teksten van die pagina.
  const { taal, nlPad: pad } = splitsPad(volledig);

  if (pad === "/") redirect(metTaal("/homepage", taal));
  const schema = await paginaSchema();
  const pagina = schema.find((p) => p.pad === pad);
  if (pagina) redirect(metTaal(`/paginas/${pagina.sleutel}`, taal));

  const vacature = pad.match(/^\/vacatures\/([a-z0-9-]{1,140})$/);
  if (vacature) {
    const { data } = await (await supabaseServer()).from("vacatures").select("id").eq("slug", vacature[1]).maybeSingle();
    redirect(data ? `/vacatures/${data.id}` : "/vacatures");
  }
  // Een teamlid in het voorbeeld (data-beheer op de website) opent zijn eigen editor.
  const lid = pad.match(/^\/team\/([0-9a-f-]{36})$/i);
  if (lid) redirect(`/team/${lid[1]}`);
  const artikel = pad.match(/^\/blog\/([a-z0-9-]{1,140})$/);
  if (artikel) {
    const { data } = await (await supabaseServer()).from("blog").select("id").eq("slug", artikel[1]).maybeSingle();
    redirect(data ? `/blog/${data.id}` : "/blog");
  }

  return (
    <>
      <Paginakop titel="Nog niet" accent="bewerkbaar" vul={20} />
      <section className="paneel blad max-w-[640px] flex flex-col gap-4">
        <p>
          De pagina <code className="text-[var(--limoen)]">{volledig}</code> kan je nog niet in het beheer aanpassen.
        </p>
        <p className="stil text-[14px]">De juridische pagina&apos;s (privacy, cookies, disclaimer, toegankelijkheid, algemene voorwaarden) volgen nog. Wil je daar nu iets veranderd zien, laat het dan weten aan SteylVisuals.</p>
        <Link href="/paginas" className="knop self-start">
          Naar alle pagina&apos;s
        </Link>
      </section>
    </>
  );
}
