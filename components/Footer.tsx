import Logo from "@/components/Logo";
import Link from "next/link";
import CookieVoorkeurenLink from "@/components/CookieVoorkeurenLink";

export default function Footer({ linkedin, footerTekst }: { linkedin?: string; footerTekst?: string } = {}) {
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
        <Link href="/" className="footer__logo" aria-label="Specified, naar de homepage">
          <Logo className="logo--footer" />
        </Link>
        <nav className="footer__links" aria-label="Footer">
          <Link href="/voor-bedrijven">Voor bedrijven</Link>
          <Link href="/voor-engineers">Voor engineers</Link>
          <Link href="/vacatures">Vacatures</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/faq">Veelgestelde vragen</Link>
          <Link href="/contact">Contact</Link>
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" data-bewerk="contact.linkedin">
            LinkedIn
          </a>
        </nav>
      </div>
      <div className="wrap footer__rij footer__rij--onder">
        <p className="meta" data-bewerk="contact.footerTekst">{bedrijfsregel}</p>
        <nav className="footer__links footer__links--klein" aria-label="Juridisch">
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/toegankelijkheid">Toegankelijkheid</Link>
          <CookieVoorkeurenLink style={{ fontSize: "0.875rem" }} />
        </nav>
      </div>
    </footer>
  );
}
