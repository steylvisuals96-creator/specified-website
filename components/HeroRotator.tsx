"use client";

import { useEffect, useState } from "react";
import Signature from "@/components/Signature";

const FALLBACK = ["engineer", "shape", "unlock", "build", "define"];
const INTERVAL = 2600;

// Het wisselende woord in de hero. De handtekening staat hier mee in de kop,
// maar wordt door de scroll getekend (zie HeroScrub). De volledige zin staat ook als gewone tekst in de h1
// (zie Hero), zodat schermlezers en zoekmachines geen wisselende kop krijgen.
export function useWoordIndex(aantal: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (aantal < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % aantal), INTERVAL);
    return () => window.clearInterval(t);
  }, [aantal]);
  return index;
}

export default function HeroRotator({
  prefix,
  suffix,
  woorden,
}: {
  prefix: string;
  suffix: string;
  woorden?: string[];
}) {
  const lijst = woorden && woorden.length > 0 ? woorden : FALLBACK;
  const index = useWoordIndex(lijst.length);

  return (
    <>
      <span className="hero__line" aria-hidden="true">
        <span>
          {prefix}{" "}
          <span className="hero__rotator">
            <span key={lijst[index]} className="hero__woord">
              {lijst[index]}
            </span>
          </span>
        </span>
      </span>
      <span className="hero__line" aria-hidden="true">
        <span>{suffix}</span>
      </span>
      {/* Wordt getekend door de scroll (HeroScrub), niet per woord. */}
      <Signature className="hero__signature" />
    </>
  );
}
