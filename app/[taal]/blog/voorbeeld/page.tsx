import type { Metadata } from "next";
import VoorbeeldClient from "./VoorbeeldClient";

// Alleen bedoeld om in het CMS naast het formulier te staan. Zonder bericht van
// het CMS toont de pagina niets, dus er lekt hier ook geen concept.
export const metadata: Metadata = {
  title: "Voorbeeld",
  robots: { index: false, follow: false },
};

export default function Voorbeeld() {
  return <VoorbeeldClient />;
}
