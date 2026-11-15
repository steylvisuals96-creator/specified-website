"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Resultaat } from "@/lib/formulier";

function Knop({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="knop" disabled={pending}>
      {pending ? "Opslaan" : label}
    </button>
  );
}

const tijd = (iso: string) => new Date(iso).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });

/**
 * Vaste balk onderaan een formulier: opslaan, en of er nog niet opgeslagen
 * wijzigingen zijn. Waarschuwt bij wegnavigeren met openstaande wijzigingen.
 */
export default function OpslaanBalk({
  staat,
  formId,
  label = "Opslaan",
  extra,
}: {
  staat: Resultaat;
  formId: string;
  label?: string;
  extra?: React.ReactNode;
}) {
  const [gewijzigd, setGewijzigd] = useState(false);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;
    const aan = () => setGewijzigd(true);
    form.addEventListener("input", aan);
    form.addEventListener("change", aan);
    return () => {
      form.removeEventListener("input", aan);
      form.removeEventListener("change", aan);
    };
  }, [formId]);

  useEffect(() => {
    if (staat.ok) setGewijzigd(false);
  }, [staat]);

  useEffect(() => {
    if (!gewijzigd) return;
    const waarschuw = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", waarschuw);
    return () => removeEventListener("beforeunload", waarschuw);
  }, [gewijzigd]);

  const tekstStatus = !staat.ok && staat.melding
    ? staat.melding
    : gewijzigd
      ? "Niet opgeslagen wijzigingen"
      : staat.ok && staat.opgeslagen
        ? `${staat.melding ?? "Opgeslagen"} om ${tijd(staat.opgeslagen)}`
        : "Alles is opgeslagen";

  return (
    <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-4 z-20 mt-8">
      <div className="glas !bg-[rgba(30,30,33,.92)] flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        <p
          role="status"
          aria-live="polite"
          className={`label min-w-0 !whitespace-normal leading-snug ${!staat.ok && staat.melding ? "!text-[var(--alarm)]" : ""}`}
          data-toon={!staat.ok && staat.melding ? "let-op" : gewijzigd ? "let-op" : "goed"}
        >
          {tekstStatus}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {extra}
          <Knop label={label} />
        </div>
      </div>
    </div>
  );
}
