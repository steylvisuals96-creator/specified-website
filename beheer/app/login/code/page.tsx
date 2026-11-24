import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CodeFormulier from "./CodeFormulier";
import { Woordmerk } from "@/components/Merk";
import { sessieStand } from "@/lib/sessie";

export const metadata: Metadata = { title: "Code invullen" };

export default async function Code({ searchParams }: { searchParams: Promise<{ verder?: string }> }) {
  const { verder } = await searchParams;
  // Alleen wie het wachtwoord al gaf en nog een code moet invullen.
  const stand = await sessieStand();
  if (stand.soort === "uit") redirect("/auth/uitloggen");
  if (stand.soort !== "code") redirect("/");
  return (
    <main className="min-h-dvh grid place-items-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <Woordmerk hoogte={24} />
        <h1 className="text-[clamp(3rem,9vw,4.25rem)] mt-8">
          Tweede <span className="accent text-[0.62em] align-[0.12em]">stap</span>
        </h1>
        <div className="maatlijn mb-6" style={{ ["--vul" as string]: "68%" }} aria-hidden="true" />
        <p className="stil mb-6">Open je authenticator-app en vul de code van zes cijfers in die bij Specified staat.</p>
        <CodeFormulier verder={verder === "wachtwoord" ? "wachtwoord" : undefined} />
      </div>
    </main>
  );
}
