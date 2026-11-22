import { NextResponse } from "next/server";
import { paginasVoor } from "@/lib/paginas";

/**
 * De beschrijving van de bewerkbare pagina's (velden met hun standaardtekst),
 * per taal. Het beheer bouwt hieruit zijn formulieren, zodat website en beheer
 * nooit uit elkaar lopen. Niets geheims: dezelfde teksten staan op de website.
 * `paginas` blijft het Nederlands, zodat een ouder beheer blijft werken.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    { paginas: paginasVoor("nl"), talen: { nl: paginasVoor("nl"), en: paginasVoor("en") } },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
