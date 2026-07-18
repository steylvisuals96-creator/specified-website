import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Pagina niet gevonden — Specified",
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "calc(72px + 4rem) clamp(1.5rem, 5vw, 4rem) 4rem",
          width: "100%",
        }}
      >
        <p style={{ color: "var(--lime)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1rem" }}>
          Fout 404
        </p>
        <h1
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(4rem, 12vw, 10rem)",
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "0.01em",
            color: "var(--white)",
            marginBottom: "1.5rem",
          }}
        >
          Deze pagina<br />bestaat niet.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "clamp(1rem, 1.5vw, 1.15rem)", lineHeight: 1.55, maxWidth: "460px", marginBottom: "2.5rem" }}>
          De link die je volgde is verlopen of verkeerd. Geen zorgen — hieronder vind je de weg terug.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/" style={{ backgroundColor: "var(--lime)", color: "var(--dark)", padding: "0.85rem 1.75rem", borderRadius: "6px", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none" }}>
            Naar de homepage
          </Link>
          <Link href="/vacatures" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "var(--white)", padding: "0.85rem 1.75rem", borderRadius: "6px", fontSize: "0.9rem", fontWeight: 400, textDecoration: "none" }}>
            Bekijk vacatures
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
