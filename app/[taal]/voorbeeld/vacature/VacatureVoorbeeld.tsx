"use client";

import { useEffect, useMemo, useState } from "react";
import VacatureWeergave from "@/components/paginas/VacatureWeergave";
import VoorbeeldFocus from "@/components/VoorbeeldFocus";
import { getSettings, type SiteSettings } from "@/lib/settings";
import { vormSupabase, type SupabaseVacature } from "@/lib/vacatures";
import { useVoorbeeld } from "@/lib/useVoorbeeld";
import { useTaal } from "@/components/TaalContext";

/**
 * Live voorbeeld van een vacaturepagina naast het formulier in het beheer. Het
 * beheer stuurt het formulier in de vorm van een rij uit de tabel vacatures;
 * de website zet dat met haar eigen labels om (vormSupabase), net als de
 * echte pagina.
 */
export default function VacatureVoorbeeld() {
  const { data, focus, wacht } = useVoorbeeld();
  const taal = useTaal();
  const [settings, setSettings] = useState<SiteSettings>({});
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const v = useMemo(() => {
    if (!data || typeof data !== "object") return null;
    const d = data as Partial<SupabaseVacature>;
    return vormSupabase({
      id: "voorbeeld",
      slug: d.slug || "voorbeeld",
      titel: d.titel || "Nieuwe vacature",
      vakgebied: d.vakgebied || "",
      contract: d.contract || "",
      status: d.status || "actief",
      locatie: d.locatie || "",
      ervaring: d.ervaring ?? null,
      uren: d.uren ?? null,
      opleiding: d.opleiding ?? null,
      talen: Array.isArray(d.talen) ? d.talen : [],
      beschrijving: d.beschrijving ?? null,
      vereisten: Array.isArray(d.vereisten) ? d.vereisten : [],
      nice_to_have: Array.isArray(d.nice_to_have) ? d.nice_to_have : [],
      aanbod: Array.isArray(d.aanbod) ? d.aanbod : [],
      geplaatst_op: d.geplaatst_op ?? null,
      aangemaakt: d.aangemaakt || new Date().toISOString(),
    });
  }, [data]);

  if (!v) {
    return (
      <main id="inhoud">
        <p style={{ padding: "calc(72px + 3rem) 1.5rem 3rem", color: "var(--muted)" }}>{wacht ? "Voorbeeld laden" : "Begin te typen, het voorbeeld verschijnt hier."}</p>
      </main>
    );
  }

  return (
    <>
      <VoorbeeldFocus focus={focus} />
      <VacatureWeergave v={v} taal={taal} footer={{ linkedin: settings.linkedin, footerTekst: settings.footer_tekst }} />
    </>
  );
}
