import Link from "next/link";
import Zijbalk from "@/components/shell/Zijbalk";

/**
 * Omhulsel van de back-office. Bewust geen "use client" en geen async: FormShell
 * (client) en de serverpagina's gebruiken het allebei. Het menu zelf staat in
 * lib/menu.ts en wordt ook door /admin gebruikt.
 */
export default function DashboardShell({
  children,
  userName,
  rol,
}: {
  children: React.ReactNode;
  /** Niet meer nodig: de zijbalk leest het pad zelf. Blijft voor oude aanroepen. */
  activePath?: string;
  userName?: string;
  rol?: string | null;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-900 text-bone-100 lg:flex-row">
      <Zijbalk userName={userName} rol={rol} />
      <main id="inhoud" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}

// ─── Gedeelde bouwstenen ─────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  aantal,
  actions,
}: {
  title: string;
  subtitle?: string;
  aantal?: number;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 px-5 pt-8 pb-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:pt-10">
      <div className="min-w-0">
        <h1 className="kop flex items-baseline gap-3 text-[2.75rem] sm:text-[3.5rem]">
          <span className="truncate">{title}</span>
          {aantal !== undefined && <span className="text-[0.62em] text-bone-600 tabular">{aantal}</span>}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-bone-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export { knopPrimair, knopSecundair, knopKlein } from "@/lib/knoppen";
import { knopPrimair, knopSecundair } from "@/lib/knoppen";

export function LimeBtn({ href, children, outline }: { href: string; children: React.ReactNode; outline?: boolean }) {
  return (
    <Link href={href} className={outline ? knopSecundair : knopPrimair}>
      {children}
    </Link>
  );
}
export const GoldBtn = LimeBtn;

export function Table({ headers: ths, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse whitespace-nowrap">
        <thead>
          <tr>
            {ths.map((h, i) => (
              <th
                key={h || i}
                scope="col"
                className="border-b border-line px-4 pb-3 text-left text-[0.8125rem] font-medium whitespace-nowrap text-bone-400 first:pl-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr]:transition-colors [&_tr:hover]:bg-ink-800">{children}</tbody>
      </table>
    </div>
  );
}

export function TD({ children, muted, bold }: { children: React.ReactNode; muted?: boolean; bold?: boolean }) {
  return (
    <td
      className={`border-b border-line px-4 py-3.5 align-middle text-sm first:pl-0 ${
        muted ? "text-bone-400" : bold ? "font-medium text-bone-100" : "text-bone-100"
      }`}
    >
      {children}
    </td>
  );
}

// Oude badgekleuren (per pagina gedefinieerd) → gedempte merkstatuskleuren.
const STATUS_KLEUR: Record<string, string> = {
  "#dffd7b": "var(--st-nieuw)",
  "#60a5fa": "var(--st-bezig)",
  "#4285f4": "var(--st-bezig)",
  "#a78bfa": "var(--st-gesprek)",
  "#e879f9": "var(--st-gesprek)",
  "#f472b6": "var(--st-klant)",
  "#fb923c": "var(--st-klant)",
  "#f59e0b": "var(--st-klant)",
  "#facc15": "var(--st-klant)",
  "#facb04": "var(--st-klant)",
  "#34d399": "var(--st-geplaatst)",
  "#f87171": "var(--st-wacht)",
  "#6b7280": "var(--st-uit)",
};

export function StatusBadge({ label, kleur }: { label: string; kleur: string }) {
  const k = STATUS_KLEUR[kleur?.toLowerCase()] ?? kleur ?? "var(--st-uit)";
  return (
    <span className="status text-sm text-bone-100" style={{ "--status-kleur": k } as React.CSSProperties}>
      {label}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-line py-16 text-center text-sm text-bone-400">{children}</div>;
}

export function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" });
}
export function fmtDateTime(d: string | Date) {
  return new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
