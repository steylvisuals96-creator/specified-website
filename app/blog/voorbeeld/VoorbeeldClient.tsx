"use client";

import { mapPost } from "@/lib/blog";
import ArtikelWeergave from "@/components/ArtikelWeergave";
import Nav from "@/components/Nav";
import { useVoorbeeld } from "@/lib/useVoorbeeld";

const RELATIES = { auteur: "team", cover: "media" };

/**
 * Het live voorbeeld van een blogartikel. Het CMS toont deze pagina in een
 * iframe en stuurt bij elke toetsaanslag de inhoud van het formulier door.
 * Dezelfde artikelweergave als de echte pagina (components/ArtikelWeergave.tsx).
 */
export default function VoorbeeldClient() {
  const { data, wacht } = useVoorbeeld(RELATIES);

  if (!data?.titel && !data?.inhoud) {
    return (
      <main id="inhoud">
        <p style={{ padding: "calc(72px + 3rem) 1.5rem 3rem", color: "var(--muted)" }}>
          {wacht ? "Voorbeeld laden…" : "Begin te typen, het voorbeeld verschijnt hier."}
        </p>
      </main>
    );
  }

  return (
    <>
      <Nav />
      <main id="inhoud">
        <ArtikelWeergave post={mapPost(data)} />
      </main>
    </>
  );
}
