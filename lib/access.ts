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

/**
 * Rollen, van meeste naar minste rechten:
 * - creator:    SteylVisuals (bouwer/onderhoud). Alles, en het enige account dat
 *               de klant niet kan zien, wijzigen of verwijderen.
 * - beheerder:  eigenaar bij Specified. Alle inhoud, instellingen en eigen gebruikers.
 * - consultant: recruitment consultant. Werkt met kandidaten, vacatures, blog.
 */
export const isCreator = (user: any) => user?.rol === "creator";
export const isBeheerder = (user: any) => user?.rol === "beheerder" || isCreator(user);

/** Alleen voor beheerders (en de creator). */
export const alleenBeheerder: Access = ({ req }) => isBeheerder(req.user);

/** Alleen voor de creator. */
export const alleenCreator: Access = ({ req }) => isCreator(req.user);

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
