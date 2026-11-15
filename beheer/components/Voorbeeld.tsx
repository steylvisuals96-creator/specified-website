"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
      if (e.data?.type !== "specified-voorbeeld") return;
      if (e.data.klaar) setKlaar(true);
      // Een klik op een link in het voorbeeld: naar de editor van die pagina.
      if (typeof e.data.navigeer === "string" && e.data.navigeer.startsWith("/")) {
        const nietOpgeslagen = document.documentElement.dataset.nietOpgeslagen === "1";
        if (nietOpgeslagen && !window.confirm("Je hebt niet opgeslagen wijzigingen op deze pagina. Toch naar de andere pagina?")) return;
        delete document.documentElement.dataset.nietOpgeslagen;
        router.push(`/naar?pad=${encodeURIComponent(e.data.navigeer.slice(0, 200))}`);
      }
    };
    addEventListener("message", ontvang);
    return () => removeEventListener("message", ontvang);
  }, [origin, router]);

  // Het frame komt pas na het laden van deze pagina, met een unieke parameter: zo haalt de
  // browser het voorbeeld altijd vers op en nooit een oude kopie met een verouderde
  // beveiligingsheader (die het tonen in een frame weigerde).
  const [src, setSrc] = useState<string | null>(null);
  const [geladen, setGeladen] = useState(false);
  // Na 12 seconden zonder antwoord een duidelijke melding in plaats van eindeloos laden.
  const [traag, setTraag] = useState(false);
  useEffect(() => {
    if (klaar || !src) return;
    const t = setTimeout(() => setTraag(true), 12000);
    return () => clearTimeout(t);
  }, [klaar, src]);
  useEffect(() => {
    const url = new URL(pad, websiteUrl);
    url.searchParams.set("v", Date.now().toString(36));
    setSrc(url.toString());
    setGeladen(false);
    setKlaar(false);
  }, [pad, websiteUrl]);

  // De website meldt zich zelf, maar dat bericht kan verloren gaan. Daarom vragen we het,
  // pas als het frame geladen is (anders praten we tegen een lege pagina), tot er antwoord komt.
  useEffect(() => {
    if (klaar || !geladen) return;
    let n = 0;
    const vraag = () => frame.current?.contentWindow?.postMessage({ type: "specified-voorbeeld", vraag: "klaar" }, origin);
    vraag();
    const t = setInterval(() => (++n > 100 ? clearInterval(t) : vraag()), 300);
    return () => clearInterval(t);
  }, [klaar, geladen, origin]);

  // Pas na "klaar" luistert de pagina; daarna gaat elke wijziging meteen door.
  useEffect(() => {
    if (!klaar) return;
    frame.current?.contentWindow?.postMessage({ type: "specified-voorbeeld", ...bericht }, origin);
  }, [bericht, klaar, origin]);

  // Op een smal scherm (telefoon) meteen de mobiele weergave: desktop wordt daar onleesbaar klein.
  const gekozen = useRef(false);
  useEffect(() => {
    if (!gekozen.current && maat.w > 0) {
      gekozen.current = true;
      if (maat.w < 560) setBreedte(BREEDTES[2].px);
    }
  }, [maat.w]);

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
          <div className={`absolute inset-0 grid place-items-center px-6 text-center ${traag ? "" : "laden"}`}>
            {traag ? (
              <div className="flex flex-col items-center gap-3 max-w-[340px]">
                <p className="text-[14px]">Het voorbeeld laadt niet.</p>
                <p className="stil text-[13px]">De velden en Opslaan werken gewoon. Probeer het voorbeeld opnieuw; lukt het niet, laat het dan weten.</p>
                <button
                  type="button"
                  className="knop knop-stil knop-klein"
                  onClick={() => {
                    const url = new URL(pad, websiteUrl);
                    url.searchParams.set("v", Date.now().toString(36));
                    setTraag(false);
                    setGeladen(false);
                    setSrc(url.toString());
                  }}
                >
                  Voorbeeld opnieuw laden
                </button>
              </div>
            ) : (
              <p className="stil text-[13px]">Website laden</p>
            )}
          </div>
        )}
        {src && (
        <iframe
          ref={frame}
          src={src}
          onLoad={() => setGeladen(true)}
          title="Voorbeeld van de website"
          className="absolute top-0 border-0 bg-[#1e1e21] transition-opacity duration-300"
          style={{
            width: breedte,
            height: maat.h / schaal,
            // Past het op ware grootte, dan geen schaling: scherper, en klikken gaat zoals op de site.
            transform: schaal < 1 ? `scale(${schaal})` : "none",
            transformOrigin: "top left",
            left: Math.max(0, (maat.w - breedte * schaal) / 2),
            opacity: klaar ? 1 : 0,
          }}
        />
        )}
      </div>
    </div>
  );
}
