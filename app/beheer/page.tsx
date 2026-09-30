import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import LoginFormulier from "@/components/admin/LoginFormulier";

// Niet vindbaar en niet in de zoekmachine: dit is een werkpagina, geen onderdeel van de site.
export const metadata: Metadata = {
  title: "Beheer — Specified",
  robots: { index: false, follow: false },
};

export default function BeheerPage() {
  return (
    <main className="wrap" style={{ minHeight: "100svh", display: "grid", alignContent: "center", gap: "2rem", padding: "4rem 0" }}>
      <Link href="/" aria-label="Specified, naar de homepage">
        <Logo className="logo--nav" />
      </Link>
      <div style={{ maxWidth: "26rem" }}>
        <h1 className="display display-m">Beheer</h1>
        <p className="lead" style={{ margin: "1rem 0 2rem" }}>
          Log in met je CRM-account om teksten op de website aan te passen. Wijzigingen blijven concept tot je ze publiceert.
        </p>
        <LoginFormulier />
      </div>
    </main>
  );
}
