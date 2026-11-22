import Link from "next/link";
import { metTaal, type Taal } from "@/lib/taal";

/**
 * Schakelaar Nederlands / Engels boven een editor. Elke taal heeft eigen
 * teksten; een leeg Engels veld toont de Engelse standaardtekst van de website.
 */
export default function TaalTabs({ taal, href }: { taal: Taal; href: string }) {
  const tabs: [Taal, string][] = [
    ["nl", "Nederlands"],
    ["en", "English"],
  ];
  return (
    <nav aria-label="Taal van de teksten" className="flex gap-1 rounded-full border border-[var(--lijn)] p-1">
      {tabs.map(([t, label]) => (
        <Link
          key={t}
          href={metTaal(href, t)}
          aria-current={t === taal ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-[13.5px] font-medium ${t === taal ? "bg-[var(--limoen)] text-[var(--op-limoen)]" : "zwak hover:text-[var(--tekst)]"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
