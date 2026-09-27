import Image from "next/image";
import Link from "next/link";
import CookieVoorkeurenLink from "@/components/CookieVoorkeurenLink";

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
          <Image
            src="/images/team/logo_specified.svg"
            alt=""
            width={120}
            height={30}
            style={{ filter: "brightness(0) invert(0.92)", height: "22px", width: "auto" }}
          />
        </Link>
        <nav className="footer__links" aria-label="Footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <CookieVoorkeurenLink />
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </nav>
        <p className="meta">{bedrijfsregel}</p>
      </div>
    </footer>
  );
}
