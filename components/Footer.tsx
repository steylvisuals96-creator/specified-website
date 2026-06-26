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
        <span
          style={{
            fontWeight: 600,
            fontSize: "1rem",
            color: "var(--white)",
            letterSpacing: "-0.02em",
          }}
        >
          specified<span style={{ color: "var(--lime)" }}>.</span>
        </span>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 400 }}
          >
            LinkedIn
          </a>
          <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
            © 2025 Specified BV — Kontich, België
          </span>
        </div>
      </div>
    </footer>
  );
}
