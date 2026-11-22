import { taal } from "next/root-params";
import { isTaal, STANDAARD_TAAL, type Taal } from "./taal";

/**
 * De taal van de pagina die nu gebouwd wordt, uit het adres (app/[taal]).
 * Werkt in elk servercomponent, ook in generateMetadata, zonder dat de taal
 * doorgegeven moet worden. Niet in route handlers of server actions.
 */
export async function huidigeTaal(): Promise<Taal> {
  const t = await taal();
  return isTaal(t) ? t : STANDAARD_TAAL;
}
