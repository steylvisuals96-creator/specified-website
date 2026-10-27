"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Nav from "@/components/Nav";
import HeroTekening from "@/components/HeroTekening";
import Disciplines from "@/components/Disciplines";
import Split from "@/components/Split";
import Jobs from "@/components/Jobs";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollMomenten from "@/components/ScrollMomenten";
import BewerkOverlay from "@/components/BewerkOverlay";
import { samenvoegen, STANDAARD } from "@/lib/website";
import { useVoorbeeld } from "@/lib/useVoorbeeld";

/**
 * Live voorbeeld van de homepage naast het formulier "Website" in het CMS.
 * Tekst verschijnt direct; de tekening in de hero wordt pas opnieuw opgebouwd
 * zodra je even stopt met typen (ze bouwt zich bij elke wijziging helemaal op).
 */
export default function HomeVoorbeeld() {
  const { data } = useVoorbeeld();
  const inhoud = useMemo(() => (data ? samenvoegen(data) : STANDAARD), [data]);

  const heroDeel = useMemo(
    () => ({ hero: inhoud.hero, tekening: inhoud.tekening, callouts: inhoud.callouts }),
    [inhoud],
  );
  const sleutel = JSON.stringify(heroDeel);
  const [hero, setHero] = useState({ sleutel, deel: heroDeel });
  // Het uitstel hangt aan de inhoud (sleutel), niet aan elk nieuw bericht: een
  // identiek bericht mag de timer niet telkens opnieuw starten.
  const heroRef = useRef(heroDeel);
  heroRef.current = heroDeel;
  useEffect(() => {
    const t = setTimeout(() => setHero({ sleutel, deel: heroRef.current }), 700);
    return () => clearTimeout(t);
  }, [sleutel]);

  return (
    <>
      <BewerkOverlay />
      <Nav />
      <main>
        <HeroTekening key={hero.sleutel} inhoud={hero.deel} />
        <Disciplines inhoud={inhoud.consultants} />
        <Split kolommen={inhoud.diensten} />
        <Jobs jobs={[]} titel={inhoud.jobs.titel} linkTekst={inhoud.jobs.linkTekst} />
        <Team />
        <CTA />
      </main>
      <ScrollMomenten />
      <Footer />
    </>
  );
}
