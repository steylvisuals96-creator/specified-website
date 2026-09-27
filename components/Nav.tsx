"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// Eén bron voor desktop- én mobiel menu. "Jobs" gaat rechtstreeks naar de
// volledige vacaturepagina; de rest scrollt naar een sectie op de homepage.
const NAV_ITEMS = [
  { label: "Diensten", href: "/#diensten" },
  { label: "Jobs", href: "/vacatures" },
  { label: "Blog", href: "/blog" },
  { label: "Over ons", href: "/#over-ons" },
  { label: "Contact", href: "/#contact" },
];

export default function Nav() {
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
        <Link href="/" className="site-nav__logo" aria-label="Specified, naar de homepage">
          <Image
            src="/images/team/logo_specified.svg"
            alt=""
            width={140}
            height={36}
            style={{ filter: "brightness(0) invert(0.92)", height: "26px", width: "auto" }}
            priority
          />
        </Link>

        <nav className="site-nav__links nav-desktop" aria-label="Hoofdmenu">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="site-nav__link">
              {item.label}
            </Link>
          ))}
          <a href="/#contact" className="btn btn-primary site-nav__cta">
            Neem contact op
          </a>
        </nav>

        <button
          type="button"
          className="site-nav__burger nav-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobiel-menu"
          aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
        >
          <span data-open={menuOpen} />
          <span data-open={menuOpen} />
        </button>
      </div>

      {menuOpen && (
        <nav id="mobiel-menu" className="site-nav__mobile" aria-label="Mobiel menu">
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
          <a href="/#contact" onClick={() => setMenuOpen(false)} className="btn btn-primary">
            Neem contact op
          </a>
        </nav>
      )}
    </header>
  );
}
