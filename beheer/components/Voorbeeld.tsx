"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const BREEDTES = [
  { naam: "Desktop", px: 1440 },
  { naam: "Tablet", px: 820 },
  { naam: "Mobiel", px: 390 },
];

export type VoorbeeldBericht = { data: unknown; veld: string | null; label?: string };

/**
 * De echte website in een frame naast het formulier, verkleind tot ze past.
 * Stuurt bij elke wijziging de nieuwe teksten en het veld waarin je typt; de
 * website toont de tekst meteen, scrollt naar dat stuk en zet er een kader om.
 *
 * Protocol (zie lib/useVoorbeeld.ts op de website):
 *   beheer -> website  { type: "specified-voorbeeld", data, veld, label }
 *   website -> beheer  { type: "specified-voorbeeld", klaar: true }
 */
export default function Voorbeeld({ websiteUrl, pad, bericht }: { websiteUrl: string; pad: string; bericht: VoorbeeldBericht }) {
  const origin = useMemo(() => new URL(websiteUrl).origin, [websiteUrl]);
  const frame = useRef<HTMLIFrameElement>(null);
  const doos = useRef<HTMLDivElement>(null);
  const [klaar, setKlaar] = useState(false);
  const [breedte, setBreedte] = useState(BREEDTES[0].px);
  const [maat, setMaat] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const d = doos.current;
    if (!d) return;
    const meet = () => setMaat({ w: d.clientWidth, h: d.clientHeight });
    meet();
    const ro = new ResizeObserver(meet);
    ro.observe(d);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const ontvang = (e: MessageEvent) => {
      if (e.origin !== origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "specified-voorbeeld" && e.data.klaar) setKlaar(true);
    };
    addEventListener("message", ontvang);
    return () => removeEventListener("message", ontvang);
  }, [origin]);

  // Pas na "klaar" luistert de pagina; daarna gaat elke wijziging meteen door.
  useEffect(() => {
    if (!klaar) return;
    frame.current?.contentWindow?.postMessage({ type: "specified-voorbeeld", ...bericht }, origin);
  }, [bericht, klaar, origin]);

  const schaal = maat.w ? Math.min(1, maat.w / breedte) : 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <p className="kop text-[22px] mr-auto pt-[3px]">
          Voorbeeld <span className="accent text-[0.72em]">live</span>
        </p>
        {BREEDTES.map((b) => (
          <button
            key={b.naam}
            type="button"
            onClick={() => setBreedte(b.px)}
            aria-pressed={breedte === b.px}
            className={`chip !min-h-[30px] !text-[12.5px] ${breedte === b.px ? "!border-[var(--limoen)] !text-[var(--tekst)] !bg-[var(--limoen-zacht)]" : ""}`}
          >
            {b.naam}
          </button>
        ))}
      </div>
      <div ref={doos} className="glas relative flex-1 min-h-[420px] overflow-hidden">
        {!klaar && (
          <div className="absolute inset-0 grid place-items-center laden">
            <p className="stil text-[13px]">Website laden</p>
          </div>
        )}
        <iframe
          ref={frame}
          src={`${websiteUrl}${pad}`}
          title="Voorbeeld van de website"
          className="absolute top-0 border-0 bg-[#1e1e21] transition-opacity duration-300"
          style={{
            width: breedte,
            height: maat.h / schaal,
            transform: `scale(${schaal})`,
            transformOrigin: "top left",
            left: Math.max(0, (maat.w - breedte * schaal) / 2),
            opacity: klaar ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}
