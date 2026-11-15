"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, Mail, NotebookPen, Phone, type LucideIcon } from "lucide-react";

const TYPE: Record<string, { label: string; icoon: LucideIcon }> = {
  email: { label: "E-mail", icoon: Mail },
  telefoon: { label: "Telefoon", icoon: Phone },
  meeting: { label: "Afspraak", icoon: Calendar },
  notitie: { label: "Notitie", icoon: NotebookPen },
};

function fmtDatum(d: string) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTijd(d: string) {
  return new Date(d).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
}

export type ActiviteitItem = {
  id: string;
  type: string;
  richting?: string;
  datum: string;
  onderwerp: string;
  inhoud?: string;
  van?: string;
  naar?: string;
  kandidaat?: { id: string; naam?: string; voornaam?: string; achternaam?: string } | null;
  bedrijf?: { id: string; naam?: string } | null;
};

function kandidaatNaam(k: ActiviteitItem["kandidaat"]) {
  if (!k) return null;
  return k.naam || [k.voornaam, k.achternaam].filter(Boolean).join(" ") || k.id;
}

function googleCalendarUrl(item: ActiviteitItem) {
  const start = new Date(item.datum);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.onderwerp)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(item.inhoud ?? "")}`;
}

function outlookUrl(item: ActiviteitItem) {
  const start = new Date(item.datum);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(item.onderwerp)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(item.inhoud ?? "")}`;
}

// Afzenders van inkomende mail komen van buitenaf. Alleen een kaal adres mag in
// de mailto-link, zodat niemand er extra ontvangers of een eigen tekst in stopt.
const KAAL_ADRES = /^[^\s@?&#=,;:<>"'()]+@[^\s@?&#=,;:<>"'()]+\.[a-z]{2,}$/i;

function replyHref(item: ActiviteitItem, bccEmail?: string) {
  const to = item.van && KAAL_ADRES.test(item.van) ? item.van : "";
  const subject = encodeURIComponent(`Re: ${item.onderwerp}`);
  const body = encodeURIComponent(`\n\n---\nOp ${fmtDatum(item.datum)} om ${fmtTijd(item.datum)} schreef ${item.van}:\n\n${item.inhoud ?? ""}`);
  const bcc = bccEmail ? `&bcc=${encodeURIComponent(bccEmail)}` : "";
  return `mailto:${to}?subject=${subject}${bcc}&body=${body}`;
}

const tekstLink = "text-sm text-bone-400 underline-offset-4 hover:text-lime-300 hover:underline";

function Activiteit({ item, showRelaties, bccEmail }: { item: ActiviteitItem; showRelaties?: boolean; bccEmail?: string }) {
  const [open, setOpen] = useState(false);
  const type = TYPE[item.type] ?? TYPE.notitie;
  const Icoon = type.icoon;
  const heeftTekst = !!item.inhoud?.trim();
  const lang = (item.inhoud?.length ?? 0) > 160;
  const kanAntwoorden = item.type === "email" && item.van && item.richting === "inkomend";

  const meta = [
    type.label + (item.richting && (item.type === "email" || item.type === "telefoon") ? (item.richting === "inkomend" ? ", inkomend" : ", uitgaand") : ""),
    fmtTijd(item.datum),
    item.van ? `van ${item.van}` : null,
    item.naar ? `naar ${item.naar}` : null,
  ].filter(Boolean);

  return (
    <li className="relative grid grid-cols-[1.5rem_1fr] gap-x-4 pb-6 last:pb-0 sm:grid-cols-[6.5rem_1.5rem_1fr]">
      <time dateTime={item.datum} className="hidden pt-0.5 text-sm tabular text-bone-400 sm:block">
        {fmtDatum(item.datum)}
      </time>
      <span className="relative flex justify-center" aria-hidden>
        <span className="absolute top-7 bottom-[-1.5rem] w-px bg-line" />
        <span className="relative z-10 grid size-6 place-items-center bg-ink-900 text-bone-400">
          <Icoon className="size-4" strokeWidth={1.6} />
        </span>
      </span>
      <div className="min-w-0">
        <p className="text-[0.9375rem] leading-snug text-bone-100">{item.onderwerp}</p>
        <p className="mt-1 text-sm text-bone-400">
          <span className="sm:hidden">{fmtDatum(item.datum)}, </span>
          {meta.join(", ")}
        </p>
        {showRelaties && (item.kandidaat || item.bedrijf) && (
          <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
            {item.kandidaat && (
              <Link href={`/dashboard/kandidaten/${item.kandidaat.id}`} className="text-bone-100 underline-offset-4 hover:text-lime-300 hover:underline">
                {kandidaatNaam(item.kandidaat)}
              </Link>
            )}
            {item.bedrijf && (
              <Link href={`/dashboard/bedrijven/${item.bedrijf.id}`} className="text-bone-100 underline-offset-4 hover:text-lime-300 hover:underline">
                {item.bedrijf.naam}
              </Link>
            )}
          </p>
        )}

        {heeftTekst && (
          <div className="mt-2">
            <p className={`text-sm leading-relaxed whitespace-pre-wrap text-bone-400 ${open || !lang ? "" : "line-clamp-2"}`}>{item.inhoud}</p>
            {lang && (
              <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={`${tekstLink} mt-1 inline-flex items-center gap-1`}>
                {open ? "Minder tonen" : "Alles tonen"}
                <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
              </button>
            )}
          </div>
        )}

        {(item.type === "meeting" || kanAntwoorden) && (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {item.type === "meeting" && (
              <>
                <a href={googleCalendarUrl(item)} target="_blank" rel="noopener noreferrer" className={tekstLink}>
                  In Google Agenda
                </a>
                <a href={outlookUrl(item)} target="_blank" rel="noopener noreferrer" className={tekstLink}>
                  In Outlook
                </a>
                <a href={`/api/agenda/ics/${item.id}`} className={tekstLink}>
                  Als .ics downloaden
                </a>
              </>
            )}
            {kanAntwoorden && (
              <a href={replyHref(item, bccEmail)} className={tekstLink}>
                Beantwoorden
              </a>
            )}
          </p>
        )}
      </div>
    </li>
  );
}

export function ActiviteitFeed({ items, showRelaties, bccEmail }: { items: ActiviteitItem[]; showRelaties?: boolean; bccEmail?: string }) {
  if (items.length === 0) {
    return <p className="py-6 text-sm text-bone-400">Nog geen activiteiten. Voeg hierboven een notitie toe of log een gesprek.</p>;
  }
  return (
    <ol className="[&>li:last-child_span.absolute]:hidden">
      {items.map((item) => (
        <Activiteit key={item.id} item={item} showRelaties={showRelaties} bccEmail={bccEmail} />
      ))}
    </ol>
  );
}
