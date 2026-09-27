"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { onConsentChange, readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

/**
 * Wordt op de server al gerenderd, zodat hij bij de eerste weergave staat in
 * plaats van na het laden van JS. Wie al koos, ziet hem nooit: het scriptje in
 * <head> zet html[data-consent] en de CSS (.cookie-banner) verbergt hem.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => setVisible(readConsent() === null);
    sync();
    return onConsentChange(sync);
  }, []);

  function choose(value: ConsentValue) {
    writeConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookievoorkeuren" className="cookie-banner">
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
