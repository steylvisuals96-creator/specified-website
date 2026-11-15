import type { Metadata } from "next";
import InlogFormulier from "./InlogFormulier";
import { Woordmerk } from "@/components/Merk";

export const metadata: Metadata = { title: "Inloggen" };

export default function Login() {
  return (
    <main className="min-h-dvh grid place-items-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <Woordmerk hoogte={24} />
        <h1 className="text-[clamp(3rem,9vw,4.25rem)] mt-8">
          Beheer <span className="accent text-[0.62em] align-[0.12em]">van de website</span>
        </h1>
        <div className="maatlijn mb-8" style={{ ["--vul" as string]: "34%" }} aria-hidden="true" />
        <InlogFormulier />
        <p className="zwak text-[13px] mt-6">Wachtwoord vergeten? Vraag een nieuwe link aan je beheerder.</p>
      </div>
    </main>
  );
}
