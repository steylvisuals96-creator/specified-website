"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const LIME = "#dffd7b";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.4)";

export default function ZoekFilter({ placeholder = "Zoeken…", paramName = "q" }: { placeholder?: string; paramName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramName) ?? "");
  const [, startTransition] = useTransition();

  function handleChange(v: string) {
    setValue(v);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (v) params.set(paramName, v);
      else params.delete(paramName);
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
      <span style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: "0.85rem", pointerEvents: "none" }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", paddingLeft: "2rem", paddingRight: value ? "2rem" : "0.65rem",
          paddingTop: "0.45rem", paddingBottom: "0.45rem",
          background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
          borderRadius: "4px", color: "#f0f0f0", fontSize: "0.82rem",
          fontFamily: "inherit", outline: "none",
          boxSizing: "border-box",
        }}
      />
      {value && (
        <button onClick={() => handleChange("")} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, padding: 0 }}>✕</button>
      )}
    </div>
  );
}
