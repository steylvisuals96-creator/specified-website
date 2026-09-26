"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// De turbine als scroll-gestuurde video: de hero pint en de scroll bepaalt welk
// frame te zien is (vooruit bij naar beneden, terug bij naar boven). Losse
// frames op een canvas in plaats van een <video>: terugspoelen in een video
// hapert, zeker in Safari. De poster in Hero is frame 1 en blijft staan tot
// het canvas tekent; zonder JS of met "beweging beperken" blijft alleen die.
const SETS = {
  desktop: { map: "desktop", aantal: 95, positie: [0.78, 0.2] },
  mobiel: { map: "mobiel", aantal: 76, positie: [0.7, 0] },
} as const;

const pad = (map: string, i: number) =>
  `/videos/turbine-frames/${map}/${String(i + 1).padStart(3, "0")}.webp`;

// Eerst elk 8e frame (ruwe versie werkt meteen), dan de rest.
function laadVolgorde(n: number) {
  const eerst = Array.from({ length: n }, (_, i) => i).filter((i) => i % 8 === 0);
  const rest = Array.from({ length: n }, (_, i) => i).filter((i) => i % 8 !== 0);
  return [...eerst, ...rest];
}

export default function HeroScrub() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const set = window.innerWidth < 900 ? SETS.mobiel : SETS.desktop;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const beelden: (HTMLImageElement | null)[] = Array(set.aantal).fill(null);
      let huidig = 0;
      let getekend = false;

      const maat = () => {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(r.width * dpr);
        canvas.height = Math.round(r.height * dpr);
      };

      // Dichtstbijzijnde geladen frame, zodat scrollen nooit op een gat stuit.
      const vind = (i: number) => {
        for (let d = 0; d < set.aantal; d++) {
          if (beelden[i - d]) return beelden[i - d];
          if (beelden[i + d]) return beelden[i + d];
        }
        return null;
      };

      const teken = (i: number) => {
        const img = vind(i);
        if (!img) return;
        const { width: cw, height: ch } = canvas;
        const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        const [px, py] = set.positie;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, (cw - w) * px, (ch - h) * py, w, h);
        if (!getekend) {
          getekend = true;
          canvas.dataset.klaar = "true";
        }
      };

      maat();
      let geannuleerd = false;
      laadVolgorde(set.aantal).forEach((i, volgorde) => {
        const img = new Image();
        img.decoding = "async";
        // Na de eerste weergave laden, in de volgorde van laadVolgorde.
        window.setTimeout(() => {
          if (geannuleerd) return;
          img.src = pad(set.map, i);
        }, 300 + volgorde * 12);
        img.onload = () => {
          beelden[i] = img;
          if (i === 0 || Math.abs(i - huidig) < 4) teken(huidig);
        };
      });

      const onResize = () => {
        maat();
        teken(huidig);
      };
      window.addEventListener("resize", onResize);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "+=130%",
          pin: true,
          scrub: 0.4,
          onUpdate: (self) => {
            const i = Math.round(self.progress * (set.aantal - 1));
            if (i !== huidig) {
              huidig = i;
              teken(i);
            }
          },
        },
      });
      // Terwijl de turbine draait: intro vervaagt, beeld zoomt licht, kop schuift pas op het einde weg.
      tl.to(".hero__copy", { opacity: 0, y: -40, ease: "none", duration: 0.35 }, 0)
        .to(".hero__beeld", { scale: 1.04, ease: "none", duration: 1 }, 0)
        .to(".hero__title", { yPercent: -14, ease: "none", duration: 0.35 }, 0.65);

      ScrollTrigger.refresh();

      return () => {
        geannuleerd = true;
        window.removeEventListener("resize", onResize);
      };
    });

    return () => mm.revert();
  });

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />;
}
