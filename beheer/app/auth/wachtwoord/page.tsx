import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Woordmerk } from "@/components/Merk";
import WachtwoordFormulier from "@/components/WachtwoordFormulier";

export const metadata: Metadata = { title: "Wachtwoord kiezen" };

export default async function Wachtwoord() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login?link=ongeldig");
  // Met tweestapslogin eerst de code uit de app, daarna pas een nieuw wachtwoord.
  if ((user.factors ?? []).some((f) => f.status === "verified")) {
    const { data: token } = await sb.auth.getClaims();
    if (token?.claims?.aal !== "aal2") redirect("/login/code?verder=wachtwoord");
  }

  return (
    <main className="min-h-dvh grid place-items-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <Woordmerk hoogte={24} />
        <h1 className="text-[clamp(3rem,9vw,4.25rem)] mt-8">
          Kies een <span className="accent text-[0.62em] align-[0.12em]">wachtwoord</span>
        </h1>
        <div className="maatlijn mb-6" style={{ ["--vul" as string]: "50%" }} aria-hidden="true" />
        <p className="stil mb-6">Voor {user.email}. Minstens 12 tekens; een zin van een paar woorden werkt goed.</p>
        <WachtwoordFormulier naHerstel />
      </div>
    </main>
  );
}
