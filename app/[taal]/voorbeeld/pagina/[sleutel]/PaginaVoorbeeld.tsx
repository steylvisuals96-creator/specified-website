"use client";

import { useEffect, useMemo, useState } from "react";
import BewerkOverlay from "@/components/BewerkOverlay";
import VoorbeeldFocus from "@/components/VoorbeeldFocus";
import {
  BlogOverzichtWeergave,
  ContactWeergave,
  FaqWeergave,
  OpenSollicitatieWeergave,
  VacaturesWeergave,
  VoorBedrijvenWeergave,
  VoorEngineersWeergave,
  type VacatureRij,
} from "@/components/paginas/Weergaven";
import { getPagina, paginaDef, samenvoegenPagina, type PaginaTeksten } from "@/lib/paginas";
import { getSettings, type SiteSettings } from "@/lib/settings";
import { getVacatures, dagenOnline } from "@/lib/vacatures";
import { getBlogPosts, type BlogPost } from "@/lib/blog";
import { CONTACT } from "@/lib/inhoud";
import { useVoorbeeld } from "@/lib/useVoorbeeld";
import { useTaal } from "@/components/TaalContext";

/**
 * Live voorbeeld van een doorklikpagina naast het formulier in het beheer.
 * `toon` is de pagina die getoond wordt; welke teksten bewerkt worden staat in
 * ?bewerk= (bij Gedeelde lijsten is dat "algemeen", getoond op Voor bedrijven).
 * Wat niet bewerkt wordt, komt zoals het opgeslagen is uit Supabase.
 */
export default function PaginaVoorbeeld({ toon }: { toon: string }) {
  const { data, focus } = useVoorbeeld();
  const taal = useTaal();
  const bewerk = typeof window === "undefined" ? toon : new URLSearchParams(location.search).get("bewerk") || toon;

  const [opgeslagen, setOpgeslagen] = useState<{ t: PaginaTeksten; a: PaginaTeksten } | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [vacatures, setVacatures] = useState<VacatureRij[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    Promise.all([getPagina(toon, taal), getPagina("algemeen", taal)]).then(([t, a]) => setOpgeslagen({ t, a }));
    getSettings(taal).then(setSettings);
    if (toon === "vacatures")
      getVacatures(100, taal).then((l) =>
        setVacatures(l.map((v) => ({ slug: v.slug, titel: v.titel, vakgebied: v.vakgebied, locatie: v.locatie, uren: v.uren, ervaring: v.ervaring, ingevuld: v.ingevuld, dagen: dagenOnline(v) }))),
      );
    if (toon === "blog") getBlogPosts().then(setPosts);
  }, [toon, taal]);

  // Het formulier in het beheer wint van wat opgeslagen is.
  const { t, a } = useMemo(() => {
    const basis = opgeslagen ?? { t: samenvoegenPagina(paginaDef(toon, taal)!, {}), a: samenvoegenPagina(paginaDef("algemeen", taal)!, {}) };
    if (!data) return basis;
    if (bewerk === "algemeen") return { t: basis.t, a: samenvoegenPagina(paginaDef("algemeen", taal)!, data) };
    return { t: samenvoegenPagina(paginaDef(toon, taal)!, data), a: basis.a };
  }, [opgeslagen, data, toon, bewerk, taal]);

  const footer = { linkedin: settings.linkedin, footerTekst: settings.footer_tekst };

  return (
    <>
      <BewerkOverlay />
      <VoorbeeldFocus focus={focus} />
      {toon === "voor-bedrijven" && <VoorBedrijvenWeergave t={t} a={a} footer={footer} taal={taal} />}
      {toon === "voor-engineers" && <VoorEngineersWeergave t={t} a={a} footer={footer} taal={taal} />}
      {toon === "vacatures" && <VacaturesWeergave t={t} footer={footer} vacatures={vacatures} taal={taal} />}
      {toon === "contact" && (
        <ContactWeergave t={t} footer={footer} taal={taal} mail={settings.contact_email || CONTACT.email} telefoon={settings.telefoon || CONTACT.telefoon} linkedin={settings.linkedin || CONTACT.linkedin} />
      )}
      {toon === "faq" && <FaqWeergave t={t} footer={footer} taal={taal} />}
      {toon === "open-sollicitatie" && <OpenSollicitatieWeergave t={t} footer={footer} taal={taal} />}
      {toon === "blog" && <BlogOverzichtWeergave t={t} footer={footer} posts={posts} taal={taal} />}
    </>
  );
}
