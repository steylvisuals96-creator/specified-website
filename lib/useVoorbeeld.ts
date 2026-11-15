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
        // Het beheer vraagt of we luisteren (het kon onze eerste melding gemist hebben).
        if (e.data.vraag === "klaar") {
          window.parent.postMessage({ type: "specified-voorbeeld", klaar: true }, e.origin);
          return;
        }
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

    // In het voorbeeld zijn links en formulieren geen echte uitgangen: een andere pagina
    // mag niet in een frame (lege pagina) en een formulier zou een echte mail versturen.
    // Een link naar een pagina van de site vraagt het beheer de editor van die pagina te
    // openen; een anker op dezelfde pagina (#aanvraag) scrollt gewoon.
    const ouderOrigin = (() => {
      try {
        return new URL(document.referrer).origin;
      } catch {
        return "";
      }
    })();
    const melding = (tekst: string) => {
      const el = document.createElement("div");
      el.textContent = tekst;
      el.setAttribute("role", "status");
      el.style.cssText =
        "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483001;background:#dffd7b;color:#1e1e21;font:600 14px/1.3 system-ui,sans-serif;padding:10px 14px;border-radius:2px;box-shadow:0 10px 30px rgba(0,0,0,.4);pointer-events:none";
      document.body.append(el);
      setTimeout(() => el.remove(), 2400);
    };
    const opKlik = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.getAttribute("href") ?? "").startsWith("#")) return;
      e.preventDefault();
      e.stopPropagation();
      const url = new URL(a.href, location.href);
      if (url.origin === location.origin && BEHEER_ORIGINS.includes(ouderOrigin)) {
        window.parent.postMessage({ type: "specified-voorbeeld", navigeer: url.pathname + url.hash }, ouderOrigin);
      } else {
        melding("Deze link opent niet in het voorbeeld.");
      }
    };
    const opVersturen = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      melding("In het voorbeeld wordt niets verstuurd.");
    };
    if (window.parent !== window) {
      document.addEventListener("click", opKlik, true);
      document.addEventListener("submit", opVersturen, true);
    }

    // Zonder dit bericht weet het beheer niet dat de pagina klaar is om te ontvangen.
    // Alleen naar de pagina waarin we echt staan (document.referrer), anders geeft de
    // browser een waarschuwing voor elke andere origin.
    if (window.parent !== window) {
      const ouder = (() => {
        try {
          return new URL(document.referrer).origin;
        } catch {
          return "";
        }
      })();
      if (BEHEER_ORIGINS.includes(ouder)) window.parent.postMessage({ type: "specified-voorbeeld", klaar: true }, ouder);
      if (ouder === CMS_ORIGIN) window.parent.postMessage({ type: "payload-live-preview", ready: true }, CMS_ORIGIN);
    }
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", opKlik, true);
      document.removeEventListener("submit", opVersturen, true);
    };
  }, []);

  return { data, wacht, focus };
}
