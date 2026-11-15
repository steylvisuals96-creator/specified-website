import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import NaamFormulier from "@/components/NaamFormulier";
import WachtwoordFormulier from "@/components/WachtwoordFormulier";
import Tweestap from "@/components/Tweestap";
import { vereisSessie } from "@/lib/sessie";

export const metadata: Metadata = { title: "Account" };

const ROL: Record<string, string> = { creator: "Creator (SteylVisuals)", beheerder: "Beheerder", redacteur: "Redacteur" };

export default async function Account({ searchParams }: { searchParams: Promise<{ tweestap?: string }> }) {
  const s = await vereisSessie({ ookZonderTweestap: true });
  const { tweestap } = await searchParams;
  const verplicht = process.env.MFA_VERPLICHT === "1";

  return (
    <>
      <Paginakop titel="Account" accent={s.naam} vul={50} uitleg={`${s.email}, ${ROL[s.rol] ?? s.rol}.`} />
      {tweestap === "verplicht" && s.tweestapNodig && (
        <p role="alert" className="glas px-5 py-4 mb-5 border-[var(--limoen)]">
          Stel eerst tweestapslogin in. Daarna kan je verder in het beheer.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <section className="paneel blad flex flex-col gap-5 lg:col-span-2">
          <h2 className="text-[30px]">Tweestapslogin</h2>
          <Tweestap aan={s.tweestapAan} verplicht={verplicht} />
        </section>
        <section className="paneel flex flex-col gap-5">
          <h2 className="text-[30px]">Naam</h2>
          <NaamFormulier naam={s.naam} />
        </section>
        <section className="paneel flex flex-col gap-5">
          <h2 className="text-[30px]">Wachtwoord</h2>
          <WachtwoordFormulier />
        </section>
      </div>
    </>
  );
}
