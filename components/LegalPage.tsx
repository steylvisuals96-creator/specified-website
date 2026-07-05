import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "calc(72px + 5rem) clamp(1.5rem, 5vw, 4rem) 5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(3rem, 8vw, 5.5rem)",
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "0.01em",
            color: "var(--white)",
            marginBottom: "0.75rem",
          }}
        >
          {title}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "3rem" }}>
          Laatst bijgewerkt: {updated}
        </p>
        <div className="legal-body">{children}</div>
      </main>
      <Footer />
      <style>{`
        .legal-body h2 {
          font-family: var(--font-bebas);
          font-size: 1.75rem;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: var(--lime);
          margin: 2.5rem 0 0.75rem;
        }
        .legal-body p, .legal-body li {
          color: rgba(255,255,255,0.7);
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 0.9rem;
        }
        .legal-body ul {
          padding-left: 1.25rem;
          margin-bottom: 0.9rem;
        }
        .legal-body li { margin-bottom: 0.4rem; }
        .legal-body a { color: var(--lime); text-decoration: underline; }
        .legal-body strong { color: var(--white); font-weight: 600; }
      `}</style>
    </>
  );
}
