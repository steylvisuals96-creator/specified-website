import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "2rem clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image
            src="/images/team/logo_specified.svg"
            alt="Specified"
            width={120}
            height={30}
            style={{ filter: "brightness(0) invert(1)", height: "22px", width: "auto" }}
          />
        </Link>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <a
            href="https://www.linkedin.com/company/specified-be"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 400 }}
          >
            LinkedIn
          </a>
          <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
            © 2026 Specified BV — Kontich, België
          </span>
        </div>
      </div>
    </footer>
  );
}
