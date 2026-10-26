"use client";

import { useEffect, useRef, useState } from "react";
import { CMS_URL } from "./settings";

const CMS_ORIGIN = (() => {
  try {
    return new URL(CMS_URL).origin;
  } catch {
    return "";
  }
})();

/**
 * Luistert naar de berichten van het Payload-formulier (zelfde protocol als
 * @payloadcms/live-preview-react). Die bibliotheek haalt relaties op met de
 * login van de bewerker, maar de cookie gaat niet mee naar een ander domein.
 * Relaties die publiek leesbaar zijn halen we daarom zelf op: `relaties` zegt
 * welk veld naar welke collectie wijst, bv. { auteur: "team", cover: "media" }.
 */
export function useVoorbeeld(relaties: Record<string, string> = {}) {
  const [data, setData] = useState<any>(null);
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
    // Zonder dit bericht weet het CMS niet dat de pagina klaar is om te ontvangen.
    window.parent?.postMessage({ type: "payload-live-preview", ready: true }, CMS_ORIGIN);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return { data, wacht };
}
