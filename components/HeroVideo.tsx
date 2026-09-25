"use client";

import { useEffect, useRef, useState } from "react";

// De turbine als naadloze lus boven de poster. De poster (next/image in Hero)
// is het eerste frame van de video en blijft het LCP-beeld; de video laadt pas
// na de eerste weergave en neemt ongemerkt over. Geen video bij "beweging
// beperken" of "databesparing": dan blijft de poster staan.
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [aan, setAan] = useState(false);
  const [speelt, setSpeelt] = useState(false);

  useEffect(() => {
    const beperkt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bespaar = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (beperkt || bespaar) return;
    // Pas na de eerste weergave laden, zodat de video de hero niet vertraagt.
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => setAan(true), { timeout: 1500 })
      : window.setTimeout(() => setAan(true), 600);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
  }, []);

  // Buiten beeld pauzeren: spaart batterij en rekenkracht.
  useEffect(() => {
    const v = ref.current;
    if (!aan || !v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [aan]);

  if (!aan) return null;

  return (
    <video
      ref={ref}
      className="hero__video"
      data-speelt={speelt}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setSpeelt(true)}
    >
      <source src="/videos/hero-turbine-720.mp4" type="video/mp4" media="(max-width: 899px)" />
      <source src="/videos/hero-turbine-1080.webm" type="video/webm" />
      <source src="/videos/hero-turbine-1080.mp4" type="video/mp4" />
    </video>
  );
}
