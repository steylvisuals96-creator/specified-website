"use client";

import { useActionState, useEffect, useRef } from "react";
import { notitieToevoegen, type NotitieStaat } from "@/app/(app)/dashboard/kandidaten/[id]/actions";
import { knopSecundair } from "@/components/DashboardShell";

export function Notitie({ id }: { id: string }) {
  const [staat, actie, bezig] = useActionState<NotitieStaat, FormData>(notitieToevoegen.bind(null, id), {});
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (staat.ok) form.current?.reset();
  }, [staat.ok]);

  return (
    <form ref={form} action={actie} className="border-b border-line pb-8">
      <label htmlFor="notitie" className="text-sm text-bone-100">
        Notitie toevoegen
      </label>
      <textarea
        id="notitie"
        name="notitie"
        rows={3}
        maxLength={5000}
        placeholder="Wat is er besproken, wat is de volgende stap?"
        aria-invalid={staat.fout ? true : undefined}
        aria-describedby={staat.fout ? "notitie-fout" : undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) form.current?.requestSubmit();
        }}
        className="mt-2 block w-full resize-y border border-olive-600 bg-transparent px-3.5 py-3 text-sm text-bone-100 placeholder:text-bone-600 hover:border-bone-600 focus:border-lime-300 focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-4">
        <p id="notitie-fout" className="text-sm text-destructive" role="alert">
          {staat.fout}
        </p>
        <button type="submit" disabled={bezig} className={`${knopSecundair} disabled:opacity-60`}>
          {bezig ? "Bezig met opslaan" : "Notitie opslaan"}
        </button>
      </div>
    </form>
  );
}
