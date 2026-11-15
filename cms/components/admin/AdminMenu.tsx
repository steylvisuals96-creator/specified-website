import {
  Activity,
  Briefcase,
  Building2,
  Calendar,
  Contact,
  FileUser,
  House,
  Image as ImageIcon,
  KeyRound,
  Newspaper,
  Settings,
  ShieldCheck,
  SquareKanban,
  Users,
  type LucideIcon,
} from "lucide-react";
import { menuVoor, type MenuIcoon } from "@/lib/menu";

const ICOON: Record<MenuIcoon, LucideIcon> = {
  overzicht: House,
  pipeline: SquareKanban,
  kandidaten: Users,
  sollicitaties: FileUser,
  vacatures: Briefcase,
  bedrijven: Building2,
  agenda: Calendar,
  activiteiten: Activity,
  blog: Newspaper,
  team: Contact,
  media: ImageIcon,
  gebruikers: KeyRound,
  instellingen: Settings,
  beheer: ShieldCheck,
};

/**
 * Hetzelfde menu als de zijbalk van /dashboard (lib/menu.ts), bovenaan de
 * navigatie van /admin. Payloads eigen collectielijst staat eronder, ingeklapt
 * onder "Ruwe gegevens". Stijl: .sv-menu in app/(payload)/specified-admin.css.
 */
export function AdminMenu({ user }: { user?: { rol?: string | null } | null }) {
  const groepen = menuVoor(user?.rol).map((g) => ({
    ...g,
    // "Geavanceerd beheer" wijst naar /admin zelf; hier overbodig.
    items: g.items.filter((i) => i.href !== "/admin"),
  }));

  return (
    <div className="sv-menu">
      {groepen.map((groep, gi) =>
        groep.items.length === 0 ? null : (
          <div key={groep.titel ?? gi} className="sv-menu__groep">
            {groep.titel && <p className="sv-menu__titel">{groep.titel}</p>}
            <ul>
              {groep.items.map((item) => {
                const Icoon = ICOON[item.icoon];
                return (
                  <li key={item.href}>
                    <a href={item.href} className="sv-menu__link">
                      <Icoon size={18} strokeWidth={1.6} aria-hidden />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ),
      )}
    </div>
  );
}
