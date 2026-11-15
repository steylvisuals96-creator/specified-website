"use client";

import { useRef, useState } from "react";
import type { Media } from "@/lib/data";
import MediaUpload from "./MediaUpload";

/**
 * Kies een beeld uit de mediabibliotheek of upload er meteen een. Bewaart het
 * id in een verborgen veld met de opgegeven naam.
 */
export default function MediaKiezer({
  naam,
  label,
  waarde,
  media,
  onWijzig,
}: {
  naam: string;
  label: string;
  waarde?: string | null;
  media: Pick<Media, "id" | "alt" | "bestandsnaam">[];
  onWijzig?: (id: string | null) => void;
}) {
  const [id, setId] = useState<string | null>(waarde ?? null);
  const dialoog = useRef<HTMLDialogElement>(null);
  const verborgen = useRef<HTMLInputElement>(null);

  const kies = (nieuw: string | null) => {
    setId(nieuw);
    onWijzig?.(nieuw);
    dialoog.current?.close();
    // Het formulier hoort de wijziging (voor "Niet opgeslagen wijzigingen").
    requestAnimationFrame(() => verborgen.current?.dispatchEvent(new Event("change", { bubbles: true })));
  };

  return (
    <div>
      <p className="veld-label mb-2">{label}</p>
      <div className="flex items-center gap-4">
        <div className="w-24 aspect-[4/3] border border-[var(--glasrand)] bg-[rgba(0,0,0,.25)] overflow-hidden grid place-items-center">
          {id ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/m/${id}`} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[12px] zwak">Geen beeld</span>
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <button type="button" className="knop knop-stil knop-klein" onClick={() => dialoog.current?.showModal()}>
            {id ? "Ander beeld" : "Beeld kiezen"}
          </button>
          {id && (
            <button type="button" className="tekstknop" onClick={() => kies(null)}>
              Weghalen
            </button>
          )}
        </div>
      </div>
      <input ref={verborgen} type="hidden" name={naam} value={id ?? ""} readOnly />

      <dialog
        ref={dialoog}
        aria-label={label}
        className="glas m-auto w-[min(860px,calc(100%-2rem))] max-h-[86dvh] p-0 text-[var(--tekst)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === dialoog.current && dialoog.current?.close()}
      >
        <div className="p-5 md:p-6 bg-[rgba(28,28,31,.94)] flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[34px]">{label}</h2>
            <button type="button" className="knop knop-stil knop-klein" onClick={() => dialoog.current?.close()}>
              Sluiten
            </button>
          </div>
          <MediaUpload onKlaar={(nieuw) => kies(nieuw)} />
          {media.length === 0 ? (
            <p className="stil">Nog geen beelden in de bibliotheek.</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto max-h-[46dvh] pr-1">
              {media.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => kies(m.id)}
                    aria-pressed={m.id === id}
                    className={`block w-full aspect-[4/3] overflow-hidden border transition-colors ${m.id === id ? "border-[var(--limoen)]" : "border-[var(--glasrand)] hover:border-[var(--streep)]"}`}
                    title={m.alt || m.bestandsnaam}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/m/${m.id}`} alt={m.alt || m.bestandsnaam} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </div>
  );
}
