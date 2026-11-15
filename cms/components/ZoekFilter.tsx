"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";

export type FilterKeuze = {
  naam: string;
  label: string;
  opties: { value: string; label: string }[];
};

/**
 * Zoekveld plus optionele keuzelijsten. Alles staat in de URL (?q=…&sector=…),
 * zodat een gefilterde lijst te delen en te herladen is.
 */
export default function ZoekFilter({
  placeholder = "Zoeken",
  defaultValue = "",
  filters = [],
}: {
  placeholder?: string;
  defaultValue?: string;
  filters?: FilterKeuze[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [bezig, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function zet(naam: string, v: string) {
    const p = new URLSearchParams(params.toString());
    if (v) p.set(naam, v);
    else p.delete(naam);
    const qs = p.toString();
    startTransition(() =>
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }),
    );
  }

  function zoek(v: string) {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => zet("q", v), 250);
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div
      className="flex flex-col gap-2.5 xl:flex-row xl:items-center"
      aria-busy={bezig}
    >
      <label className="relative block xl:max-w-md xl:flex-1">
        <span className="sr-only">{placeholder}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-bone-400"
          aria-hidden
        />
        <input
          type="search"
          value={value}
          onChange={(e) => zoek(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full border border-olive-600 bg-transparent pr-10 pl-10 text-sm text-bone-100 placeholder:text-bone-600 hover:border-bone-600 focus:border-lime-300 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => zoek("")}
            aria-label="Zoekopdracht wissen"
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center text-bone-400 hover:text-bone-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </label>

      {filters.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-3 xl:flex">
          {filters.map((f) => (
            <label key={f.naam} className="relative block xl:w-52">
              <span className="sr-only">{f.label}</span>
              <select
                value={params.get(f.naam) ?? ""}
                onChange={(e) => zet(f.naam, e.target.value)}
                className="h-11 w-full appearance-none border border-olive-600 bg-ink-900 pr-10 pl-3.5 text-sm text-bone-100 hover:border-bone-600 focus:border-lime-300 focus:outline-none"
              >
                <option value="">{f.label}</option>
                {f.opties.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-bone-400"
                aria-hidden
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
