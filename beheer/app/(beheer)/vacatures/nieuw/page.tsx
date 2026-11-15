import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import VacatureFormulier from "@/components/VacatureFormulier";
import { vereisSessie } from "@/lib/sessie";
import { WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Nieuwe vacature" };

export default async function NieuweVacature() {
  await vereisSessie();
  return (
    <>
      <Paginakop titel="Nieuwe" accent="vacature" terug={{ href: "/vacatures", label: "Alle vacatures" }} vul={8} />
      <VacatureFormulier websiteUrl={WEBSITE_URL} />
    </>
  );
}
