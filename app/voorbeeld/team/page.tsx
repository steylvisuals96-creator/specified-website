import type { Metadata } from "next";
import TeamVoorbeeld from "./TeamVoorbeeld";

// Alleen bedoeld om in het CMS naast het formulier van een teamlid te staan.
export const metadata: Metadata = { title: "Voorbeeld", robots: { index: false, follow: false } };

export default function Pagina() {
  return <TeamVoorbeeld />;
}
