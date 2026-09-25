"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FALLBACK = [
  "Civiele techniek",
  "Elektrotechniek",
  "Werktuigbouwkunde",
  "Bouw & infrastructuur",
  "Energie & utilities",
  "IT & software",
  "Industrie & productie",
  "Projectmanagement",
];

// Het scroll-moment van de pagina: de disciplines schuiven om en om mee met de
// scroll. Zonder JS of met reduced motion is het een stilstaande lijst.
export default function Disciplines({ items }: { items?: string[] }) {
  const lijst = items && items.length > 0 ? items : FALLBACK;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".disc__row").forEach((rij, i) => {
          const naarLinks = i % 2 === 0;
          gsap.fromTo(
            rij,
            { xPercent: naarLinks ? 0 : -18 },
            {
              xPercent: naarLinks ? -18 : 0,
              ease: "none",
              scrollTrigger: {
                trigger: ref.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="disc" aria-labelledby="disc-titel">
      <h2 id="disc-titel" className="sr-only">
        Disciplines waarvoor we rekruteren
      </h2>
      <ul className="sr-only">
        {lijst.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      <div className="disc__rows" aria-hidden="true">
        {lijst.map((d, i) => (
          <div
            key={d}
            className={`disc__row ${i % 2 === 1 ? "disc__row--serif" : "display"} ${i === 3 ? "disc__row--lime" : ""}`}
          >
            <span>{d}</span>
            <span>{d}</span>
          </div>
        ))}
      </div>

      <p className="wrap disc__note lead">
        Van civiele techniek tot projectmanagement: we zoeken engineers voor{" "}
        {lijst.length} disciplines, en kennen het vak van binnenuit.
      </p>
    </section>
  );
}
