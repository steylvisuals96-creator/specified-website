"use client";

import { useActionState, useState } from "react";
import { nieuweLink, rolWijzigen, gebruikerVerwijderen, uitnodigen, type LinkResultaat } from "@/lib/acties/gebruikers";
import { ROLLEN } from "@/lib/opties";
import { Keuze, Tekstveld } from "./Velden";
import VerwijderKnop from "./VerwijderKnop";

function LinkKaart({ link, melding }: { link: string; melding?: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  return (
    <div className="glas melding-in p-4 border-[var(--limoen)] flex flex-col gap-3">
      <p className="label" data-toon="goed">
        {melding}
      </p>
      <p className="text-[13px] stil">Bezorg deze link zelf (mail of Teams). Wie hem opent, kiest een eigen wachtwoord. Hij werkt één keer, binnen 24 uur.</p>
      <code className="text-[12.5px] break-all bg-[rgba(0,0,0,.3)] px-3 py-2">{link}</code>
      <button
        type="button"
        className="knop knop-klein self-start"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setGekopieerd(true);
        }}
      >
        {gekopieerd ? "Gekopieerd" : "Link kopiëren"}
      </button>
    </div>
  );
}

export function Uitnodigen() {
  const [staat, actie, bezig] = useActionState(uitnodigen, { ok: false } as LinkResultaat);
  const f = staat.velden ?? {};
  return (
    <div className="flex flex-col gap-5">
      <form action={actie} className="flex flex-col gap-5" key={staat.link ?? "leeg"}>
        <Tekstveld naam="naam" label="Naam" max={80} fout={f.naam} />
        <Tekstveld naam="email" label="E-mailadres" type="email" max={200} fout={f.email} />
        <Keuze naam="rol" label="Rol" waarde="beheerder" opties={ROLLEN} fout={f.rol} hint="Beheerder past ook de homepage aan en beheert gebruikers. Redacteur werkt aan vacatures, blog, team en media." />
        {!staat.ok && staat.melding && <p className="veld-fout !mt-0">{staat.melding}</p>}
        <button className="knop self-start" disabled={bezig}>
          {bezig ? "Bezig" : "Account aanmaken"}
        </button>
      </form>
      {staat.ok && staat.link && <LinkKaart link={staat.link} melding={staat.melding} />}
    </div>
  );
}

export function GebruikerRij({ g, ikZelf }: { g: { id: string; naam: string; rol: string }; ikZelf: boolean }) {
  const [staat, actie, bezig] = useActionState(nieuweLink, { ok: false } as LinkResultaat);
  const creator = g.rol === "creator";
  return (
    <li className="py-4 border-t border-[var(--lijn)] first:border-0 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-[160px] flex-1">
          <p className="font-medium">
            {g.naam || "Naamloos"} {ikZelf && <span className="zwak text-[13px]">(jij)</span>}
          </p>
          <p className="text-[13px] stil">{creator ? "Creator (SteylVisuals)" : g.rol === "beheerder" ? "Beheerder" : "Redacteur"}</p>
        </div>
        {!creator && !ikZelf && (
          <>
            <form action={rolWijzigen} className="flex items-center gap-2">
              <input type="hidden" name="id" value={g.id} />
              <select name="rol" defaultValue={g.rol} className="invoer !w-auto text-[14px]" aria-label={`Rol van ${g.naam}`}>
                {ROLLEN.map((r) => (
                  <option key={r.waarde} value={r.waarde}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button className="knop knop-stil knop-klein">Wijzig</button>
            </form>
            <form action={actie}>
              <input type="hidden" name="id" value={g.id} />
              <button className="knop knop-stil knop-klein" disabled={bezig}>
                Nieuwe inloglink
              </button>
            </form>
            <div className="[&_.knop]:min-h-[34px] [&_.knop]:text-[13px] [&_.knop]:px-3">
              <VerwijderKnop actie={gebruikerVerwijderen} id={g.id} wat={`het account van ${g.naam}`} />
            </div>
          </>
        )}
      </div>
      {staat.ok && staat.link && <LinkKaart link={staat.link} melding={staat.melding} />}
      {!staat.ok && staat.melding && <p className="veld-fout">{staat.melding}</p>}
    </li>
  );
}
