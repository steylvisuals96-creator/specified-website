"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import CookieVoorkeurenLink from "@/components/CookieVoorkeurenLink";
import { useTaal } from "@/components/TaalContext";
import { lokaalPad } from "@/lib/taal";
import { ui } from "@/lib/teksten";

export default function Footer({ linkedin, footerTekst }: { linkedin?: string; footerTekst?: string } = {}) {
  const taal = useTaal();
  const t = ui(taal);
  const p = (pad: string) => lokaalPad(taal, pad);
  const linkedinUrl = linkedin || "https://www.linkedin.com/company/specified-be";
  const bedrijfsregel = footerTekst || "© 2026 Specified NV, Veldkant 31a, 2550 Kontich";

  return (
    <footer className="footer">
      {/* Traag, decoratief, stopt bij hover en bij reduced motion. */}
      <div className="footer__band" aria-hidden="true">
        <div className="footer__track display">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i}>Specified</span>
          ))}
        </div>
      </div>

      <div className="wrap footer__rij">
        <Link href={p("/")} className="footer__logo" aria-label={t.naarHome}>
          <Logo className="logo--footer" />
        </Link>
        <nav className="footer__links" aria-label="Footer">
          <Link href={p("/voor-bedrijven")}>{t.menu.bedrijven}</Link>
          <Link href={p("/voor-engineers")}>{t.menu.engineers}</Link>
          <Link href={p("/vacatures")}>{t.menu.vacatures}</Link>
          <Link href={p("/blog")}>{t.menu.blog}</Link>
          <Link href={p("/faq")}>{t.menu.faq}</Link>
          <Link href={p("/contact")}>{t.menu.contact}</Link>
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" data-bewerk="contact.linkedin">
            LinkedIn
          </a>
        </nav>
      </div>
      <div className="wrap footer__rij footer__rij--onder">
        <p className="meta" data-bewerk="contact.footerTekst">{bedrijfsregel}</p>
        <nav className="footer__links footer__links--klein" aria-label={t.menu.juridisch}>
          <Link href={p("/privacy")}>{t.juridisch.privacy}</Link>
          <Link href={p("/cookies")}>{t.juridisch.cookies}</Link>
          <Link href={p("/algemene-voorwaarden")}>{t.juridisch.voorwaarden}</Link>
          <Link href={p("/disclaimer")}>{t.juridisch.disclaimer}</Link>
          <Link href={p("/toegankelijkheid")}>{t.juridisch.toegankelijkheid}</Link>
          <CookieVoorkeurenLink style={{ fontSize: "0.875rem" }} />
        </nav>
      </div>
    </footer>
  );
}
