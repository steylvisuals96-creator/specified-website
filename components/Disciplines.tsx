"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CONSULTANTS } from "@/lib/inhoud";
import { metAccent } from "@/lib/accent";
import T from "@/components/T";
import { useTeksten } from "@/components/admin/TeksProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);


// Onze consultants: de profielen van Specified schuiven om en om mee met de
// scroll. Zonder JS of met reduced motion is het een stilstaande lijst.
export default function Disciplines({ items }: { items?: string[] }) {
  const lijst = items && items.length > 0 ? items : CONSULTANTS.profielen;
  const ref = useRef<HTMLElement>(null);
  const { bewerken, tekst } = useTeksten();

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
      <div className="wrap disc__kop">
        <h2 id="disc-titel" className="display display-m">
          {bewerken ? (
            <>
              <T k="consultants.titel" /> <T k="consultants.accent" />
            </>
          ) : (
            metAccent(`${tekst("consultants.titel")} ${tekst("consultants.accent")}`)
          )}
        </h2>
        <p className="lead disc__tekst">
          <T k="consultants.tekst" />
        </p>
      </div>
      <ul className="sr-only">
        {lijst.map((d, i) => (
          <li key={d}>
            <T k={`consultants.profiel.${i}`} d={d} vast />
          </li>
        ))}
      </ul>

      <div className="disc__rows" aria-hidden="true">
        {lijst.map((d, i) => (
          <div
            key={d}
            className={`disc__row ${i % 2 === 1 ? "disc__row--serif" : "display"} ${i === 3 ? "disc__row--lime" : ""}`}
          >
            <span>
              <T k={`consultants.profiel.${i}`} d={d} vast />
            </span>
            <span>
              <T k={`consultants.profiel.${i}`} d={d} vast />
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}
