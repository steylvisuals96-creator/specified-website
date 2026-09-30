"use client";

import { useLayoutEffect, useRef } from "react";
import { metAccent } from "@/lib/accent";
import { MAX_TEKST, ontsmet } from "@/lib/tekstenBasis";
import { useTeksten } from "@/components/admin/TeksProvider";

/**
 * Een tekst van de website die via het admin-balkje aan te passen is.
 *
 * Voor een bezoeker is dit gewoon de tekst, zonder extra element: de live tekst uit
 * het CRM, en anders de standaardtekst uit de code (lib/tekstenBasis.ts). Alleen voor
 * een ingelogde beheerder in bewerkmodus wordt de tekst een bewerkbaar veld.
 *
 *   k       de sleutel, zoals in lib/tekstenBasis.ts
 *   d       andere standaardtekst dan in die lijst (bv. uit de CRM-instellingen)
 *   accent  toon het laatste woord in de cursieve serif, zoals bij koppen
 *   vast    nooit bewerkbaar in de pagina (bv. een herhaling in een animatie);
 *           aanpassen kan dan via het paneel "Alle teksten"
 */
export default function T({ k, d, accent, vast }: { k: string; d?: string; accent?: boolean; vast?: boolean }) {
  const { tekst, getoond, bewerken, slaOp } = useTeksten();
  if (!bewerken || vast) {
    const live = tekst(k, d);
    return <>{accent ? metAccent(live) : live}</>;
  }
  return <Bewerkbaar k={k} waarde={getoond(k, d)} slaOp={slaOp} />;
}

function Bewerkbaar({ k, waarde, slaOp }: { k: string; waarde: string; slaOp: (k: string, w: string) => Promise<boolean> }) {
  const ref = useRef<HTMLSpanElement>(null);

  // React geeft dit element bewust geen kinderen: de browser verandert de tekst
  // tijdens het typen zelf, en React zou die knooppunten anders kwijtraken.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== waarde && document.activeElement !== el) el.textContent = waarde;
  }, [waarde]);

  const herstel = () => {
    if (ref.current) ref.current.textContent = waarde;
  };

  return (
    <span
      ref={ref}
      data-tekst={k}
      contentEditable="true"
      suppressContentEditableWarning
      spellCheck
      role="textbox"
      aria-label={`Tekst aanpassen: ${k}`}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          herstel();
          e.currentTarget.blur();
        }
      }}
      onPaste={(e) => {
        // Alleen platte tekst: opmaak uit Word of een webpagina hoort hier niet in.
        e.preventDefault();
        const tekst = e.clipboardData.getData("text/plain").replace(/\s+/g, " ");
        document.execCommand("insertText", false, tekst);
      }}
      onInput={(e) => {
        const el = e.currentTarget;
        if ((el.textContent?.length ?? 0) > MAX_TEKST) el.textContent = (el.textContent ?? "").slice(0, MAX_TEKST);
      }}
      onBlur={async (e) => {
        const nieuw = ontsmet(e.currentTarget.textContent ?? "");
        if (!nieuw || nieuw === waarde) return herstel();
        if (!(await slaOp(k, nieuw))) herstel();
      }}
    />
  );
}
