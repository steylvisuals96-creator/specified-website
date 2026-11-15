import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Paginakop from "@/components/Paginakop";
import VacatureFormulier from "@/components/VacatureFormulier";
import VerwijderKnop from "@/components/VerwijderKnop";
import { vereisSessie } from "@/lib/sessie";
import { vacature } from "@/lib/data";
import { uuidOfNull } from "@/lib/formulier";
import { verwijderVacature } from "@/lib/acties/vacatures";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Vacature" };

export default async function VacaturePagina({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nieuw?: string }> }) {
  await vereisSessie();
  const { id } = await params;
  const { nieuw } = await searchParams;
  const v = uuidOfNull(id) ? await vacature(id) : null;
  if (!v) notFound();

  return (
    <>
      <Paginakop titel={v.titel} terug={{ href: "/vacatures", label: "Alle vacatures" }} vul={40}>
        <VerwijderKnop actie={verwijderVacature} id={v.id} wat={`de vacature ${v.titel}`} />
      </Paginakop>
      <VacatureFormulier vacature={v} websiteUrl={WEBSITE_URL} nieuwOpgeslagen={Boolean(nieuw)} />
    </>
  );
}
