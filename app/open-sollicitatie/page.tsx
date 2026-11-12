import type { Metadata } from "next";
import Pagina from "@/components/Pagina";
import Formulier from "@/components/Formulier";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Open sollicitatie — Specified",
  description: "Geen passende vacature gevonden? Stuur Specified je cv en vertel wat je zoekt als engineer.",
  alternates: { canonical: "/open-sollicitatie" },
};

export default function OpenSollicitatie() {
  return (
    <Pagina
      titel="Open sollicitatie"
      inleiding="Staat jouw job er niet tussen? We zoeken ook buiten de openstaande vacatures. Stuur ons je cv en vertel wat je zoekt, dan bekijken we samen wat past."
    >
      <section className="blok">
        <div className="wrap pagina__smal">
          <Formulier soort="open-sollicitatie" />
        </div>
      </section>
    </Pagina>
  );
}
