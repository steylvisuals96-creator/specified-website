import type { Metadata } from "next";
import VacatureVoorbeeld from "./VacatureVoorbeeld";

// Alleen bedoeld om in het beheer naast het vacatureformulier te staan.
export const metadata: Metadata = { title: "Voorbeeld", robots: { index: false, follow: false } };

export default function Pagina() {
  return <VacatureVoorbeeld />;
}
