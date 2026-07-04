"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const glowPos = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    let raf: number;
    const tick = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
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
    };
  }, []);

  return (
    <>
      {/* Small sharp dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 9999,
          width: 8, height: 8, borderRadius: "50%",
          background: "#dffd7b", pointerEvents: "none",
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
      {/* Large soft glow */}
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
