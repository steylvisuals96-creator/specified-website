"use client";

import { createContext, useContext } from "react";
import { STANDAARD_TAAL, type Taal } from "@/lib/taal";

/** De taal van de pagina voor clientcomponenten; de layout zet ze (app/[taal]/layout.tsx). */
const TaalContext = createContext<Taal>(STANDAARD_TAAL);

export function TaalProvider({ taal, children }: { taal: Taal; children: React.ReactNode }) {
  return <TaalContext.Provider value={taal}>{children}</TaalContext.Provider>;
}

export const useTaal = () => useContext(TaalContext);
