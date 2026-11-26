"use client";

// Navigatie. Desktop: zijbalk als matglas-paneel met één glijdend blokje achter de actieve pagina.
// Telefoon: smalle balk bovenaan en een vaste tabbalk onderaan, met "Meer" voor de rest.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { uitloggen } from "@/lib/auth-acties";
import { Teken, Woordmerk } from "./Merk";

type NavLink = { href: string; label: string; alleenBeheerder?: boolean };

const GROEPEN: { naam: string; links: NavLink[] }[] = [
  {
    naam: "Website",
    links: [
      { href: "/", label: "Overzicht" },
      { href: "/vacatures", label: "Vacatures" },
      { href: "/blog", label: "Blog" },
      { href: "/homepage", label: "Homepage", alleenBeheerder: true },
      { href: "/paginas", label: "Pagina's", alleenBeheerder: true },
      { href: "/seizoensthema", label: "Seizoensthema", alleenBeheerder: true },
      { href: "/seo", label: "SEO-bot", alleenBeheerder: true },
      { href: "/team", label: "Team" },
      { href: "/media", label: "Media" },
    ],
  },
  {
    naam: "Beheer",
    links: [
      { href: "/revisies", label: "Revisies" },
      { href: "/gebruikers", label: "Gebruikers", alleenBeheerder: true },
      { href: "/logboek", label: "Logboek", alleenBeheerder: true },
      { href: "/account", label: "Account" },
    ],
  },
];

const isActief = (pad: string, href: string) => (href === "/" ? pad === "/" : pad === href || pad.startsWith(`${href}/`));

const ICOON = {
  overzicht: (
    <>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="4" />
      <rect x="13" y="10" width="7" height="10" />
      <rect x="4" y="13" width="7" height="7" />
    </>
  ),
  vacatures: (
    <>
      <rect x="3.5" y="7" width="17" height="12.5" />
      <path d="M9 7V4.5h6V7M3.5 12.5h17" />
    </>
  ),
  blog: <path d="M5 4h10l4 4v12H5zM15 4v4h4M8.5 12h7M8.5 15.5h7" />,
  homepage: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" />
      <path d="M3.5 8.5h17M7 12.5h6M7 15.5h10" />
    </>
  ),
  meer: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" />
    </>
  ),
};

const TABS = [
  { href: "/", label: "Overzicht", icoon: ICOON.overzicht },
  { href: "/vacatures", label: "Vacatures", icoon: ICOON.vacatures },
  { href: "/blog", label: "Blog", icoon: ICOON.blog },
  { href: "/homepage", label: "Homepage", icoon: ICOON.homepage },
];

// De rand in de richting van de beweging vertrekt eerst en sneller, de achterste komt erachteraan:
// zo rekt het blokje even uit (zelfde beweging als in de studio).
const SNEL = "0.34s cubic-bezier(.215,.61,.355,1)";
const TRAAG = "0.52s cubic-bezier(.645,.045,.355,1)";

function ZijLijst({ pad, groepen }: { pad: string; groepen: typeof GROEPEN }) {
  const doos = useRef<HTMLDivElement>(null);
  const vorige = useRef<number | null>(null);
  const [blok, setBlok] = useState({ boven: 0, onder: 0, omlaag: true, zichtbaar: false });

  useLayoutEffect(() => {
    const plaats = () => {
      const d = doos.current;
      const el = d?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!d || !el) return setBlok((b) => ({ ...b, zichtbaar: false }));
      const r = el.getBoundingClientRect();
      const rd = d.getBoundingClientRect();
      const boven = r.top - rd.top;
      const omlaag = vorige.current === null || boven >= vorige.current;
      vorige.current = boven;
      setBlok({ boven, onder: rd.bottom - r.bottom, omlaag, zichtbaar: true });
    };
    plaats();
    addEventListener("resize", plaats);
    return () => removeEventListener("resize", plaats);
  }, [pad]);

  return (
    <div ref={doos} className="relative flex flex-col gap-7">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 rounded-[2px] bg-[var(--paneel-sterk)] border border-[var(--glasrand)] motion-reduce:!transition-none"
        style={{
          top: blok.boven,
          bottom: blok.onder,
          opacity: blok.zichtbaar ? 1 : 0,
          transition: `top ${blok.omlaag ? TRAAG : SNEL}, bottom ${blok.omlaag ? SNEL : TRAAG}, opacity .2s`,
        }}
      />
      {groepen.map((g) => (
        <div key={g.naam} className="relative z-[1]">
          <p className="px-3 mb-1.5 text-[19px] text-[var(--zwak)] kop">{g.naam}</p>
          <ul className="flex flex-col">
            {g.links.map((l) => {
              const actief = isActief(pad, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={actief ? "page" : undefined}
                    className={`relative flex items-center gap-2.5 px-3 py-[7px] text-[14px] transition-colors ${
                      actief ? "text-[var(--tekst)] font-medium" : "text-[var(--stil)] hover:text-[var(--tekst)]"
                    }`}
                  >
                    <span className={`h-3.5 w-[2px] transition-colors ${actief ? "bg-limoen" : "bg-transparent"}`} aria-hidden="true" />
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function Nav({ naam, beheerder }: { naam: string; beheerder: boolean }) {
  const pad = usePathname();
  const [meer, setMeer] = useState(false);
  const groepen = GROEPEN.map((g) => ({ ...g, links: g.links.filter((l) => beheerder || !l.alleenBeheerder) })).filter((g) => g.links.length);
  const tabs = TABS.filter((t) => beheerder || t.href !== "/homepage");

  useEffect(() => setMeer(false), [pad]);
  useEffect(() => {
    if (!meer) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMeer(false);
    addEventListener("keydown", esc);
    document.documentElement.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", esc);
      document.documentElement.style.overflow = "";
    };
  }, [meer]);

  const inTabs = tabs.some((t) => isActief(pad, t.href));
  const kolommen = tabs.length + 1;
  const tabIndex = meer || !inTabs ? tabs.length : tabs.findIndex((t) => isActief(pad, t.href));
  const vorigeTab = useRef(tabIndex);
  const naarRechts = tabIndex >= vorigeTab.current;
  useEffect(() => {
    vorigeTab.current = tabIndex;
  }, [tabIndex]);

  return (
    <>
      {/* Desktop: zijbalk */}
      <nav aria-label="Hoofdmenu" className="hidden md:flex md:sticky md:top-0 md:h-dvh md:p-3">
        <div className="glas flex flex-col gap-9 w-full overflow-y-auto px-4 py-7">
          <Link href="/" className="px-3 block" aria-label="Overzicht">
            <Woordmerk hoogte={19} />
          </Link>
          <ZijLijst pad={pad} groepen={groepen} />
          <div className="mt-auto px-3 flex flex-col gap-1">
            <p className="text-[13px] text-[var(--stil)] truncate">{naam}</p>
            <form action={uitloggen}>
              <button type="submit" className="tekstknop">
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Telefoon: balk bovenaan */}
      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 bg-[rgba(20,20,22,.7)] backdrop-blur-xl border-b border-[var(--lijn)] px-4 pt-[calc(env(safe-area-inset-top)+10px)] pb-2.5">
        <Teken grootte={20} />
        <span className="kop text-[22px] pt-[3px]">Beheer</span>
      </header>

      {/* Telefoon: tabbalk onderaan */}
      <nav
        aria-label="Snelmenu"
        className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-[rgba(20,20,22,.78)] backdrop-blur-xl border-t border-[var(--lijn)] pb-[env(safe-area-inset-bottom)] select-none"
      >
        <span
          aria-hidden="true"
          className="absolute bottom-[calc(env(safe-area-inset-bottom)+4px)] h-[2px] bg-limoen shadow-[0_0_12px_rgba(223,253,123,.7)] motion-reduce:!transition-none"
          style={{
            left: `calc(${(tabIndex * 100) / kolommen}% + 6%)`,
            right: `calc(${((kolommen - 1 - tabIndex) * 100) / kolommen}% + 6%)`,
            transition: `left ${naarRechts ? TRAAG : SNEL}, right ${naarRechts ? SNEL : TRAAG}`,
          }}
        />
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${kolommen}, minmax(0, 1fr))` }}>
          {tabs.map((t) => {
            const actief = isActief(pad, t.href) && !meer;
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={actief ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 pt-2.5 pb-2.5 text-[11px] font-medium active:opacity-60 transition-opacity ${
                    actief ? "text-[var(--tekst)]" : "text-[var(--stil)]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className={`w-6 h-6 fill-none stroke-current ${actief ? "stroke-[1.8]" : "stroke-[1.4]"}`} strokeLinejoin="round" aria-hidden="true">
                    {t.icoon}
                  </svg>
                  {t.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMeer((m) => !m)}
              aria-expanded={meer}
              aria-controls="meer-paneel"
              className={`w-full flex flex-col items-center gap-1 pt-2.5 pb-2.5 text-[11px] font-medium active:opacity-60 ${
                meer || !inTabs ? "text-[var(--tekst)]" : "text-[var(--stil)]"
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[1.4]" strokeLinejoin="round" aria-hidden="true">
                {ICOON.meer}
              </svg>
              Meer
            </button>
          </li>
        </ul>
      </nav>

      {/* Telefoon: Meer-paneel */}
      <div
        className={`md:hidden fixed inset-0 z-30 bg-[rgba(0,0,0,.5)] transition-opacity duration-200 ${meer ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMeer(false)}
        aria-hidden="true"
      />
      <div
        id="meer-paneel"
        role="dialog"
        aria-modal="true"
        aria-label="Alle pagina's"
        aria-hidden={!meer}
        inert={!meer}
        className={`md:hidden fixed inset-x-0 bottom-0 z-35 max-h-[82dvh] overflow-y-auto overscroll-contain bg-[rgba(28,28,31,.96)] backdrop-blur-2xl border-t border-[var(--glasrand)]
          pb-[calc(env(safe-area-inset-bottom)+5.5rem)] transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${meer ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto mt-2.5 h-[3px] w-10 bg-[var(--lijn)]" aria-hidden="true" />
        <div className="px-6 pt-4 grid grid-cols-2 gap-x-6 gap-y-7">
          {groepen.map((g) => (
            <div key={g.naam}>
              <p className="kop text-[20px] mb-1.5">{g.naam}</p>
              <ul>
                {g.links.map((l) => {
                  const actief = isActief(pad, l.href);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={actief ? "page" : undefined}
                        className={`block py-2 text-[15px] active:opacity-60 ${actief ? "text-[var(--tekst)] font-medium underline decoration-limoen decoration-2 underline-offset-[5px]" : "text-[var(--stil)]"}`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <form action={uitloggen} className="px-6 mt-8">
          <button type="submit" className="tekstknop">
            Uitloggen ({naam})
          </button>
        </form>
      </div>
    </>
  );
}
