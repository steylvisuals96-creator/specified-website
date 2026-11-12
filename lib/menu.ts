/**
 * Eén menu voor de hele back-office: de zijbalk van /dashboard en de navigatie
 * van /admin lezen allebei deze lijst, zodat ze nooit uit elkaar lopen.
 *
 * `alleenBeheerder` verbergt het item voor consultants. Dat is alleen
 * gebruiksgemak: de toegang zelf wordt op de server bewaakt (lib/access.ts).
 */
export type MenuIcoon =
  | "overzicht"
  | "pipeline"
  | "kandidaten"
  | "sollicitaties"
  | "vacatures"
  | "bedrijven"
  | "agenda"
  | "activiteiten"
  | "blog"
  | "team"
  | "media"
  | "gebruikers"
  | "instellingen"
  | "beheer";

export type MenuItem = {
  href: string;
  label: string;
  icoon: MenuIcoon;
  alleenBeheerder?: boolean;
  /** Alleen voor de creator (de bouwer); ook beheerders van de klant zien het niet. */
  alleenCreator?: boolean;
};

export type MenuGroep = { titel?: string; items: MenuItem[] };

export const MENU: MenuGroep[] = [
  {
    items: [
      { href: "/dashboard", label: "Overzicht", icoon: "overzicht" },
      { href: "/dashboard/vacatures", label: "Vacatures", icoon: "vacatures" },
      // De recruitmentmodules blijven bestaan, maar Specified beheert alleen
      // vacatures en blog en krijgt sollicitaties per mail (invullijst
      // 2026-11-12). Daarom alleen nog zichtbaar voor de creator.
      { href: "/dashboard/pipeline", label: "Pipeline", icoon: "pipeline", alleenCreator: true },
      { href: "/dashboard/kandidaten", label: "Kandidaten", icoon: "kandidaten", alleenCreator: true },
      { href: "/dashboard/sollicitaties", label: "Sollicitaties", icoon: "sollicitaties", alleenCreator: true },
      { href: "/dashboard/bedrijven", label: "Bedrijven", icoon: "bedrijven", alleenCreator: true },
      { href: "/dashboard/agenda", label: "Agenda", icoon: "agenda", alleenCreator: true },
      { href: "/dashboard/activiteiten", label: "Activiteiten", icoon: "activiteiten", alleenCreator: true },
    ],
  },
  {
    titel: "Website",
    items: [
      { href: "/dashboard/homepage", label: "Homepage", icoon: "overzicht", alleenBeheerder: true },
      { href: "/dashboard/blog", label: "Blog", icoon: "blog" },
      { href: "/dashboard/team", label: "Team", icoon: "team" },
      { href: "/dashboard/media", label: "Media", icoon: "media" },
    ],
  },
  {
    titel: "Beheer",
    items: [
      { href: "/dashboard/gebruikers", label: "Gebruikers", icoon: "gebruikers", alleenBeheerder: true },
      // Voor de klant overbodig: de teksten passen ze aan via Homepage. Blijft
      // voor de creator, want de website leest hier nog contact-e-mail,
      // telefoon, LinkedIn, footertekst en bedrijfsnaam uit.
      { href: "/dashboard/instellingen", label: "Instellingen", icoon: "instellingen", alleenCreator: true },
    ],
  },
];

export function menuVoor(rol?: string | null): MenuGroep[] {
  const creator = rol === "creator";
  const beheerder = rol === "beheerder" || creator;
  return MENU.map((g) => ({
    ...g,
    items: g.items.filter((i) => (beheerder || !i.alleenBeheerder) && (creator || !i.alleenCreator)),
  })).filter(
    (g) => g.items.length > 0,
  );
}

/** Actief als het pad gelijk is, of eronder valt (behalve voor het overzicht). */
export function isActief(href: string, pad: string) {
  if (href === "/dashboard" || href === "/admin") return pad === href;
  return pad === href || pad.startsWith(href + "/");
}
