import { Fragment } from "react";

// Woorden over mensen of beslissingen krijgen de cursieve serif (DESIGN.md).
// Alleen het laatste woord van een kop komt in aanmerking, en maximaal één.
const MENSWOORDEN = new Set(["possibilities", "stap", "missie", "kennismaken", "partner"]);

export function metAccent(tekst: string) {
  const woorden = tekst.trim().split(/\s+/);
  const laatste = woorden[woorden.length - 1] ?? "";
  const kaal = laatste.replace(/[.,!?]+$/, "").toLowerCase();
  if (!MENSWOORDEN.has(kaal)) return tekst;
  return (
    <Fragment>
      {woorden.slice(0, -1).join(" ")} <span className="human">{laatste}</span>
    </Fragment>
  );
}
