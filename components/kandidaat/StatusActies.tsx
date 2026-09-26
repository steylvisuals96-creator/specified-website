"use client";

import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { zetKandidaatStatus } from "@/app/(app)/dashboard/kandidaten/[id]/actions";
import { KANDIDAAT_STAPPEN, KANDIDAAT_STATUS } from "@/lib/labels";
import { knopPrimair } from "@/components/DashboardShell";

// Wat de primaire knop zegt, per huidige status: de logische volgende stap.
const VOLGENDE: Record<string, { status: string; label: string }> = {
  nieuw: { status: "gescreend", label: "Markeren als gescreend" },
  gescreend: { status: "in_gesprek", label: "In gesprek zetten" },
  in_gesprek: { status: "voorgesteld", label: "Voorstellen aan klant" },
  voorgesteld: { status: "interview_klant", label: "Interview bij klant" },
  interview_klant: { status: "geplaatst", label: "Markeren als geplaatst" },
  on_hold: { status: "in_gesprek", label: "Weer in gesprek zetten" },
};

export function StatusActies({ id, status }: { id: string; status: string }) {
  const [bezig, start] = useTransition();
  const volgende = VOLGENDE[status];
  const zet = (s: string) => start(() => zetKandidaatStatus(id, s));

  return (
    <div className="flex flex-wrap items-center gap-2.5" aria-busy={bezig}>
      {volgende && (
        <button type="button" disabled={bezig} onClick={() => zet(volgende.status)} className={`${knopPrimair} disabled:opacity-60`}>
          {bezig ? "Bezig met opslaan" : volgende.label}
        </button>
      )}
      <label className="relative block">
        <span className="sr-only">Status wijzigen</span>
        <select
          value=""
          disabled={bezig}
          onChange={(e) => e.target.value && zet(e.target.value)}
          className="h-10 appearance-none border border-olive-600 bg-ink-900 pr-9 pl-3.5 text-sm font-semibold text-bone-100 hover:border-lime-300 focus:border-lime-300 focus:outline-none disabled:opacity-60"
        >
          <option value="">Status wijzigen</option>
          {Object.entries(KANDIDAAT_STATUS)
            .filter(([k]) => k !== status)
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-bone-400" aria-hidden />
      </label>
    </div>
  );
}

/** Horizontale voortgangslijn door de pipeline-stappen. */
export function StatusLijn({ status }: { status: string }) {
  const index = KANDIDAAT_STAPPEN.indexOf(status as (typeof KANDIDAAT_STAPPEN)[number]);
  const buitenLijn = index === -1;

  return (
    <div>
      <ol className="grid grid-cols-6" aria-label="Voortgang in de pipeline">
        {KANDIDAAT_STAPPEN.map((stap, i) => {
          const gedaan = !buitenLijn && i < index;
          const huidig = i === index;
          return (
            <li key={stap} aria-current={huidig ? "step" : undefined} className="relative flex flex-col items-start">
              <span className="relative flex h-4 w-full items-center" aria-hidden>
                <span className={`absolute inset-x-0 h-px ${gedaan || huidig ? "bg-lime-300" : "bg-olive-600"} ${i === 0 ? "left-2" : ""}`} />
                <span
                  className={`relative z-10 size-3 ${
                    huidig ? "bg-lime-300 outline-4 outline-lime-300/20" : gedaan ? "bg-lime-300" : "border border-olive-600 bg-ink-900"
                  }`}
                />
              </span>
              <span className={`mt-3 pr-2 text-[0.8125rem] leading-tight ${huidig ? "text-lime-300" : gedaan ? "text-bone-100" : "text-bone-400"}`}>
                {KANDIDAAT_STATUS[stap].label}
              </span>
            </li>
          );
        })}
      </ol>
      {buitenLijn && KANDIDAAT_STATUS[status] && (
        <p className="mt-3 text-sm text-bone-400">
          Staat op <span className="text-bone-100">{KANDIDAAT_STATUS[status].label.toLowerCase()}</span> en loopt niet mee in de pipeline.
        </p>
      )}
    </div>
  );
}
