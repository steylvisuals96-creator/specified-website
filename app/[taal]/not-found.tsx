import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { huidigeTaal } from "@/lib/taal-server";
import { lokaalPad } from "@/lib/taal";
import { ui } from "@/lib/teksten";

export async function generateMetadata() {
  return { title: ui(await huidigeTaal()).nietGevonden.titel };
}

export default async function NotFound() {
  const taal = await huidigeTaal();
  const t = ui(taal).nietGevonden;
  return (
    <>
      <Nav />
      <main
        id="inhoud"
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
          {t.kop1}<br />{t.kop2}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "clamp(1rem, 1.5vw, 1.15rem)", lineHeight: 1.55, maxWidth: "460px", marginBottom: "2.5rem" }}>
          {t.tekst}
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href={lokaalPad(taal, "/")} style={{ backgroundColor: "var(--lime-vlak)", color: "var(--on-lime)", padding: "0.85rem 1.75rem", borderRadius: 0, fontSize: "0.9rem", fontWeight: 600, textDecoration: "none" }}>
            {t.home}
          </Link>
          <Link href={lokaalPad(taal, "/vacatures")} style={{ border: "1px solid var(--line-strong)", color: "var(--white)", padding: "0.85rem 1.75rem", borderRadius: 0, fontSize: "0.9rem", fontWeight: 400, textDecoration: "none" }}>
            {t.vacatures}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
