import type { Metadata } from "next";
import HomeVoorbeeld from "./HomeVoorbeeld";

// Alleen bedoeld om in het CMS naast het formulier "Website" te staan.
export const metadata: Metadata = { title: "Voorbeeld", robots: { index: false, follow: false } };

export default function Pagina() {
  return <HomeVoorbeeld />;
}
