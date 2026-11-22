"use client";

import { useEffect, useState } from "react";
import { leesThema, zetThema, type Thema } from "@/lib/thema";
import { useTaal } from "@/components/TaalContext";
import { ui } from "@/lib/teksten";

/** Schakelt tussen het donkere en het lichte thema. */
export default function ThemaKnop({ metTekst }: { metTekst?: boolean }) {
  // Tot de browser het weet, gaan we uit van donker (de standaard).
  const [thema, setThema] = useState<Thema>("donker");
  const t = ui(useTaal()).thema;
  useEffect(() => setThema(leesThema()), []);

  const ander: Thema = thema === "licht" ? "donker" : "licht";
  const label = ander === "licht" ? t.licht : t.donker;

  return (
    <button
      type="button"
      className="thema-knop"
      data-tekst={metTekst || undefined}
      aria-label={metTekst ? undefined : t.wissel(label)}
      title={metTekst ? undefined : label}
      onClick={() => {
        zetThema(ander);
        setThema(ander);
      }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        {ander === "licht" ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        )}
      </svg>
      {metTekst && <span>{label}</span>}
    </button>
  );
}
