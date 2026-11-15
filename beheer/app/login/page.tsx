import type { Metadata } from "next";
import InlogFormulier from "./InlogFormulier";
import { Woordmerk } from "@/components/Merk";

export const metadata: Metadata = { title: "Inloggen" };

const MELDINGEN: Record<string, string> = {
  "geen-toegang": "Dit account heeft geen toegang tot het beheer. Vraag het aan je beheerder.",
  ongeldig: "Die link is verlopen of al gebruikt. Vraag je beheerder om een nieuwe.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ melding?: string; link?: string }> }) {
  const { melding, link } = await searchParams;
  const tekst = MELDINGEN[melding ?? ""] ?? MELDINGEN[link ?? ""];
  return (
    <main className="min-h-dvh grid place-items-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <Woordmerk hoogte={24} />
        <h1 className="text-[clamp(3rem,9vw,4.25rem)] mt-8">
          Beheer <span className="accent text-[0.62em] align-[0.12em]">van de website</span>
        </h1>
        <div className="maatlijn mb-8" style={{ ["--vul" as string]: "34%" }} aria-hidden="true" />
        {tekst && (
          <p role="alert" className="glas px-4 py-3 mb-5 text-[14px]">
            {tekst}
          </p>
        )}
        <InlogFormulier />
        <p className="zwak text-[13px] mt-6">Wachtwoord vergeten? Vraag een nieuwe link aan je beheerder.</p>
      </div>
    </main>
  );
}
