"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { onConsentChange, readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

/**
 * Wordt op de server al gerenderd, zodat hij bij de eerste weergave staat in
 * plaats van na het laden van JS. Wie al koos, ziet hem nooit: het scriptje in
 * <head> zet html[data-consent] en de CSS (.cookie-banner) verbergt hem.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setVisible(readConsent() === null);
    sync();
    return onConsentChange(sync);
  }, []);

  // Zolang de banner onderaan staat, houdt de pagina die strook vrij
  // (--cookie-ruimte, zie globals.css): een element dat focus krijgt (Tab),
  // scrolt dan boven de banner in beeld in plaats van erachter te
  // verdwijnen, ook helemaal onderaan de pagina (WCAG 2.4.11).
  useEffect(() => {
    const el = ref.current;
    if (!visible || !el) return;
    const html = document.documentElement;
    const zet = () => {
      const top = el.getBoundingClientRect().top;
      html.style.setProperty("--cookie-ruimte", el.offsetHeight ? `${Math.ceil(innerHeight - top) + 16}px` : "0px");
    };
    // Vangnet: ligt een gefocust element toch (deels) onder de banner, dan
    // schuiven we het erboven.
    const opFocus = (e: FocusEvent) => {
      const doel = e.target as HTMLElement;
      if (el.contains(doel)) return;
      const bannerTop = el.getBoundingClientRect().top;
      const r = doel.getBoundingClientRect();
      if (r.bottom > bannerTop) scrollBy({ top: r.bottom - bannerTop + 16, behavior: "instant" });
    };
    zet();
    const waarnemer = new ResizeObserver(zet);
    waarnemer.observe(el);
    addEventListener("resize", zet);
    document.addEventListener("focusin", opFocus);
    return () => {
      waarnemer.disconnect();
      removeEventListener("resize", zet);
      document.removeEventListener("focusin", opFocus);
      html.style.removeProperty("--cookie-ruimte");
    };
  }, [visible]);

  function choose(value: ConsentValue) {
    writeConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div ref={ref} role="dialog" aria-label="Cookievoorkeuren" className="cookie-banner">
      <p>
        We gebruiken noodzakelijke cookies om de site te laten werken en, met jouw toestemming, analytische
        cookies om hem te verbeteren. Meer info in ons <Link href="/cookies">cookiebeleid</Link>.
      </p>
      {/* Beide keuzes krijgen exact hetzelfde gewicht: zelfde vorm, maat,
          letterdikte en contrast. De EDPB-richtsnoeren vereisen dat weigeren
          even makkelijk is als aanvaarden. */}
      <div className="cookie-banner__keuzes">
        <button type="button" onClick={() => choose("accepted")}>
          Alles accepteren
        </button>
        <button type="button" onClick={() => choose("declined")}>
          Enkel noodzakelijke
        </button>
      </div>
    </div>
  );
}
