"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Eén scroll-moment per sectie, elk met een eigen karakter (DESIGN.md: geen
// identieke fades). Alles hangt aan de scroll (scrub) behalve de veeg over de
// vacaturerijen. Met "beweging beperken" gebeurt er niets: de pagina is af
// zonder JS, deze laag voegt alleen toe.
export default function ScrollMomenten() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero: de turbine draait mee met de scroll, de kop schuift weg.
      gsap.to(".hero__beeld img", {
        rotate: 28,
        scale: 1.18,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 },
      });
      gsap.to(".hero__title", {
        yPercent: -22,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 },
      });
      gsap.to(".hero__copy", {
        y: -60,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "60% top", scrub: 0.5 },
      });

      // Diensten: de beelden openen zich als een sluiter.
      gsap.utils.toArray<HTMLElement>(".split__beeld").forEach((kader) => {
        const img = kader.querySelector("img");
        gsap.fromTo(
          kader,
          { clipPath: "inset(18% 12% 18% 12%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: kader, start: "top 90%", end: "top 35%", scrub: 0.6 },
          },
        );
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.25 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: kader, start: "top 90%", end: "bottom 30%", scrub: 0.6 },
            },
          );
        }
      });

      // Vacatures: één limoen veeg over elke rij, na elkaar, als de lijst in beeld komt.
      const vegen = gsap.utils.toArray<HTMLElement>(".jobs__veeg");
      if (vegen.length) {
        gsap
          .timeline({ scrollTrigger: { trigger: ".jobs__lijst", start: "top 75%", once: true } })
          .fromTo(
            vegen,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.35, ease: "power2.in", stagger: 0.09 },
          )
          .to(vegen, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: "power2.out", stagger: 0.09 }, 0.3);
      }

      // Founders: de foto's schuiven trager dan de pagina (diepte).
      gsap.utils.toArray<HTMLElement>(".team__foto img").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // Contact: de afsluiter groeit naar zijn volle maat, de onderlijn trekt zich.
      gsap.fromTo(
        ".cta h2",
        { scale: 0.82 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: ".cta", start: "top bottom", end: "top 30%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        ".cta__mail",
        { backgroundSize: "0% 3px" },
        {
          backgroundSize: "100% 3px",
          ease: "none",
          scrollTrigger: { trigger: ".cta__mail", start: "top 90%", end: "top 55%", scrub: 0.6 },
        },
      );
    });

    return () => mm.revert();
  });

  return null;
}
