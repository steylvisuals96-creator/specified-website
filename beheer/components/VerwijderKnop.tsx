"use client";

import { useRef } from "react";

/** Verwijderen met een bevestiging in een eigen dialoog (geen browser-confirm). */
export default function VerwijderKnop({ actie, id, wat, label = "Verwijderen" }: { actie: (fd: FormData) => Promise<void>; id: string; wat: string; label?: string }) {
  const dialoog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="knop knop-gevaar" onClick={() => dialoog.current?.showModal()}>
        {label}
      </button>
      <dialog
        ref={dialoog}
        className="glas m-auto max-w-[420px] w-[calc(100%-2rem)] p-0 text-[var(--tekst)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === dialoog.current && dialoog.current?.close()}
      >
        <form action={actie} className="p-6 bg-[rgba(28,28,31,.92)]">
          <input type="hidden" name="id" value={id} />
          <h2 className="text-[34px]">Zeker weten?</h2>
          <p className="stil mt-3">Je verwijdert {wat}. Dit kan niet ongedaan gemaakt worden.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button className="knop knop-gevaar">Ja, verwijderen</button>
            <button type="button" className="knop knop-stil" onClick={() => dialoog.current?.close()} autoFocus>
              Annuleren
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
