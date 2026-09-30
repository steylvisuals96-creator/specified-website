import Logo from "@/components/Logo";
import Link from "next/link";
import CookieVoorkeurenLink from "@/components/CookieVoorkeurenLink";
import T from "@/components/T";

export default function Footer({ linkedin, footerTekst }: { linkedin?: string; footerTekst?: string } = {}) {
  const linkedinUrl = linkedin || "https://www.linkedin.com/company/specified-be";
  const bedrijfsregel = footerTekst || "© 2026 Specified BV — Kontich, België";

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
        <Link href="/" aria-label="Specified, naar de homepage">
          <Logo className="logo--footer" />
        </Link>
        <nav className="footer__links" aria-label="Footer">
          <Link href="/privacy">
            <T k="footer.privacy" />
          </Link>
          <Link href="/cookies">
            <T k="footer.cookies" />
          </Link>
          <CookieVoorkeurenLink />
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            <T k="footer.linkedin" />
          </a>
        </nav>
        <p className="meta">
          <T k="footer.bedrijfsregel" d={bedrijfsregel} />
        </p>
      </div>
    </footer>
  );
}
