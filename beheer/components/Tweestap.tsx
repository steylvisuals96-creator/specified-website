"use client";

import { useActionState, useState, useTransition } from "react";
import { tweestapBevestigen, tweestapStarten, tweestapUitzetten, type TweestapStart } from "@/lib/account-acties";
import type { Resultaat } from "@/lib/formulier";

/** Tweestapslogin aanzetten met een authenticator-app (Google Authenticator, 1Password, Microsoft Authenticator). */
export default function Tweestap({ aan, verplicht }: { aan: boolean; verplicht: boolean }) {
  const [start, setStart] = useState<TweestapStart | null>(null);
  const [bezig, transitie] = useTransition();
  const [staat, bevestig, bevestigen] = useActionState(tweestapBevestigen, { ok: false } as Resultaat);
  const [uit, setUit] = useState<Resultaat | null>(null);

  if (staat.ok) return <p className="label" data-toon="goed">{staat.melding}</p>;

  if (aan && !uit?.ok) {
    return (
      <div className="flex flex-col gap-4 items-start">
        <p className="label" data-toon="goed">
          Tweestapslogin staat aan
        </p>
        {!verplicht && (
          <button type="button" className="knop knop-stil knop-klein" disabled={bezig} onClick={() => transitie(async () => setUit(await tweestapUitzetten()))}>
            Uitzetten
          </button>
        )}
        {uit && !uit.ok && <p className="veld-fout">{uit.melding}</p>}
      </div>
    );
  }

  if (!start?.ok) {
    return (
      <div className="flex flex-col gap-4 items-start">
        <p className="stil max-w-[56ch]">Bij het inloggen vragen we dan ook een code uit een app op je telefoon. Zo kan niemand binnen met alleen je wachtwoord.</p>
        <button type="button" className="knop" disabled={bezig} onClick={() => transitie(async () => setStart(await tweestapStarten()))}>
          {bezig ? "Even geduld" : "Tweestapslogin instellen"}
        </button>
        {start && !start.ok && <p className="veld-fout">{start.melding}</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] items-start">
      {/* De QR-code komt als SVG-data-URL van Supabase. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={start.qr} alt="QR-code om te scannen met je authenticator-app" className="w-[180px] h-[180px] bg-white p-2" />
      <form action={bevestig} className="flex flex-col gap-5">
        <ol className="list-decimal pl-5 stil text-[14px] flex flex-col gap-1">
          <li>Open je authenticator-app en scan de code.</li>
          <li>Lukt scannen niet? Typ deze sleutel over: <code className="text-[var(--tekst)] break-all">{start.geheim}</code></li>
          <li>Vul de zes cijfers in die de app toont.</li>
        </ol>
        <input type="hidden" name="factorId" value={start.factorId} />
        <div>
          <label className="veld-label" htmlFor="tweestap-code">
            Code uit de app
          </label>
          <input id="tweestap-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required className="invoer text-[22px] tracking-[0.3em] max-w-[220px]" aria-invalid={Boolean(staat.velden?.code)} />
          {staat.velden?.code && <p className="veld-fout">{staat.velden.code}</p>}
        </div>
        <button className="knop self-start" disabled={bevestigen}>
          {bevestigen ? "Controleren" : "Bevestigen en aanzetten"}
        </button>
      </form>
    </div>
  );
}
