"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CV_EXTENSIES, CV_MAX_BYTES, FORMULIEREN, type Soort, type Veld } from "@/lib/formulieren";

/**
 * Eén formulier voor sollicitatie, open sollicitatie, contact en aanvraag.
 * De velden komen uit lib/formulieren.ts; de server controleert ze opnieuw.
 * Zonder JavaScript blijft het formulier zichtbaar en zegt een regel eronder
 * hoe je ons anders bereikt.
 */
export default function Formulier({ soort, vacature }: { soort: Soort; vacature?: string }) {
  const { velden, knop, bedankt } = FORMULIEREN[soort];
  const id = useId();
  const gestart = useRef(0);
  const dankRef = useRef<HTMLDivElement>(null);
  const [bezig, setBezig] = useState(false);
  const [klaar, setKlaar] = useState(false);
  const [fout, setFout] = useState<{ tekst: string; veld?: string } | null>(null);

  useEffect(() => {
    gestart.current = Date.now();
  }, []);

  useEffect(() => {
    if (klaar) dankRef.current?.focus();
  }, [klaar]);

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bezig) return;
    const form = e.currentTarget;
    const data = new FormData(form);

    const cv = data.get("cv");
    if (cv instanceof File && cv.size > 0) {
      if (!CV_EXTENSIES.some((x) => cv.name.toLowerCase().endsWith(x))) {
        return setFout({ tekst: "Het cv moet een pdf- of Word-bestand zijn.", veld: "cv" });
      }
      if (cv.size > CV_MAX_BYTES) return setFout({ tekst: "Het cv is groter dan 4 MB.", veld: "cv" });
    }

    data.set("soort", soort);
    data.set("gestart", String(gestart.current));
    data.set("pagina", window.location.pathname);
    if (vacature) data.set("vacature", vacature);

    setBezig(true);
    setFout(null);
    try {
      const res = await fetch("/api/formulier", { method: "POST", body: data });
      const antwoord = await res.json().catch(() => null);
      if (res.ok && antwoord?.ok) {
        setKlaar(true);
        form.reset();
      } else {
        setFout({ tekst: antwoord?.fout || "Versturen lukt nu niet. Probeer het later opnieuw.", veld: antwoord?.veld });
        if (antwoord?.veld) (form.elements.namedItem(antwoord.veld) as HTMLElement | null)?.focus();
      }
    } catch {
      setFout({ tekst: "Geen verbinding. Controleer je internet en probeer opnieuw." });
    } finally {
      setBezig(false);
    }
  }

  if (klaar) {
    return (
      <div className="form__dank" role="status" tabIndex={-1} ref={dankRef}>
        <p className="form__dank-kop display display-m">Verstuurd.</p>
        <p className="lead">{bedankt}</p>
        <p className="meta">Je krijgt ook een bevestiging per e-mail. Niets ontvangen? Kijk even bij ongewenste mail.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={verstuur}>
      <div className="form__velden">
        {velden.map((v) => (
          <VeldInvoer key={v.naam} v={v} id={`${id}-${v.naam}`} fout={fout?.veld === v.naam ? fout.tekst : undefined} />
        ))}
      </div>

      {/* Valkuil voor bots; mensen en schermlezers slaan dit over. */}
      <div className="form__val" aria-hidden="true">
        <label>
          Laat dit veld leeg
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="form__akkoord">
        <input type="checkbox" name="akkoord" value="ja" required />
        <span>
          Ik ga akkoord met de verwerking van mijn gegevens zoals beschreven in de{" "}
          <Link href="/privacy" className="text-link">
            privacyverklaring
          </Link>
          .
        </span>
      </label>

      <div className="form__actie">
        <button type="submit" className="btn btn-primary" disabled={bezig}>
          {bezig ? "Bezig met versturen" : knop}
        </button>
        <p className="form__melding" role="alert">
          {fout && !fout.veld ? fout.tekst : fout?.veld === "akkoord" ? fout.tekst : ""}
        </p>
      </div>
      <noscript>
        <p className="meta">Dit formulier heeft JavaScript nodig. Je kan ons ook mailen op info@specified.be.</p>
      </noscript>
    </form>
  );
}

function VeldInvoer({ v, id, fout }: { v: Veld; id: string; fout?: string }) {
  const beschrijving = [v.hint ? `${id}-hint` : "", fout ? `${id}-fout` : ""].filter(Boolean).join(" ") || undefined;
  const gedeeld = {
    id,
    name: v.naam,
    required: v.verplicht,
    "aria-invalid": fout ? true : undefined,
    "aria-describedby": beschrijving,
  };

  return (
    <div className="form__veld" data-half={v.half || undefined}>
      <label htmlFor={id}>
        {v.label}
        {!v.verplicht && <span className="form__optioneel"> (optioneel)</span>}
      </label>
      {v.type === "textarea" ? (
        <textarea {...gedeeld} rows={5} maxLength={v.max} />
      ) : v.type === "select" ? (
        <select {...gedeeld} defaultValue="">
          <option value="">Kies</option>
          {v.opties?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : v.type === "file" ? (
        <input {...gedeeld} type="file" accept={[...CV_EXTENSIES, "application/pdf"].join(",")} />
      ) : (
        <input {...gedeeld} type={v.type} autoComplete={v.autocomplete} maxLength={v.max} />
      )}
      {v.hint && (
        <p className="form__hint" id={`${id}-hint`}>
          {v.hint}
        </p>
      )}
      {fout && (
        <p className="form__fout" id={`${id}-fout`} role="alert">
          {fout}
        </p>
      )}
    </div>
  );
}
