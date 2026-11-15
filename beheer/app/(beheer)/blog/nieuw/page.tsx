import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import ArtikelFormulier from "@/components/ArtikelFormulier";
import { vereisSessie } from "@/lib/sessie";
import { media, team } from "@/lib/data";
import { BEHEER_URL, WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Nieuw artikel" };

export default async function NieuwArtikel() {
  await vereisSessie();
  const [leden, beelden] = await Promise.all([team(), media()]);
  return (
    <>
      <Paginakop titel="Nieuw" accent="artikel" terug={{ href: "/blog", label: "Alle artikels" }} vul={8} />
      <ArtikelFormulier team={leden} media={beelden} websiteUrl={WEBSITE_URL} beheerUrl={BEHEER_URL} />
    </>
  );
}
