import { NextResponse } from "next/server";
import { PAGINAS } from "@/lib/paginas";

/**
 * De beschrijving van de bewerkbare pagina's (velden met hun standaardtekst).
 * Het beheer bouwt hieruit zijn formulieren, zodat website en beheer nooit
 * uit elkaar lopen. Niets geheims: dezelfde teksten staan op de website.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ paginas: PAGINAS }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
