"use client";

import { usePathname } from "next/navigation";

/** Bij een andere pagina komt de inhoud scherp uit een korte waas, zoals in de studio. */
export default function Paginawissel({ children }: { children: React.ReactNode }) {
  const pad = usePathname();
  return (
    <div key={pad} className="paginawissel">
      {children}
    </div>
  );
}
