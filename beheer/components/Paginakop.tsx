import Link from "next/link";

/**
 * Kop van elke pagina: titel in Bebas met een accentwoord in Instrument Serif,
 * een maatlijn eronder zoals op een technische tekening, en rechts de acties.
 */
export default function Paginakop({
  titel,
  accent,
  uitleg,
  terug,
  vul = 18,
  children,
}: {
  titel: string;
  accent?: string;
  uitleg?: React.ReactNode;
  terug?: { href: string; label: string };
  /** Hoeveel van de maatlijn limoen kleurt, in procent. */
  vul?: number;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 md:mb-10">
      {terug && (
        <Link href={terug.href} className="tekstknop inline-block mb-4">
          {terug.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <h1 className="text-[clamp(2.75rem,6vw,4.5rem)] min-w-0 break-words">
          {titel} {accent && <span className="accent text-[0.6em] align-[0.1em]">{accent}</span>}
        </h1>
        {children && <div className="flex flex-wrap items-center gap-3 pb-1.5">{children}</div>}
      </div>
      <div className="maatlijn" style={{ ["--vul" as string]: `${vul}%` }} aria-hidden="true" />
      {uitleg && <p className="stil mt-4 max-w-[64ch]">{uitleg}</p>}
    </header>
  );
}
