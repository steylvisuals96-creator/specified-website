import type { Access, Where } from "payload";

/**
 * Toegangsregels op één plek.
 *
 * Uitgangspunt: Payload weigert standaard alles voor wie niet ingelogd is.
 * Elke `read: () => true` is dus een bewuste doorbraak van die regel en moet
 * te verantwoorden zijn met "de publieke website heeft dit nodig". Alles wat
 * de website niet rendert, hoort achter een login.
 */

/** Alleen voor wie ingelogd is. Gebruik dit voor alles wat intern is. */
export const alleenIngelogd: Access = ({ req }) => Boolean(req.user);

/** Alleen voor beheerders. */
export const alleenBeheerder: Access = ({ req }) => req.user?.rol === "beheerder";

/**
 * Publiek leesbaar, maar enkel de records die de website ook echt toont.
 * Een bezoeker heeft niets te maken met een ingevulde of on-hold vacature,
 * of met een blogartikel dat nog in concept staat.
 */
export function publiekMits(filter: Where): Access {
  return ({ req }) => {
    if (req.user) return true; // redactie ziet alles
    return filter;
  };
}
