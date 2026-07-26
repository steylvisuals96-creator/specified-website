"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { onConsentChange, readConsent } from "@/lib/consent";

/**
 * Laadt Vercel Analytics en Speed Insights uitsluitend nadat de bezoeker
 * analytische cookies heeft aanvaard. Zolang er geen keuze is — of bij
 * "Enkel noodzakelijke" — wordt er niets ingeladen en vertrekt er geen
 * enkel verzoek. Dit is wat /cookies belooft.
 */
export default function AnalyticsGate() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(readConsent() === "accepted");
    sync();
    return onConsentChange(sync);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
