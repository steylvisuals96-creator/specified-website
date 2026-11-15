import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Paginakop from "@/components/Paginakop";
import TeamFormulier from "@/components/TeamFormulier";
import VerwijderKnop from "@/components/VerwijderKnop";
import { vereisSessie } from "@/lib/sessie";
import { media, teamlid } from "@/lib/data";
import { uuidOfNull } from "@/lib/formulier";
import { verwijderTeamlid } from "@/lib/acties/team";
import { BEHEER_URL, WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Teamlid" };

export default async function TeamlidPagina({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nieuw?: string }> }) {
  await vereisSessie();
  const { id } = await params;
  const { nieuw } = await searchParams;
  const [lid, beelden] = await Promise.all([uuidOfNull(id) ? teamlid(id) : null, media()]);
  if (!lid) notFound();
  return (
    <>
      <Paginakop titel={`${lid.voornaam} ${lid.achternaam}`.trim()} terug={{ href: "/team", label: "Heel het team" }} vul={35}>
        <VerwijderKnop actie={verwijderTeamlid} id={lid.id} wat={`${lid.voornaam} uit het team`} />
      </Paginakop>
      <TeamFormulier lid={lid} media={beelden} websiteUrl={WEBSITE_URL} beheerUrl={BEHEER_URL} nieuwOpgeslagen={Boolean(nieuw)} />
    </>
  );
}
