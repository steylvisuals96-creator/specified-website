"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Verticale hoofdstukaanduiding links onderaan (alleen op brede schermen):
 * "02 / 05 — Diensten". Leest elke sectie met data-chapter en toont de sectie
 * die het midden van het scherm kruist. Boven de eerste sectie verdwijnt ze.
 */
export default function Chapters() {
  const [chapters, setChapters] = useState<string[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));

    const update = () => {
      const mid = window.innerHeight / 2;
      let current = -1;
      els.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) current = i;
        else if (r.bottom <= mid) current = Math.max(current, i);
      });
      // Onder de laatste sectie (footer) blijft de laatste actief.
      if (els.length && els[0].getBoundingClientRect().top > mid) current = -1;
      setActive(current);
    };
    // Eerste meting na het tekenen van het frame, niet midden in de effect-run.
    const raf = requestAnimationFrame(() => {
      setChapters(els.map((el) => el.dataset.chapter ?? ""));
      update();
    });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const visible = active >= 0 && chapters.length > 0;

  return (
    <div
      aria-hidden="true"
      className="chapters"
      style={{
        position: "fixed",
        left: "clamp(0.75rem, 1.6vw, 1.75rem)",
        bottom: "2rem",
        zIndex: 50,
        pointerEvents: "none",
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        display: "flex",
        alignItems: "center",
        gap: "0.9rem",
        fontSize: "0.68rem",
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <span style={{ color: "var(--lime)" }}>{pad(Math.max(active, 0) + 1)}</span>
      <span style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)", position: "relative", overflow: "hidden" }}>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${chapters.length ? ((Math.max(active, 0) + 1) / chapters.length) * 100 : 0}%`,
            background: "var(--lime)",
            transition: "height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </span>
      <span>{pad(chapters.length)}</span>
      <span style={{ display: "inline-block", height: "8rem", overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={chapters[active] ?? "none"}
            initial={{ x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block", color: "var(--white)" }}
          >
            {chapters[active] ?? ""}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
