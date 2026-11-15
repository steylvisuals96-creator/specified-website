"use client";

import { useEffect, useRef, useState } from "react";
import { CMS_URL } from "./settings";
import { beheerOrigin } from "./beheer";

const CMS_ORIGIN = (() => {
  try {
    return new URL(CMS_URL).origin;
  } catch {
    return "";
  }
})();

// Het nieuwe beheer (lokaal op poort 3004 tijdens het ontwikkelen).
const BEHEER_ORIGINS = [beheerOrigin, ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3004"] : [])].filter(Boolean);

/**
 * Luistert naar de berichten van het beheer naast het voorbeeld.
 *
 * Twee afzenders:
 * - Het nieuwe beheer (beheer/components/Voorbeeld.tsx): { type: "specified-voorbeeld", data, veld, label }.
 *   De data is al compleet (beeldlinks ingevuld); `veld` zegt in welk veld de
 *   redactie nu typt, zodat de pagina daarheen kan scrollen.
 * - De oude CMS (Payload live preview): { type: "payload-live-preview", data }.
 *   Relaties die publiek leesbaar zijn halen we zelf op: `relaties` zegt welk
 *   veld naar welke collectie wijst, bv. { auteur: "team", cover: "media" }.
 */
export function useVoorbeeld(relaties: Record<string, string> = {}) {
  const [data, setData] = useState<any>(null);
  const [focus, setFocus] = useState<{ veld: string | null; label?: string; teller: number }>({ veld: null, teller: 0 });
  const [wacht, setWacht] = useState(true);
  const cache = useRef(new Map<string, any>());
  const relatiesRef = useRef(relaties);
  const vorige = useRef("");

  useEffect(() => {
    async function haal(collectie: string, id: unknown) {
      if (typeof id !== "string" && typeof id !== "number") return id;
      const sleutel = `${collectie}/${id}`;
      if (!cache.current.has(sleutel)) {
        const doc = await fetch(`${CMS_URL}/api/${collectie}/${id}?depth=0`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        cache.current.set(sleutel, doc);
      }
      return cache.current.get(sleutel);
    }

    async function onMessage(e: MessageEvent) {
      if (e.source !== window.parent) return;

      if (BEHEER_ORIGINS.includes(e.origin) && e.data?.type === "specified-voorbeeld") {
        if (e.data.data) {
          const json = JSON.stringify(e.data.data);
          if (json !== vorige.current) {
            vorige.current = json;
            setData(e.data.data);
          }
        }
        setWacht(false);
        const veld = typeof e.data.veld === "string" ? e.data.veld.slice(0, 80) : null;
        const label = typeof e.data.label === "string" ? e.data.label.slice(0, 80) : undefined;
        setFocus((f) => (f.veld === veld ? f : { veld, label, teller: f.teller + 1 }));
        return;
      }

      if (e.origin !== CMS_ORIGIN || e.data?.type !== "payload-live-preview" || !e.data.data) return;
      const d = { ...e.data.data };
      await Promise.all(
        Object.entries(relatiesRef.current).map(async ([veld, collectie]) => {
          d[veld] = await haal(collectie, d[veld]);
        }),
      );
      // Hetzelfde bericht opnieuw (de editor herhaalt tot hij weet dat we luisteren): niets doen.
      const json = JSON.stringify(d);
      if (json === vorige.current) return;
      vorige.current = json;
      setData(d);
      setWacht(false);
    }

    window.addEventListener("message", onMessage);
    // Zonder dit bericht weet het beheer niet dat de pagina klaar is om te ontvangen.
    // Een bericht naar een andere origin dan de ouder komt gewoon niet aan.
    if (window.parent !== window) {
      for (const o of BEHEER_ORIGINS) window.parent.postMessage({ type: "specified-voorbeeld", klaar: true }, o);
      if (CMS_ORIGIN) window.parent.postMessage({ type: "payload-live-preview", ready: true }, CMS_ORIGIN);
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return { data, wacht, focus };
}
