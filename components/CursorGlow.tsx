"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"], [onclick]';

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const glowPos = useRef({ x: -200, y: -200 });
  const hovering = useRef(false);

  useEffect(() => {
    // Verberg de systeemcursor enkel zolang deze component actief is
    document.documentElement.classList.add("custom-cursor");

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const target = e.target as Element | null;
      hovering.current = !!target?.closest?.(INTERACTIVE);
    };
    window.addEventListener("mousemove", onMove);

    let raf: number;
    const tick = () => {
      const grow = hovering.current;
      const size = grow ? 34 : 8;
      const offset = size / 2;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - offset}px, ${pos.current.y - offset}px)`;
        dotRef.current.style.width = `${size}px`;
        dotRef.current.style.height = `${size}px`;
        dotRef.current.style.background = grow ? "transparent" : "#dffd7b";
        dotRef.current.style.border = grow ? "1.5px solid #dffd7b" : "none";
      }
      glowPos.current.x += (pos.current.x - glowPos.current.x) * 0.08;
      glowPos.current.y += (pos.current.y - glowPos.current.y) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${glowPos.current.x - 200}px, ${glowPos.current.y - 200}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  return (
    <>
      {/* Puntje / ring — groeit boven klikbare elementen */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 9999,
          width: 8, height: 8, borderRadius: "50%",
          background: "#dffd7b", pointerEvents: "none",
          mixBlendMode: "difference",
          transition: "width 0.18s ease, height 0.18s ease, background 0.18s ease, border 0.18s ease",
          willChange: "transform, width, height",
        }}
      />
      {/* Zachte glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 0,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(223,253,123,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
    </>
  );
}
