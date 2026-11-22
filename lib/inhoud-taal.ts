import * as NL from "./inhoud";
import * as EN from "./inhoud-en";
import type { Taal } from "./taal";

/** De standaardteksten in een taal (lib/inhoud.ts of lib/inhoud-en.ts). */
export const INHOUD: Record<Taal, typeof NL> = { nl: NL, en: EN };
export const inhoud = (taal: Taal) => INHOUD[taal];
