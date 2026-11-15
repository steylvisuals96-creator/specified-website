import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Paginakop from "@/components/Paginakop";
import ArtikelFormulier from "@/components/ArtikelFormulier";
import VerwijderKnop from "@/components/VerwijderKnop";
import { vereisSessie } from "@/lib/sessie";
import { artikel, media, team } from "@/lib/data";
import { uuidOfNull } from "@/lib/formulier";
import { verwijderArtikel } from "@/lib/acties/blog";
import { BEHEER_URL, WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Artikel" };

export default async function ArtikelPagina({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nieuw?: string }> }) {
  await vereisSessie();
  const { id } = await params;
  const { nieuw } = await searchParams;
  const [a, leden, beelden] = await Promise.all([uuidOfNull(id) ? artikel(id) : null, team(), media()]);
  if (!a) notFound();

  return (
    <>
      <Paginakop titel={a.titel} terug={{ href: "/blog", label: "Alle artikels" }} vul={45}>
        <VerwijderKnop actie={verwijderArtikel} id={a.id} wat={`het artikel ${a.titel}`} />
      </Paginakop>
      <ArtikelFormulier artikel={a} team={leden} media={beelden} websiteUrl={WEBSITE_URL} beheerUrl={BEHEER_URL} nieuwOpgeslagen={Boolean(nieuw)} />
    </>
  );
}
