"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  LogOut,
  Menu,
  Newspaper,
  Settings,
  ShieldCheck,
  SquareKanban,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { isActief, menuVoor, type MenuIcoon } from "@/lib/menu";

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

export default function Zijbalk({ userName, rol }: { userName?: string; rol?: string | null }) {
  const pad = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const groepen = menuVoor(rol);

  // Mobiel menu sluit bij navigatie en met Escape.
  useEffect(() => setOpen(false), [pad]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Mobiele balk */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-ink-900 px-4 lg:hidden">
        <Link href="/dashboard" aria-label="Specified, naar het overzicht">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merk/logo-specified.svg" alt="" className="h-[18px] w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="zijbalk"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          className="-mr-2 grid size-10 place-items-center text-bone-100"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <aside
        id="zijbalk"
        data-open={open}
        className="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-line bg-ink-900 max-lg:transition-transform max-lg:duration-200 data-[open=true]:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:translate-x-0"
      >
        <Link href="/dashboard" className="block px-6 pt-7 pb-8" aria-label="Specified, naar het overzicht">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merk/logo-specified.svg" alt="" className="h-[22px] w-auto" />
        </Link>

        <nav aria-label="Hoofdmenu" className="flex-1 overflow-y-auto pb-4">
          {groepen.map((groep, gi) => (
            <div key={groep.titel ?? gi} className={gi > 0 ? "mt-6" : undefined}>
              {groep.titel && <p className="mb-1.5 px-6 text-[0.8125rem] text-bone-600">{groep.titel}</p>}
              <ul>
                {groep.items.map((item) => {
                  const actief = isActief(item.href, pad);
                  const Icoon = ICOON[item.icoon];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={actief ? "page" : undefined}
                        className="relative flex h-10 items-center gap-3.5 px-6 text-[0.9375rem] text-bone-400 transition-colors duration-150 hover:bg-ink-700 hover:text-bone-100 aria-[current=page]:text-lime-300 aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-1.5 aria-[current=page]:before:left-0 aria-[current=page]:before:w-[3px] aria-[current=page]:before:bg-lime-300"
                      >
                        <Icoon className="size-[18px] shrink-0" strokeWidth={1.6} aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-6 py-4">
          {userName && <p className="truncate text-sm text-bone-100">{userName}</p>}
          <a
            href="/admin/logout"
            className="mt-1 inline-flex items-center gap-2 text-sm text-bone-400 transition-colors hover:text-bone-100"
          >
            <LogOut className="size-4" strokeWidth={1.6} aria-hidden />
            Afmelden
          </a>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Menu sluiten"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink-900/70 lg:hidden"
        />
      )}
    </>
  );
}
