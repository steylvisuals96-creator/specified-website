import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import { NieuweRevisie } from "@/components/RevisieFormulieren";
import { vereisSessie } from "@/lib/sessie";
import { revisiePad } from "@/lib/revisies";

export const metadata: Metadata = { title: "Revisie toevoegen" };
export default async function Nieuw({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const sessie = await vereisSessie();
  const { pagina } = await searchParams;
  return <><Paginakop titel="Nieuwe revisie" accent="wat kan beter?" terug={{ href: "/revisies", label: "Alle revisies" }} uitleg="Geef feedback op een pagina. Het team kan de correctie bespreken en opvolgen tot ze afgerond is." />
    <NieuweRevisie naam={sessie.naam} pagina={revisiePad(pagina ?? "/") ?? "/"} /></>;
}
