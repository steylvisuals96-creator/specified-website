"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { kies } from "@/lib/tekstenBasis";

// Het balkje en zijn stijl worden pas geladen als er iemand ingelogd is: gewone
// bezoekers downloaden er niets van.
const AdminBalk = dynamic(() => import("@/components/admin/AdminBalk"), { ssr: false });

export type Admin = { naam: string; rol: string };
export type Melding = { soort: "ok" | "fout"; tekst: string };

export type TeksContext = {
  /** Live overschrijvingen uit het CRM. */
  waarden: Record<string, string>;
  /** Wijzigingen die nog niet live staan (alleen gevuld voor een ingelogde beheerder). */
  concept: Record<string, string>;
  admin: Admin | null;
  bewerken: boolean;
  melding: Melding | null;
  bezig: boolean;
  /** De live tekst: wat het CRM bewaart, en anders de standaard. Dit zien bezoekers. */
  tekst: (k: string, d?: string) => string;
  /** Wat nu getoond wordt: in bewerkmodus met het concept erbij. */
  getoond: (k: string, d?: string) => string;
  slaOp: (k: string, waarde: string) => Promise<boolean>;
  zetBewerken: (aan: boolean) => void;
  publiceer: () => Promise<void>;
  weggooi: () => Promise<void>;
  uitloggen: () => Promise<void>;
  wisMelding: () => void;
};

const leeg: TeksContext = {
  waarden: {},
  concept: {},
  admin: null,
  bewerken: false,
  melding: null,
  bezig: false,
  tekst: (k, d) => kies({}, k, d),
  getoond: (k, d) => kies({}, k, d),
  slaOp: async () => false,
  zetBewerken: () => undefined,
  publiceer: async () => undefined,
  weggooi: async () => undefined,
  uitloggen: async () => undefined,
  wisMelding: () => undefined,
};

const Ctx = createContext<TeksContext>(leeg);
export const useTeksten = () => useContext(Ctx);

type ApiAntwoord = { ok: boolean; status: number; data: Record<string, unknown> };

async function api(pad: string, method: string, body?: unknown): Promise<ApiAntwoord> {
  try {
    const res = await fetch(pad, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    let data: Record<string, unknown> = {};
    try {
      data = await res.json();
    } catch {
      /* geen JSON in het antwoord */
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Geen verbinding. Probeer het opnieuw." } };
  }
}

const fout = (data: Record<string, unknown>, anders: string) => (typeof data.error === "string" ? data.error : anders);

export default function TeksProvider({ waarden: serverWaarden, children }: { waarden: Record<string, string>; children: ReactNode }) {
  const [waarden, setWaarden] = useState(serverWaarden);
  const [concept, setConcept] = useState<Record<string, string>>({});
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [bewerken, setBewerken] = useState(false);
  const [melding, setMelding] = useState<Melding | null>(null);
  const [bezig, setBezig] = useState(false);

  // Kwam er na een verversing nieuwe live-tekst van de server, dan die overnemen.
  const [vorigeServer, setVorigeServer] = useState(serverWaarden);
  if (serverWaarden !== vorigeServer) {
    setVorigeServer(serverWaarden);
    setWaarden(serverWaarden);
  }

  // Alleen wie de vlag-cookie heeft, vraagt om een sessie. Een gewone bezoeker
  // doet dus geen enkele extra aanvraag.
  useEffect(() => {
    if (!/(?:^|;\s*)sp_admin_actief=1/.test(document.cookie)) return;
    let weg = false;
    (async () => {
      const s = await api("/api/admin/sessie", "GET");
      if (weg || !s.ok || s.data.ingelogd !== true) return;
      setAdmin({ naam: String(s.data.naam ?? "Beheerder"), rol: String(s.data.rol ?? "") });
      const c = await api("/api/admin/concept", "GET");
      if (!weg && c.ok && c.data.concept && typeof c.data.concept === "object") {
        setConcept(c.data.concept as Record<string, string>);
      }
    })();
    return () => {
      weg = true;
    };
  }, []);

  // Stijl voor de bewerkmodus hangt aan <html>, zodat hij ook buiten de provider werkt.
  useEffect(() => {
    if (bewerken) document.documentElement.dataset.bewerken = "aan";
    else delete document.documentElement.dataset.bewerken;
    return () => {
      delete document.documentElement.dataset.bewerken;
    };
  }, [bewerken]);

  // In bewerkmodus opent een klik op een tekst geen link en start geen knop: je wilt
  // de tekst aanpassen, niet de pagina verlaten. Alleen bij bewerkbare teksten.
  useEffect(() => {
    if (!bewerken) return;
    const blokkeer = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-tekst]")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", blokkeer, true);
    return () => document.removeEventListener("click", blokkeer, true);
  }, [bewerken]);

  // Een melding verdwijnt vanzelf.
  useEffect(() => {
    if (!melding) return;
    const t = setTimeout(() => setMelding(null), melding.soort === "fout" ? 8000 : 3500);
    return () => clearTimeout(t);
  }, [melding]);

  const vervallen = useCallback(() => {
    setAdmin(null);
    setBewerken(false);
    setConcept({});
    setMelding({ soort: "fout", tekst: "Je sessie is verlopen. Log opnieuw in via /beheer." });
  }, []);

  const tekst = useCallback((k: string, d?: string) => kies(waarden, k, d), [waarden]);
  const getoond = useCallback(
    (k: string, d?: string) => (bewerken && concept[k] ? concept[k] : kies(waarden, k, d)),
    [waarden, concept, bewerken]
  );

  const slaOp = useCallback(
    async (k: string, waarde: string) => {
      const r = await api("/api/admin/tekst", "PUT", { sleutel: k, tekst: waarde });
      if (r.ok && typeof r.data.tekst === "string") {
        const bewaard = r.data.tekst;
        setConcept((c) => ({ ...c, [k]: bewaard }));
        setMelding({ soort: "ok", tekst: "Concept opgeslagen. Nog niet live." });
        return true;
      }
      if (r.status === 401) vervallen();
      else setMelding({ soort: "fout", tekst: fout(r.data, "Opslaan is niet gelukt.") });
      return false;
    },
    [vervallen]
  );

  const publiceer = useCallback(async () => {
    setBezig(true);
    const r = await api("/api/admin/publiceren", "POST");
    setBezig(false);
    if (r.status === 401) return vervallen();
    const gepubliceerd = Number(r.data.gepubliceerd ?? 0);
    if (gepubliceerd > 0) {
      // Wat in het CRM niet gelukt is, blijft als concept staan; de rest is nu live.
      const nieuw = await api("/api/admin/concept", "GET");
      const rest = nieuw.ok && nieuw.data.concept ? (nieuw.data.concept as Record<string, string>) : {};
      setWaarden((w) => {
        const live = { ...w };
        for (const k of Object.keys(concept)) if (!(k in rest)) live[k] = concept[k];
        return live;
      });
      setConcept(rest);
    }
    if (r.ok) setMelding({ soort: "ok", tekst: `${gepubliceerd} ${gepubliceerd === 1 ? "tekst staat" : "teksten staan"} nu live.` });
    else setMelding({ soort: "fout", tekst: fout(r.data, `Publiceren is niet (helemaal) gelukt: ${gepubliceerd} live, ${String(r.data.mislukt ?? "?")} mislukt.`) });
  }, [concept, vervallen]);

  const weggooi = useCallback(async () => {
    setBezig(true);
    const r = await api("/api/admin/weggooien", "POST");
    setBezig(false);
    if (r.status === 401) return vervallen();
    if (r.ok) {
      setConcept({});
      setMelding({ soort: "ok", tekst: "Alle concepten zijn weggegooid." });
    } else setMelding({ soort: "fout", tekst: fout(r.data, "Weggooien is niet gelukt.") });
  }, [vervallen]);

  const uitloggen = useCallback(async () => {
    await api("/api/admin/logout", "POST");
    setAdmin(null);
    setBewerken(false);
    setConcept({});
  }, []);

  const waarde = useMemo<TeksContext>(
    () => ({
      waarden,
      concept,
      admin,
      bewerken,
      melding,
      bezig,
      tekst,
      getoond,
      slaOp,
      zetBewerken: setBewerken,
      publiceer,
      weggooi,
      uitloggen,
      wisMelding: () => setMelding(null),
    }),
    [waarden, concept, admin, bewerken, melding, bezig, tekst, getoond, slaOp, publiceer, weggooi, uitloggen]
  );

  return (
    <Ctx.Provider value={waarde}>
      {children}
      {admin && <AdminBalk />}
    </Ctx.Provider>
  );
}
