import type { Metadata } from "next";
import CodeFormulier from "./CodeFormulier";
import { Woordmerk } from "@/components/Merk";

export const metadata: Metadata = { title: "Code invullen" };

export default function Code() {
  return (
    <main className="min-h-dvh grid place-items-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <Woordmerk hoogte={24} />
        <h1 className="text-[clamp(3rem,9vw,4.25rem)] mt-8">
          Tweede <span className="accent text-[0.62em] align-[0.12em]">stap</span>
        </h1>
        <div className="maatlijn mb-6" style={{ ["--vul" as string]: "68%" }} aria-hidden="true" />
        <p className="stil mb-6">Open je authenticator-app en vul de code van zes cijfers in die bij Specified staat.</p>
        <CodeFormulier />
      </div>
    </main>
  );
}
