import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAGINAS } from "@/lib/paginas";
import PaginaVoorbeeld from "./PaginaVoorbeeld";

// Alleen bedoeld om in het beheer naast het formulier van een pagina te staan.
export const metadata: Metadata = { title: "Voorbeeld", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return PAGINAS.map((p) => ({ sleutel: p.voorbeeld })).filter((p, i, l) => l.findIndex((x) => x.sleutel === p.sleutel) === i);
}

export default async function Pagina({ params }: { params: Promise<{ sleutel: string }> }) {
  const { sleutel } = await params;
  if (!PAGINAS.some((p) => p.voorbeeld === sleutel)) notFound();
  return <PaginaVoorbeeld toon={sleutel} />;
}
