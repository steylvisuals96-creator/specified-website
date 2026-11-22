"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemaKnop from "@/components/ThemaKnop";
import { useTaal } from "@/components/TaalContext";
import { inhoud } from "@/lib/inhoud-taal";
import { lokaalPad, wisselPad } from "@/lib/taal";
import { ui } from "@/lib/teksten";
import { useEffect, useState } from "react";

/**
 * Naar dezelfde pagina in de andere taal. Een gewone link (geen client-
 * navigatie): de taal staat in de root layout, dus een volledige lading zet
 * ook html[lang] goed.
 */
function TaalWissel({ metTekst, onKies }: { metTekst?: boolean; onKies?: () => void }) {
  const taal = useTaal();
  const pad = usePathname() ?? "/";
  const andere = taal === "nl" ? "en" : "nl";
  const w = ui(taal).taalWissel;
  // Het hash-deel (bv. #over-ons) meenemen kan pas in de browser.
  const [hash, setHash] = useState("");
  useEffect(() => setHash(window.location.hash), [pad]);
  return (
    <a
      href={wisselPad(pad, andere) + hash}
      hrefLang={w.lang}
      lang={w.lang}
      className="taal-knop"
      data-tekst={metTekst || undefined}
      aria-label={metTekst ? undefined : w.uitleg}
      title={metTekst ? undefined : w.uitleg}
      onClick={onKies}
    >
      {metTekst ? w.label : w.kort}
    </a>
  );
}

export default function Nav() {
  const taal = useTaal();
  const t = ui(taal);
  const CONTACT = inhoud(taal).CONTACT;
  const p = (pad: string) => lokaalPad(taal, pad);
  // Eén bron voor desktop- én mobiel menu.
  const NAV_ITEMS = [
    { label: t.menu.bedrijven, href: p("/voor-bedrijven") },
    { label: t.menu.engineers, href: p("/voor-engineers") },
    { label: t.menu.vacatures, href: p("/vacatures") },
    { label: t.menu.blog, href: p("/blog") },
    { label: t.menu.overOns, href: p("/#over-ons") },
  ];
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape sluit het mobiele menu, zoals bezoekers verwachten.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="site-nav" data-scrolled={scrolled || menuOpen}>
      <div className="wrap site-nav__bar">
        <Link href={p("/")} className="site-nav__logo" aria-label={t.naarHome}>
          <Logo className="logo--nav" />
        </Link>

        <nav className="site-nav__links nav-desktop" aria-label={t.menu.hoofdmenu}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="site-nav__link">
              {item.label}
            </Link>
          ))}
          <TaalWissel />
          <ThemaKnop />
          <Link href={p("/contact")} className="btn btn-primary site-nav__cta">
            {t.menu.contactKnop}
          </Link>
        </nav>

        <button
          type="button"
          className="site-nav__burger nav-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobiel-menu"
          aria-label={menuOpen ? t.menu.sluiten : t.menu.openen}
        >
          <span data-open={menuOpen} />
          <span data-open={menuOpen} />
        </button>
      </div>

      {menuOpen && (
        <nav id="mobiel-menu" className="site-nav__mobile" aria-label={t.menu.mobielMenu}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="site-nav__mobile-link display"
            >
              {item.label}
            </Link>
          ))}
          <Link href={p("/contact")} onClick={() => setMenuOpen(false)} className="btn btn-primary">
            {t.menu.contactKnop}
          </Link>
          <div className="site-nav__mobile-knoppen">
            <ThemaKnop metTekst />
            <TaalWissel metTekst onKies={() => setMenuOpen(false)} />
          </div>
          <div className="site-nav__mobile-contact">
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={`tel:${CONTACT.telefoonLink}`}>{CONTACT.telefoon}</a>
            <span>{CONTACT.plaats}</span>
          </div>
        </nav>
      )}
    </header>
  );
}
